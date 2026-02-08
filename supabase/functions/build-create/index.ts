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
    const body = await req.json();
    const {
      brandName,
      city,
      address,
      phone,
      tier,
      radiusMiles,
      overrideServiceCount,
      services,
    } = body ?? {};

    if (!brandName || !city || !address || !phone || !tier || !radiusMiles) {
      return corsErrorResponse(req, "Missing required build fields", 400);
    }

    const normalizedServices = Array.isArray(services)
      ? services.map(normalizeService).filter(Boolean)
      : [];

    if (normalizedServices.length === 0) {
      return corsErrorResponse(req, "At least one service is required", 400);
    }

    const build = {
      id: crypto.randomUUID(),
      brand_name: String(brandName),
      city: String(city),
      address: String(address),
      phone: String(phone),
      tier: String(tier),
      radius_miles: Number(radiusMiles),
      override_service_count: overrideServiceCount ? Number(overrideServiceCount) : null,
      services: normalizedServices,
    };

    return corsResponse(req, { build });
  } catch (error) {
    return corsErrorResponse(req, error instanceof Error ? error.message : String(error), 500);
  }
});
