# Super SEO & Content Platform

This repository contains a monorepo implementation of the unified SEO/content application described in the planning documents.  It is not a full implementation; instead it provides a **skeleton** structure that can be extended to replicate the functionality of several existing WebFoundryAI projects.  The goal is to offer a starting point for building and deploying a comprehensive tool combining AI‑driven content generation, website monitoring, SEO research and account management.

## Repository layout

```
super-seo-tool/
├── package.json                # root package config for monorepo
├── pnpm-workspace.yaml         # defines workspace packages
├── apps/
│   ├── frontend/               # React + Vite application (client)
│   │   ├── package.json        # frontend dependencies
│   │   ├── vite.config.ts      # Vite configuration
│   │   ├── index.html          # base HTML file
│   │   └── src/
│   │       ├── main.tsx        # React entry point
│   │       └── App.tsx         # root component with placeholder routes
│   └── edge-functions/         # Cloudflare Pages Functions (Deno)
│       └── functions/
│           ├── geo_generate.ts  # placeholder for Nico GEO engine
│           ├── monitor_check.ts # placeholder for website monitoring
│           └── seo_audit.ts     # placeholder for SEO audit analysis
├── packages/
│   └── common/                 # shared utilities and types
│       ├── supabaseClient.ts   # helper to create Supabase client
│       └── creditCosts.ts      # credit cost constants (sample)
└── supabase/
    └── schema.sql             # SQL migrations for Supabase tables
```

This skeleton is intended to be deployed on **Cloudflare Pages** as a full‑stack application.  The `frontend` app contains the client‑side UI built with React and Tailwind.  The `edge-functions` folder contains Deno functions that will be deployed as Cloudflare Functions and serve as the API layer for content generation, monitoring, and SEO research.  Shared code lives under `packages/common`.  The `supabase/schema.sql` file holds database definitions for user profiles, projects, credits, and other tables.

## Getting started

1. Install [pnpm](https://pnpm.io/) globally.
2. Run `pnpm install` at the root to install workspace dependencies.
3. Change into `apps/frontend` and run `pnpm dev` to start the Vite development server.
4. Cloudflare Pages will detect functions in `apps/edge-functions/functions`.  To emulate functions locally, install [wrangler](https://developers.cloudflare.com/workers/wrangler/) and run `wrangler pages dev ./apps/frontend --functions ./apps/edge-functions/functions`.

Refer to the planning documents for detailed instructions on how to extend each module and integrate Supabase, DataForSEO and OpenAI services.

## Local Dev

Run the commands below to configure Supabase env vars locally and start the Vite dev server:

```
cd ~/Downloads/Research_build_manage/super-seo-tool
./scripts/set_supabase_env.sh
./scripts/check_supabase_env.sh
npm --prefix apps/frontend run dev -- --host --port 5173
```
