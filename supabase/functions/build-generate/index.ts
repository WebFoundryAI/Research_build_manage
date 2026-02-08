import { corsErrorResponse, corsOptionsResponse, corsResponse, getSecretValue, requireUser } from "../_shared/secrets.ts";

function titleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    const user = await requireUser(req);
    const { build, services, areas } = await req.json();

    if (!build || !Array.isArray(services)) {
      return corsErrorResponse(req, "build and services are required", 400);
    }

    const openaiKey = await getSecretValue(user.id, "openai_api_key");
    if (!openaiKey) {
      return corsErrorResponse(req, "OpenAI API key not configured", 400);
    }

    const safeServices = services.slice(0, 10);
    const safeAreas = Array.isArray(areas) ? areas.slice(0, 10) : [];

    const pages = [
      {
        page_type: "Home",
        display_name: `${build.brand_name} in ${build.city}`,
        slug: "home",
        content: {
          h1: `${build.brand_name} – Trusted ${build.city} Specialists`,
          intro: `Serving ${build.city} and surrounding areas with responsive, high-quality service.`,
          cta: `Call ${build.phone} for same-day support`,
          sections: [
            { title: "Why choose us", intent: "Trust signals and experience" },
            { title: "Our services", intent: "Overview of core offerings" },
            { title: "Coverage", intent: "Areas served and response times" },
          ],
        },
        images: [
          { placement: "hero", prompt: `Friendly technician at ${build.brand_name} service van in ${build.city}` },
          { placement: "testimonial", prompt: "Happy homeowner giving a thumbs up" },
        ],
      },
    ];

    safeServices.forEach((service: { slug: string; name: string }) => {
      pages.push({
        page_type: "Service",
        display_name: service.name,
        slug: service.slug,
        content: {
          h1: `${service.name} in ${build.city}`,
          intro: `Fast, compliant ${service.name.toLowerCase()} for homes and businesses.`,
          cta: `Book ${service.name.toLowerCase()} today`,
          sections: [
            { title: "What to expect", intent: "Explain the process" },
            { title: "Pricing guidance", intent: "Set expectations" },
            { title: "FAQs", intent: "Common customer questions" },
          ],
        },
        images: [
          { placement: "hero", prompt: `Technician performing ${service.name.toLowerCase()} work` },
          { placement: "detail", prompt: `Close-up of tools used for ${service.name.toLowerCase()}` },
        ],
      });
    });

    safeAreas.forEach((area: { slug: string; name: string }) => {
      pages.push({
        page_type: "Location",
        display_name: `${titleCase(area.name)} Services`,
        slug: area.slug,
        content: {
          h1: `${build.brand_name} in ${titleCase(area.name)}`,
          intro: `Local teams serving ${area.name} with rapid response.`,
          cta: `Request service in ${titleCase(area.name)}`,
          sections: [
            { title: "Local highlights", intent: "Area-specific trust" },
            { title: "Services available", intent: "List of offerings" },
          ],
        },
        images: [
          { placement: "hero", prompt: `Service van parked in ${titleCase(area.name)}` },
        ],
      });
    });

    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: build.brand_name,
      address: build.address,
      areaServed: [build.city, ...safeAreas.map((area: { name: string }) => area.name)],
      telephone: build.phone,
      serviceType: safeServices.map((service: { name: string }) => service.name),
    };

    const sitemap = pages.map((page) => ({
      loc: `/${page.slug}`,
      priority: page.page_type === "Home" ? "1.0" : "0.8",
    }));

    const robots = `User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml`;

    return corsResponse(req, { content: { pages, schema, sitemap, robots } });
  } catch (error) {
    return corsErrorResponse(req, error instanceof Error ? error.message : String(error), 500);
  }
});
