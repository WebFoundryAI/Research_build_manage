import { corsErrorResponse, corsOptionsResponse, corsResponse, requireUser } from "../_shared/secrets.ts";

function textSignature(page: { content?: { h1?: string; intro?: string; sections?: Array<{ title?: string; intent?: string }> } }) {
  const h1 = page.content?.h1 ?? "";
  const intro = page.content?.intro ?? "";
  const sections = page.content?.sections ?? [];
  return [h1, intro, ...sections.map((section) => `${section.title ?? ""} ${section.intent ?? ""}`)]
    .join(" ")
    .toLowerCase();
}

function similarity(a: string, b: string) {
  const tokensA = new Set(a.split(/\s+/).filter((token) => token.length > 2));
  const tokensB = new Set(b.split(/\s+/).filter((token) => token.length > 2));
  if (tokensA.size === 0 && tokensB.size === 0) return 0;
  const intersection = new Set([...tokensA].filter((token) => tokensB.has(token)));
  const union = new Set([...tokensA, ...tokensB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    await requireUser(req);
    const { pages } = await req.json();
    if (!Array.isArray(pages) || pages.length === 0) {
      return corsErrorResponse(req, "pages are required", 400);
    }

    const signatures = pages.map((page: any) => textSignature(page));
    const results = pages.map((page: any, index: number) => {
      let bestScore = 0;
      let bestIndex = 0;
      signatures.forEach((signature: string, compareIndex: number) => {
        if (compareIndex === index) return;
        const score = similarity(signatures[index], signature);
        if (score > bestScore) {
          bestScore = score;
          bestIndex = compareIndex;
        }
      });

      let status: "pass" | "warn" | "fail" = "pass";
      if (bestScore >= 0.7) status = "fail";
      else if (bestScore >= 0.5) status = "warn";

      return {
        slug: String(page.slug ?? "page"),
        displayName: String(page.display_name ?? page.slug ?? "Page"),
        matchedSlug: String(pages[bestIndex]?.slug ?? ""),
        matchedDisplayName: String(pages[bestIndex]?.display_name ?? pages[bestIndex]?.slug ?? ""),
        score: bestScore,
        status,
      };
    });

    return corsResponse(req, { results });
  } catch (error) {
    return corsErrorResponse(req, error instanceof Error ? error.message : String(error), 500);
  }
});
