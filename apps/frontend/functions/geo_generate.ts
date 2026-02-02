import { Context } from 'https://edge.cloudflare.com/deno/client.ts';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
    },
    status,
  });
}

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
  return { title, body, model: 'fallback', createdAt: new Date().toISOString() };
}

async function generateWithOpenAI(keyword: string, location: string, apiKey: string) {
  const prompt = `Write a concise, local SEO article about "${keyword}" in "${location}".\n` +
    `Constraints: factual tone, avoid unverifiable claims, include a short FAQ (3 Qs), and finish with a clear CTA.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: 'You are a careful local SEO writer.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${txt}`);
  }

  const data: any = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? '';
  const titleLine = content.split('\n').find((l: string) => l.trim().length > 0) ?? '';
  return {
    title: titleLine.replace(/^#\s*/, '').slice(0, 120) || `${keyword} in ${location}`,
    body: content,
    model: data?.model ?? 'openai',
    createdAt: new Date().toISOString(),
  };
}

async function handle(keyword: string, location: string, env: Record<string, string | undefined>) {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) return fallback(keyword, location);
  try {
    return await generateWithOpenAI(keyword, location, apiKey);
  } catch {
    return fallback(keyword, location);
  }
}

export const onRequestGet = async (context: Context) => {
  const u = new URL(context.request.url);
  const keyword = u.searchParams.get('keyword') ?? '';
  const location = u.searchParams.get('location') ?? 'United Kingdom';
  if (!keyword) return json({ ok: false, error: 'Missing keyword' }, 400);
  return json(await handle(keyword, location, context.env as any));
};

export const onRequestPost = async (context: Context) => {
  try {
    const { keyword, location } = await context.request.json();
    if (!keyword) return json({ ok: false, error: 'Missing keyword' }, 400);
    return json(await handle(String(keyword), String(location ?? 'United Kingdom'), context.env as any));
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message ?? e) }, 500);
  }
};
