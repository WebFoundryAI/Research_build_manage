import { corsErrorResponse, corsOptionsResponse, corsResponse, requireUser } from "../_shared/secrets.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    await requireUser(req);
    const { domain } = await req.json();
    if (!domain) {
      return corsErrorResponse(req, "domain is required", 400);
    }

    return corsResponse(req, {
      ok: true,
      result: {
        domain: String(domain),
        status: "queued",
        message: "SEO audit endpoint is ready. Connect a server-side audit provider to enable results.",
      },
    });
  } catch (error) {
    return corsErrorResponse(req, error instanceof Error ? error.message : String(error), 500);
  }
});
