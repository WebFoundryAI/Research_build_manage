import { corsErrorResponse, corsOptionsResponse, corsResponse, requireUser } from "../_shared/secrets.ts";

function normalizeService(input: { slug?: string; name?: string }) {
  const slug = String(input.slug ?? "").trim();
  const name = String(input.name ?? "").trim();
  if (!slug || !name) return null;
  return { slug, name };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    await requireUser(req);
    const { buildId, services } = await req.json();
    if (!buildId) {
      return corsErrorResponse(req, "buildId is required", 400);
    }

    const normalizedServices = Array.isArray(services)
      ? services.map(normalizeService).filter(Boolean)
      : [];

    if (normalizedServices.length === 0) {
      return corsErrorResponse(req, "At least one service is required", 400);
    }

    return corsResponse(req, { buildId: String(buildId), services: normalizedServices });
  } catch (error) {
    return corsErrorResponse(req, error instanceof Error ? error.message : String(error), 500);
  }
});
