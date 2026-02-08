import { buildSecretMetadata, corsErrorResponse, corsOptionsResponse, corsResponse, getSecretValue, requireUser } from "../_shared/secrets.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    const user = await requireUser(req);
    const { key } = await req.json();

    if (!key) {
      return corsErrorResponse(req, "key is required", 400);
    }

    const value = await getSecretValue(user.id, String(key));
    const metadata = buildSecretMetadata(value);
    return corsResponse(req, { found: Boolean(value), metadata });
  } catch (error) {
    return corsErrorResponse(req, error instanceof Error ? error.message : String(error), 401);
  }
});
