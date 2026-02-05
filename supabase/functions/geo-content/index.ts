// Supabase Edge Function: GEO Content Generation
// Generates GEO-optimized content for local businesses

import {
  getSupabaseClient,
  requireUser,
  corsResponse,
  corsErrorResponse,
  corsOptionsResponse,
  getSecret,
} from "../_shared/secrets.ts";

interface BusinessInput {
  businessName: string;
  primaryCity: string;
  country: string;
  serviceAreas: string[];
  primaryServices: string[];
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  credentials?: string[];
  yearEstablished?: number;
}

interface GeneratedContent {
  metaTitle: string;
  metaDescription: string;
  answerCapsule: string;
  h1Suggestion: string;
  serviceDescriptions: { service: string; description: string }[];
  faqs: { question: string; answer: string }[];
  schemaJsonLd: object;
}

function generateMetaTitle(input: BusinessInput): string {
  const { businessName, primaryCity, primaryServices } = input;
  const mainService = primaryServices[0] || "Services";
  return `${businessName} | ${mainService} in ${primaryCity} | Trusted Local Expert`;
}

function generateMetaDescription(input: BusinessInput): string {
  const { businessName, primaryCity, primaryServices, serviceAreas } = input;
  const services = primaryServices.slice(0, 3).join(", ");
  const areas = serviceAreas.slice(0, 2).join(" & ");
  return `${businessName} offers professional ${services} in ${primaryCity}${areas ? ` and ${areas}` : ""}. Trusted local experts with fast response times. Call today for a free quote!`;
}

function generateAnswerCapsule(input: BusinessInput): string {
  const { businessName, primaryCity, primaryServices, serviceAreas, credentials } = input;
  const services = primaryServices.slice(0, 3).join(", ");
  const areas = [primaryCity, ...serviceAreas.slice(0, 3)].join(", ");
  const creds = credentials?.length ? ` They are ${credentials.slice(0, 2).join(" and ")} certified.` : "";
  return `${businessName} is a trusted local provider of ${services} serving ${areas}.${creds} They offer same-day appointments and free estimates for all services.`;
}

function generateH1(input: BusinessInput): string {
  const { primaryServices, primaryCity } = input;
  const mainService = primaryServices[0] || "Professional Services";
  return `Expert ${mainService} in ${primaryCity}`;
}

function generateServiceDescriptions(input: BusinessInput): { service: string; description: string }[] {
  const { businessName, primaryCity, primaryServices } = input;

  return primaryServices.map(service => ({
    service,
    description: `${businessName} provides professional ${service.toLowerCase()} services throughout ${primaryCity} and surrounding areas. Our experienced team delivers high-quality workmanship, transparent pricing, and reliable service. Whether you need emergency assistance or scheduled maintenance, we're here to help with all your ${service.toLowerCase()} needs.`,
  }));
}

function generateFAQs(input: BusinessInput): { question: string; answer: string }[] {
  const { businessName, primaryCity, primaryServices, serviceAreas } = input;
  const mainService = primaryServices[0]?.toLowerCase() || "services";
  const areas = [primaryCity, ...serviceAreas.slice(0, 2)].join(", ");

  return [
    {
      question: `What areas does ${businessName} serve?`,
      answer: `We proudly serve ${areas} and the surrounding communities. Contact us to confirm service availability in your specific location.`,
    },
    {
      question: `How quickly can you respond to ${mainService} emergencies?`,
      answer: `We understand that ${mainService} emergencies can't wait. We offer same-day and emergency appointments throughout ${primaryCity}, typically arriving within 1-2 hours of your call.`,
    },
    {
      question: `Do you provide free estimates?`,
      answer: `Yes! ${businessName} offers free, no-obligation estimates for all ${mainService} work. We'll assess your needs and provide transparent pricing before any work begins.`,
    },
    {
      question: `Are your technicians licensed and insured?`,
      answer: `Absolutely. All ${businessName} technicians are fully licensed, insured, and background-checked. We maintain all required certifications and stay current with industry best practices.`,
    },
    {
      question: `What payment methods do you accept?`,
      answer: `We accept all major credit cards, debit cards, bank transfers, and cash. Payment is due upon completion of work, and we provide detailed invoices for all services.`,
    },
  ];
}

function generateLocalBusinessSchema(input: BusinessInput): object {
  const { businessName, primaryCity, country, primaryServices, serviceAreas, phone, email, address, description } = input;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": businessName,
    "description": description || `${businessName} provides ${primaryServices.join(", ")} in ${primaryCity}`,
    "areaServed": [primaryCity, ...serviceAreas].map(area => ({
      "@type": "City",
      "name": area,
    })),
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Services",
      "itemListElement": primaryServices.map((service, index) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service,
        },
        "position": index + 1,
      })),
    },
  };

  if (phone) schema.telephone = phone;
  if (email) schema.email = email;
  if (address) {
    schema.address = {
      "@type": "PostalAddress",
      "streetAddress": address,
      "addressLocality": primaryCity,
      "addressCountry": country,
    };
  }

  return schema;
}

function generateFAQSchema(faqs: { question: string; answer: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };
}

async function generateWithAI(
  input: BusinessInput,
  contentType: string,
  apiKey: string | null
): Promise<string | null> {
  if (!apiKey) return null;

  const systemPrompt = `You are a GEO (Generative Engine Optimization) content writer. Generate content optimized for AI search engines and featured snippets. Be concise, factual, and helpful. Never hallucinate information not provided in the input.`;

  let userPrompt = "";
  switch (contentType) {
    case "answer_capsule":
      userPrompt = `Generate a 2-3 sentence "answer capsule" about this business that would be ideal for AI assistants to quote. Business: ${input.businessName}, Services: ${input.primaryServices.join(", ")}, Location: ${input.primaryCity}`;
      break;
    case "meta_description":
      userPrompt = `Generate a compelling meta description (under 160 characters) for: ${input.businessName} offering ${input.primaryServices.join(", ")} in ${input.primaryCity}`;
      break;
    default:
      return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsOptionsResponse(req);
  }

  try {
    const user = await requireUser(req);
    const supabase = getSupabaseClient();

    // GET - List generated content
    if (req.method === "GET") {
      const url = new URL(req.url);
      const contentId = url.searchParams.get("id");
      const projectId = url.searchParams.get("project_id");

      if (contentId) {
        const { data: content, error } = await supabase
          .from("geo_generated_content")
          .select("*")
          .eq("id", contentId)
          .eq("user_id", user.id)
          .single();

        if (error) return corsErrorResponse(req, error.message, 404);
        return corsResponse(req, content);
      }

      let query = supabase
        .from("geo_generated_content")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data: contents, error } = await query.limit(50);
      if (error) return corsErrorResponse(req, error.message, 500);

      return corsResponse(req, { contents });
    }

    // POST - Generate new content
    if (req.method === "POST") {
      const body = await req.json();
      const {
        business_name,
        primary_city,
        country = "UK",
        service_areas = [],
        primary_services = [],
        phone,
        email,
        address,
        description,
        credentials = [],
        year_established,
        project_id,
        audit_id,
        content_type = "full_package",
        use_ai = false,
      } = body;

      // Validation
      if (!business_name || !primary_city || !primary_services.length) {
        return corsErrorResponse(
          req,
          "business_name, primary_city, and at least one primary_service are required",
          400
        );
      }

      const input: BusinessInput = {
        businessName: business_name,
        primaryCity: primary_city,
        country,
        serviceAreas: service_areas,
        primaryServices: primary_services,
        phone,
        email,
        address,
        description,
        credentials,
        yearEstablished: year_established,
      };

      // Generate content
      let metaTitle = generateMetaTitle(input);
      let metaDescription = generateMetaDescription(input);
      let answerCapsule = generateAnswerCapsule(input);
      const h1Suggestion = generateH1(input);
      const serviceDescriptions = generateServiceDescriptions(input);
      const faqs = generateFAQs(input);
      const localBusinessSchema = generateLocalBusinessSchema(input);
      const faqSchema = generateFAQSchema(faqs);

      // Optionally enhance with AI
      if (use_ai) {
        const openaiKey = await getSecret("OPENAI_API_KEY");
        if (openaiKey) {
          const aiCapsule = await generateWithAI(input, "answer_capsule", openaiKey);
          if (aiCapsule) answerCapsule = aiCapsule;

          const aiMeta = await generateWithAI(input, "meta_description", openaiKey);
          if (aiMeta) metaDescription = aiMeta;
        }
      }

      const schemaJsonLd = [localBusinessSchema, faqSchema];

      // Generate markdown output
      const markdown = `# ${input.businessName}

## Meta Information
- **Title:** ${metaTitle}
- **Description:** ${metaDescription}

## Answer Capsule
${answerCapsule}

## Suggested H1
${h1Suggestion}

## Services

${serviceDescriptions.map(s => `### ${s.service}\n${s.description}`).join("\n\n")}

## Frequently Asked Questions

${faqs.map(f => `**Q: ${f.question}**\nA: ${f.answer}`).join("\n\n")}
`;

      // Generate HTML fragments
      const html = `
<div class="geo-content">
  <h1>${h1Suggestion}</h1>

  <p class="answer-capsule">${answerCapsule}</p>

  <section class="services">
    <h2>Our Services</h2>
    ${serviceDescriptions.map(s => `
    <div class="service">
      <h3>${s.service}</h3>
      <p>${s.description}</p>
    </div>
    `).join("")}
  </section>

  <section class="faqs">
    <h2>Frequently Asked Questions</h2>
    ${faqs.map(f => `
    <details>
      <summary>${f.question}</summary>
      <p>${f.answer}</p>
    </details>
    `).join("")}
  </section>
</div>

<script type="application/ld+json">
${JSON.stringify(localBusinessSchema, null, 2)}
</script>

<script type="application/ld+json">
${JSON.stringify(faqSchema, null, 2)}
</script>
`;

      // Save to database
      const { data: content, error } = await supabase
        .from("geo_generated_content")
        .insert({
          user_id: user.id,
          project_id: project_id || null,
          audit_id: audit_id || null,
          business_name: input.businessName,
          primary_city: input.primaryCity,
          country: input.country,
          service_areas: input.serviceAreas,
          primary_services: input.primaryServices,
          business_input_json: input,
          content_type,
          generated_json: {
            metaTitle,
            metaDescription,
            answerCapsule,
            h1Suggestion,
            serviceDescriptions,
            faqs,
            schemaJsonLd,
          },
          generated_markdown: markdown,
          generated_html: html,
          meta_title: metaTitle,
          meta_description: metaDescription,
          answer_capsule: answerCapsule,
          service_descriptions: serviceDescriptions,
          faqs,
          schema_json_ld: schemaJsonLd,
          status: "draft",
        })
        .select()
        .single();

      if (error) return corsErrorResponse(req, error.message, 500);

      return corsResponse(req, content, 201);
    }

    // PUT - Update content status
    if (req.method === "PUT") {
      const body = await req.json();
      const { id, status, review_notes } = body;

      if (!id) return corsErrorResponse(req, "Content ID required", 400);

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (status) updates.status = status;
      if (review_notes !== undefined) updates.review_notes = review_notes;

      if (status === "approved") {
        updates.reviewed_by = user.id;
        updates.reviewed_at = new Date().toISOString();
      }

      const { data: content, error } = await supabase
        .from("geo_generated_content")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) return corsErrorResponse(req, error.message, 500);
      return corsResponse(req, content);
    }

    // DELETE - Delete content
    if (req.method === "DELETE") {
      const body = await req.json();
      const { id } = body;

      if (!id) return corsErrorResponse(req, "Content ID required", 400);

      const { error } = await supabase
        .from("geo_generated_content")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) return corsErrorResponse(req, error.message, 500);
      return corsResponse(req, { success: true, deleted_id: id });
    }

    return corsErrorResponse(req, "Method not allowed", 405);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return corsErrorResponse(req, message, 500);
  }
});
