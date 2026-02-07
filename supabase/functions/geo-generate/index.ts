import { corsErrorResponse, corsOptionsResponse, corsResponse, getSecretValue, requireUser } from "../_shared/secrets.ts";

function fallback(keyword: string, location: string) {
  const title = `${keyword} in ${location}: local guide (template)`;
  const body = `# ${title}\n\n` +
    `## Quick answer\n` +
    `If searching for **${keyword}** in **${location}**, prioritize businesses with strong reviews, clear pricing, and evidence of recent work.\n\n` +
    `## What to check\n` +
    `- Service coverage in ${location} (and nearby)\n` +
    `- Response times and emergency availability\n` +
    `- Transparent pricing and guarantees\n\n` +
    `## Next steps\n` +
    `Collect 3 quotes, verify insurance, and confirm availability for your postcode.`;
  return { title, body, model: "fallback", createdAt: new Date().toISOString() };
}

async function generateWithOpenAI(keyword: string, location: string, apiKey: string) {
  const prompt = `Write a concise, local SEO article about "${keyword}" in "${location}".\n` +
    `Constraints: factual tone, avoid unverifiable claims, include a short FAQ (3 Qs), and finish with a clear CTA.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a careful local SEO writer." },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
    }),
  });

  if (!res.ok) {
    return null;
  }

  const data: any = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? "";
  const titleLine = content.split("\n").find((line: string) => line.trim().length > 0) ?? "";
  return {
    title: titleLine.replace(/^#\s*/, "").slice(0, 120) || `${keyword} in ${location}`,
    body: content,
    model: data?.model ?? "openai",
    createdAt: new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    const user = await requireUser(req);
    const { keyword, location } = await req.json();
    if (!keyword) {
      return corsErrorResponse(req, "keyword is required", 400);
    }

    const value = await getSecretValue(user.id, "openai_api_key");
    if (!value) {
      return corsResponse(req, { ok: true, result: fallback(String(keyword), String(location ?? "United Kingdom")) });
    }

    const result = await generateWithOpenAI(String(keyword), String(location ?? "United Kingdom"), value);
    if (!result) {
      return corsResponse(req, { ok: true, result: fallback(String(keyword), String(location ?? "United Kingdom")) });
    }

    return corsResponse(req, { ok: true, result });
  } catch (error) {
    return corsErrorResponse(req, error instanceof Error ? error.message : String(error), 500);
  }
});
