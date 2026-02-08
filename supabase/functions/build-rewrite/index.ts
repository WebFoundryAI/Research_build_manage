import { corsErrorResponse, corsOptionsResponse, corsResponse, getSecretValue, requireUser } from "../_shared/secrets.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    const user = await requireUser(req);
    const { sourcePage, matchedPage, similarityScore } = await req.json();

    if (!sourcePage || !matchedPage) {
      return corsErrorResponse(req, "sourcePage and matchedPage are required", 400);
    }

    const openaiKey = await getSecretValue(user.id, "openai_api_key");
    if (!openaiKey) {
      return corsErrorResponse(req, "OpenAI API key not configured", 400);
    }

    const directives = {
      summary: `Differentiate ${sourcePage.display_name} from ${matchedPage.display_name} by emphasizing unique services, local context, and customer outcomes.`,
      differentiation_strategy: `Reduce overlap by reordering sections and adding location-specific proof points. Similarity score: ${(Number(similarityScore) * 100).toFixed(1)}%.`,
      directives: [
        {
          section: "Intro",
          current_issue: "Intro overlaps with similar page structure.",
          rewrite_instruction: "Add a location-specific lead and include a unique value proposition.",
          suggested_angle: "Highlight response times and local expertise.",
        },
        {
          section: "Services",
          current_issue: "Service list mirrors competitor page.",
          rewrite_instruction: "Prioritize top-performing services and include unique proof points.",
          suggested_angle: "Emphasize certifications and guarantees.",
        },
        {
          section: "CTA",
          current_issue: "CTA wording is too generic.",
          rewrite_instruction: "Use a stronger call-to-action with a time-bound incentive.",
          suggested_angle: "Mention same-day booking or priority slots.",
        },
      ],
    };

    return corsResponse(req, { directives });
  } catch (error) {
    return corsErrorResponse(req, error instanceof Error ? error.message : String(error), 500);
  }
});
