# Super SEO & Content Platform

Research Build Manage is a unified SEO and content platform built with React, Vite, Tailwind, and Supabase. It centralizes keyword research, monitoring, and content workflows behind authenticated Supabase Edge Functions.

## Repository layout

```
apps/
  frontend/                # React + Vite application
packages/                  # Shared utilities
supabase/
  migrations/              # Supabase SQL migrations
  functions/               # Supabase Edge Functions (Deno)
```

## Local setup

1. Install dependencies: `pnpm install`
2. Set frontend env vars:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Start the frontend: `pnpm --filter ./apps/frontend dev -- --host --port 5173`

> Tip: `scripts/smoke-check.sh` verifies required env vars are present before starting the app.

## Supabase Edge Functions

The app relies on Edge Functions for settings, secrets storage, and provider tests. Deploy them using the Supabase CLI:

```
supabase functions deploy settings-get
supabase functions deploy settings-update
supabase functions deploy settings-test
supabase functions deploy secrets-get
supabase functions deploy secrets-set
supabase functions deploy secrets-list
```

Required Supabase function secrets:

```
supabase secrets set SUPABASE_FUNCTIONS_SECRET="your-strong-key"
supabase secrets set SUPABASE_ALLOWED_ORIGINS="https://your-pages-domain,https://your-custom-domain"
```

## Settings & modules

- Settings are stored per user in `user_settings`.
- Secrets are encrypted and stored in `user_secrets` via Edge Functions.
- Module toggles and provider selections are configured in **Settings** and drive navigation visibility.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Cloudflare Pages configuration and environment variables.
