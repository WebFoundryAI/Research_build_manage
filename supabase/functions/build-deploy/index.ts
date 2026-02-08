import { corsErrorResponse, corsOptionsResponse, corsResponse, requireUser } from "../_shared/secrets.ts";

function buildPromptA(build: any, services: any[], content: any) {
  return `You are deploying a Rank-to-Rent site for ${build.brand_name} in ${build.city}.\n\nCreate the site structure and pages based on the following page inventory:\n${content.pages.map((page: any) => `- ${page.display_name} (${page.page_type}) /${page.slug}`).join("\n")}\n\nUse the brand voice: professional, trustworthy, locally focused. Output a project structure with navigation and page slugs.`;
}

function buildPromptB(build: any, areas: any[], services: any[]) {
  return `Generate local landing pages for the following service areas:\n${areas.map((area: any) => `- ${area.name} (${area.slug})`).join("\n")}\n\nServices to highlight:\n${services.map((service: any) => `- ${service.name}`).join("\n")}\n\nEnsure each location page is unique and references local context.`;
}

function buildPromptC(content: any) {
  return `Add JSON-LD schema, sitemap.xml, and robots.txt using the following data:\n\nSchema:\n${JSON.stringify(content.schema, null, 2)}\n\nSitemap entries:\n${content.sitemap.map((entry: any) => entry.loc).join("\n")}\n\nRobots.txt:\n${content.robots}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    await requireUser(req);
    const { build, areas, services, content } = await req.json();
    if (!build || !content) {
      return corsErrorResponse(req, "build and content are required", 400);
    }

    const safeAreas = Array.isArray(areas) ? areas : [];
    const safeServices = Array.isArray(services) ? services : [];

    const prompts = [
      {
        id: "A",
        title: "Prompt A – Scaffold pages",
        description: "Create the site structure and base pages.",
        disabled: false,
        whenToPaste: "Paste first, before any location pages are generated.",
        whatToVerify: ["Navigation matches page inventory", "Slug structure is correct"],
        prompt: buildPromptA(build, safeServices, content),
      },
      {
        id: "B",
        title: "Prompt B – Location pages",
        description: "Generate area-specific service pages.",
        disabled: safeAreas.length === 0,
        whenToPaste: "Paste after Prompt A, once base pages are created.",
        whatToVerify: ["All area pages are generated", "Location-specific copy is unique"],
        prompt: safeAreas.length > 0 ? buildPromptB(build, safeAreas, safeServices) : "",
      },
      {
        id: "C",
        title: "Prompt C – Finalize deployment",
        description: "Add schema, sitemap, and robots.txt.",
        disabled: false,
        whenToPaste: "Paste last, after all pages are created and verified.",
        whatToVerify: [
          "sitemap.xml is accessible at /sitemap.xml",
          "robots.txt allows crawling of public pages",
          "JSON-LD schema appears in page source",
          "Google Rich Results Test shows valid schema",
        ],
        prompt: buildPromptC(content),
      },
    ];

    return corsResponse(req, { prompts });
  } catch (error) {
    return corsErrorResponse(req, error instanceof Error ? error.message : String(error), 500);
  }
});
