// apps/edge-functions/functions/monitor_check.ts
//
// This Cloudflare Pages Function acts as the backend endpoint for monitoring
// websites.  It is inspired by the Daily‑website‑acesset‑checking and
// web‑asset‑tracker repositories.  The original tools periodically fetch
// website URLs, check for accessibility, capture screenshots and report
// status changes.  Here we implement a minimal placeholder that accepts a
// URL via POST and returns a fake status code.  In a full implementation
// this function should fetch the given URL, compute a health metric (status
// code, load time) and optionally take a screenshot using a headless
// browser like Puppeteer running in a separate environment.

import { Context } from "https://edge.cloudflare.com/deno/client.ts";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
    },
    status,
  });
}

async function check(url: string) {
  const started = Date.now();
  let ok = false;
  let status = 0;
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    status = res.status;
    ok = res.ok;
  } catch {
    ok = false;
    status = 0;
  }
  return { url, ok, status, ms: Date.now() - started, checkedAt: new Date().toISOString() };
}

export const onRequestGet = async (context: Context) => {
  const u = new URL(context.request.url);
  const domain = u.searchParams.get('domain') || u.searchParams.get('url');
  if (!domain) return json({ ok: false, error: 'Missing domain' }, 400);
  const url = domain.startsWith('http') ? domain : `https://${domain}`;
  return json(await check(url));
};

export const onRequestPost = async (context: Context) => {
  try {
    const { url } = await context.request.json();
    if (!url) return json({ ok: false, error: 'Missing url' }, 400);
    const full = String(url).startsWith('http') ? String(url) : `https://${String(url)}`;
    return json(await check(full));
  } catch (error) {
    return json({ ok: false, error: (error as Error).message }, 500);
  }
};