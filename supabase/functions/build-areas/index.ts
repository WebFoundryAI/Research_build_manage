import { corsErrorResponse, corsOptionsResponse, corsResponse, requireUser } from "../_shared/secrets.ts";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeAreas(input: Array<{ name?: string; slug?: string }>) {
  return input
    .map((entry) => {
      const name = String(entry.name ?? "").trim();
      const slug = entry.slug ? String(entry.slug) : slugify(name);
      if (!name || !slug) return null;
      return { name, slug };
    })
    .filter(Boolean);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    await requireUser(req);
    const body = await req.json();
    const { buildId, previewOnly, mode, names, postcode, presetPack, areas, radiusMiles } = body ?? {};

    if (!buildId && !previewOnly) {
      return corsErrorResponse(req, "buildId is required", 400);
    }

    if (Array.isArray(areas) && areas.length > 0) {
      const normalized = normalizeAreas(areas);
      return corsResponse(req, { buildId: buildId ? String(buildId) : null, areas: normalized });
    }

    const generated: Array<{ name: string; slug: string }> = [];
    if (mode === "manual" && Array.isArray(names)) {
      generated.push(...normalizeAreas(names.map((name: string) => ({ name }))));
    }

    if (mode === "postcode" && postcode) {
      const base = String(postcode).trim();
      const count = 8;
      for (let i = 1; i <= count; i += 1) {
        const name = `${base} Area ${i}`;
        generated.push({ name, slug: slugify(name) });
      }
      if (!radiusMiles) {
        // radius is optional; no extra action.
      }
    }

    if (mode === "preset" && Array.isArray(presetPack)) {
      generated.push(...normalizeAreas(presetPack.map((name: string) => ({ name }))));
    }

    return corsResponse(req, { buildId: buildId ? String(buildId) : null, areas: generated });
  } catch (error) {
    return corsErrorResponse(req, error instanceof Error ? error.message : String(error), 500);
  }
});
