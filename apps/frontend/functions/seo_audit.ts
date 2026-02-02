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

function pick(re: RegExp, html: string) {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

export async function audit(url: string) {
  const res = await fetch(url, { redirect: 'follow' });
  const html = await res.text();

  const title = pick(/<title[^>]*>([\s\S]*?)<\/title>/i, html);
  const description = pick(
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i,
    html,
  );
  const canonical = pick(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i, html);
  const h1Count = (html.match(/<h1\b/gi) || []).length;

  const issues: Array<{ severity: 'high' | 'medium' | 'low'; key: string; description: string }> = [];
  if (!title) issues.push({ severity: 'high', key: 'missing_title', description: 'Missing <title> tag.' });
  if (!description)
    issues.push({ severity: 'medium', key: 'missing_meta_description', description: 'Missing meta description.' });
  if (!canonical)
    issues.push({ severity: 'medium', key: 'missing_canonical', description: 'Missing rel=canonical tag.' });
  if (h1Count === 0) issues.push({ severity: 'medium', key: 'missing_h1', description: 'No H1 found.' });
  if (h1Count > 1) issues.push({ severity: 'low', key: 'multiple_h1', description: 'Multiple H1 tags found.' });

  const score = Math.max(0, 100 - issues.reduce((acc, i) => acc + (i.severity === 'high' ? 25 : i.severity === 'medium' ? 12 : 6), 0));
  return {
    url,
    fetched: { ok: res.ok, status: res.status },
    snapshot: { title, description, canonical, h1Count },
    issues,
    score,
    auditedAt: new Date().toISOString(),
  };
}

export const onRequestGet = async (context: Context) => {
  const u = new URL(context.request.url);
  const domain = u.searchParams.get('domain') || u.searchParams.get('url');
  if (!domain) return json({ ok: false, error: 'Missing domain' }, 400);
  const url = domain.startsWith('http') ? domain : `https://${domain}`;
  try {
    return json(await audit(url));
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message ?? e) }, 500);
  }
};

export const onRequestPost = async (context: Context) => {
  try {
    const { url } = await context.request.json();
    if (!url) return json({ ok: false, error: 'Missing url' }, 400);
    const full = String(url).startsWith('http') ? String(url) : `https://${String(url)}`;
    return json(await audit(full));
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message ?? e) }, 500);
  }
};
