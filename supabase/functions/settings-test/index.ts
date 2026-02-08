import { z } from "https://esm.sh/zod@3.23.8";
import {
  corsErrorResponse,
  corsOptionsResponse,
  corsResponse,
  getSecretValue,
  requireUser,
} from "../_shared/secrets.ts";

const PayloadSchema = z.object({
  provider: z.enum(["dataforseo", "openai", "google", "cloudflare"]),
});

async function responseToMessage(response: Response) {
  const text = await response.text();
  return text.length > 300 ? `${text.slice(0, 300)}…` : text;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    const user = await requireUser(req);
    const json = await req.json();
    const parsed = PayloadSchema.safeParse(json);
    if (!parsed.success) {
      return corsErrorResponse(req, "provider is required", 400);
    }

    const provider = parsed.data.provider;
    console.info("settings-test", { userId: user.id, provider });

    if (provider === "dataforseo") {
      const login = await getSecretValue(user.id, "dataforseo_login");
      const password = await getSecretValue(user.id, "dataforseo_password");
      const token = await getSecretValue(user.id, "dataforseo_token");
      const authValue =
        login && password
          ? btoa(`${login}:${password}`)
          : token
          ? btoa(`${token}:`)
          : null;

      if (!authValue) {
        return corsErrorResponse(req, "Missing DataForSEO credentials.", 400);
      }

      const response = await fetch("https://api.dataforseo.com/v3/appendix/status", {
        headers: { Authorization: `Basic ${authValue}` },
      });

      if (!response.ok) {
        const message = await responseToMessage(response);
        return corsErrorResponse(req, `DataForSEO error: ${message}`, response.status);
      }

      return corsResponse(req, { ok: true, provider, status: response.status });
    }

    if (provider === "openai") {
      const key = await getSecretValue(user.id, "openai_api_key");
      if (!key) {
        return corsErrorResponse(req, "Missing OpenAI API key.", 400);
      }

      const response = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${key}` },
      });

      if (!response.ok) {
        const message = await responseToMessage(response);
        return corsErrorResponse(req, `OpenAI error: ${message}`, response.status);
      }

      return corsResponse(req, { ok: true, provider, status: response.status });
    }

    if (provider === "google") {
      const key = await getSecretValue(user.id, "google_api_key");
      if (!key) {
        return corsErrorResponse(req, "Missing Google API key.", 400);
      }

      const response = await fetch(`https://www.googleapis.com/discovery/v1/apis?key=${encodeURIComponent(key)}`);
      if (!response.ok) {
        const message = await responseToMessage(response);
        return corsErrorResponse(req, `Google API error: ${message}`, response.status);
      }

      return corsResponse(req, { ok: true, provider, status: response.status });
    }

    if (provider === "cloudflare") {
      const key = await getSecretValue(user.id, "cloudflare_api_key");
      if (!key) {
        return corsErrorResponse(req, "Missing Cloudflare API token.", 400);
      }

      const response = await fetch("https://api.cloudflare.com/client/v4/user/tokens/verify", {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!response.ok) {
        const message = await responseToMessage(response);
        return corsErrorResponse(req, `Cloudflare error: ${message}`, response.status);
      }

      return corsResponse(req, { ok: true, provider, status: response.status });
    }

    return corsErrorResponse(req, "Unsupported provider", 400);
  } catch (error) {
    return corsErrorResponse(req, error instanceof Error ? error.message : String(error), 500);
  }
});
