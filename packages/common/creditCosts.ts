// packages/common/creditCosts.ts
//
// Credit cost constants for various operations within the unified platform.
// Each tool from the original repositories consumed an API quota in one form
// or another (DataForSEO tokens, OpenAI tokens, etc.).  To provide a
// consistent experience in the unified tool, define the relative credit
// consumption for each feature.  These values can be adjusted in the
// future or fetched from the database at runtime.

export const CREDIT_COSTS = {
  geoGenerate: 10,      // cost in credits to generate one geo‑targeted article
  monitorCheck: 1,      // cost per website health check
  seoAudit: 5,         // cost per SEO audit
  keywordResearch: 2,   // cost to perform a keyword research query
  openCopy: 3,          // cost to generate marketing copy
};