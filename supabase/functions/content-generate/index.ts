// Supabase Edge Function: Content Generation
// Generates articles and content using AI providers (OpenAI, Anthropic, etc.)

import {
  getSupabaseClient,
  requireUser,
  corsResponse,
  corsErrorResponse,
  corsOptionsResponse,
  decryptValue,
} from "../_shared/secrets.ts";

interface GenerationRequest {
  keyword: string;
  prompt_template_id?: string;
  custom_prompt?: string;
  tone?: string;
  word_count?: number;
  audience?: string;
  project_id?: string;
  provider?: string; // openai, anthropic
  model?: string;
}

interface GenerationResult {
  title: string;
  content: string;
  content_markdown: string;
  meta_description: string;
  excerpt: string;
  outline: Record<string, unknown>;
  word_count: number;
  reading_time_minutes: number;
  seo_score: number;
  seo_analysis: Record<string, unknown>;
}

async function getApiKey(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  provider: string
): Promise<string | null> {
  const keyMap: Record<string, string> = {
    openai: "openai_api_key",
    anthropic: "anthropic_api_key",
  };

  const secretKey = keyMap[provider];
  if (!secretKey) return null;

  const { data } = await supabase
    .from("user_secrets")
    .select("value_encrypted")
    .eq("user_id", userId)
    .eq("key", secretKey)
    .single();

  if (!data?.value_encrypted) return null;
  return decryptValue(data.value_encrypted);
}

async function generateWithOpenAI(
  apiKey: string,
  prompt: string,
  model: string = "gpt-4o-mini"
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are an expert content writer and SEO specialist. Generate high-quality, engaging content that is optimized for search engines.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

async function generateWithAnthropic(
  apiKey: string,
  prompt: string,
  model: string = "claude-3-haiku-20240307"
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  return data.content[0]?.text || "";
}

function parseGeneratedContent(raw: string, keyword: string): GenerationResult {
  // Extract title (first # heading or first line)
  const titleMatch = raw.match(/^#\s+(.+)$/m) || raw.match(/^(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : `Article about ${keyword}`;

  // Remove title from content
  let content = raw.replace(/^#\s+.+\n*/m, "").trim();

  // Generate meta description (first 155 chars of first paragraph)
  const firstPara = content.split("\n\n")[0]?.replace(/[#*_]/g, "").trim() || "";
  const metaDescription = firstPara.length > 155 ? firstPara.slice(0, 152) + "..." : firstPara;

  // Generate excerpt (first 300 chars)
  const excerpt = firstPara.length > 300 ? firstPara.slice(0, 297) + "..." : firstPara;

  // Count words
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200); // ~200 words per minute

  // Extract outline from headers
  const headers = raw.match(/^#{2,3}\s+.+$/gm) || [];
  const outline = {
    sections: headers.map(h => ({
      level: h.startsWith("###") ? 3 : 2,
      title: h.replace(/^#{2,3}\s+/, ""),
    })),
  };

  // Calculate basic SEO score
  let seoScore = 50;
  const seoAnalysis: Record<string, { pass: boolean; message: string }> = {};

  // Check keyword in title
  if (title.toLowerCase().includes(keyword.toLowerCase())) {
    seoScore += 15;
    seoAnalysis.keywordInTitle = { pass: true, message: "Keyword found in title" };
  } else {
    seoAnalysis.keywordInTitle = { pass: false, message: "Keyword not found in title" };
  }

  // Check keyword density
  const keywordCount = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), "g")) || []).length;
  const keywordDensity = (keywordCount / wordCount) * 100;
  if (keywordDensity >= 1 && keywordDensity <= 3) {
    seoScore += 15;
    seoAnalysis.keywordDensity = { pass: true, message: `Good keyword density: ${keywordDensity.toFixed(1)}%` };
  } else {
    seoAnalysis.keywordDensity = { pass: false, message: `Keyword density: ${keywordDensity.toFixed(1)}% (aim for 1-3%)` };
  }

  // Check word count
  if (wordCount >= 1000) {
    seoScore += 10;
    seoAnalysis.wordCount = { pass: true, message: `Good word count: ${wordCount}` };
  } else {
    seoAnalysis.wordCount = { pass: false, message: `Low word count: ${wordCount} (aim for 1000+)` };
  }

  // Check headers
  if (headers.length >= 3) {
    seoScore += 10;
    seoAnalysis.headers = { pass: true, message: `Good structure with ${headers.length} headers` };
  } else {
    seoAnalysis.headers = { pass: false, message: "Add more headers to improve structure" };
  }

  return {
    title,
    content,
    content_markdown: raw,
    meta_description: metaDescription,
    excerpt,
    outline,
    word_count: wordCount,
    reading_time_minutes: readingTime,
    seo_score: Math.min(100, seoScore),
    seo_analysis: seoAnalysis,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    const user = await requireUser(req);
    const supabase = getSupabaseClient();

    const body: GenerationRequest = await req.json();
    const { keyword, prompt_template_id, custom_prompt, tone, word_count, audience, project_id, provider, model } = body;

    if (!keyword && !custom_prompt) {
      return corsErrorResponse(req, "keyword or custom_prompt is required", 400);
    }

    // Get prompt template if specified
    let promptText = custom_prompt || "";
    if (prompt_template_id && !custom_prompt) {
      const { data: template } = await supabase
        .from("prompt_templates")
        .select("prompt_text, variables")
        .eq("id", prompt_template_id)
        .single();

      if (template) {
        promptText = template.prompt_text
          .replace(/\{\{keyword\}\}/g, keyword || "")
          .replace(/\{\{audience\}\}/g, audience || "general audience")
          .replace(/\{\{tone\}\}/g, tone || "professional")
          .replace(/\{\{word_count\}\}/g, String(word_count || 1500));
      }
    }

    // Default prompt if none provided
    if (!promptText) {
      promptText = `Write a comprehensive, SEO-optimized article about "${keyword}".

Tone: ${tone || "professional"}
Target audience: ${audience || "general readers"}
Word count: approximately ${word_count || 1500} words

Include:
- An engaging title (as H1)
- An introduction that hooks the reader
- Well-structured sections with H2 and H3 headers
- Actionable insights and examples
- A conclusion with a call to action

Optimize for readability and search engines.`;
    }

    // Determine which AI provider to use
    const selectedProvider = provider || "openai";
    const selectedModel = model || (selectedProvider === "openai" ? "gpt-4o-mini" : "claude-3-haiku-20240307");

    // Get API key
    const apiKey = await getApiKey(supabase, user.id, selectedProvider);
    if (!apiKey) {
      return corsErrorResponse(
        req,
        `No API key configured for ${selectedProvider}. Please add it in Settings.`,
        400
      );
    }

    // Generate content
    const startTime = Date.now();
    let rawContent: string;

    if (selectedProvider === "anthropic") {
      rawContent = await generateWithAnthropic(apiKey, promptText, selectedModel);
    } else {
      rawContent = await generateWithOpenAI(apiKey, promptText, selectedModel);
    }

    const duration = Date.now() - startTime;

    // Parse the generated content
    const result = parseGeneratedContent(rawContent, keyword || "topic");

    // Save the article
    const { data: article, error: articleError } = await supabase
      .from("generated_articles")
      .insert({
        user_id: user.id,
        project_id: project_id || null,
        title: result.title,
        slug: result.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 100),
        meta_description: result.meta_description,
        excerpt: result.excerpt,
        content: result.content,
        content_markdown: result.content_markdown,
        outline: result.outline,
        keyword,
        word_count: result.word_count,
        reading_time_minutes: result.reading_time_minutes,
        seo_score: result.seo_score,
        seo_analysis: result.seo_analysis,
        ai_provider: selectedProvider,
        ai_model: selectedModel,
        prompt_template_id: prompt_template_id || null,
        generation_params: { tone, word_count, audience },
        status: "draft",
        generated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (articleError) {
      return corsErrorResponse(req, articleError.message, 500);
    }

    // Log usage
    await supabase.from("content_usage_logs").insert({
      user_id: user.id,
      article_id: article.id,
      action: "generate",
      ai_provider: selectedProvider,
      ai_model: selectedModel,
      tokens_used: Math.ceil(result.word_count * 1.3), // rough estimate
      duration_ms: duration,
    });

    return corsResponse(req, {
      article,
      generation: {
        provider: selectedProvider,
        model: selectedModel,
        duration_ms: duration,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return corsErrorResponse(req, message, 500);
  }
});
