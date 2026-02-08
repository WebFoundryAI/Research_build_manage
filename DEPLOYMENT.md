# Deployment Guide (Cloudflare Pages + Supabase)

## Cloudflare Pages environment variables

Configure these for the **frontend** build:

- `VITE_SUPABASE_URL` — Supabase project URL (https://...) 
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key

## Supabase Edge Functions

Deploy the following Edge Functions:

- `settings-get`
- `settings-update`
- `settings-test`
- `secrets-get`
- `secrets-set`
- `secrets-list`

### Required Supabase secrets

```
SUPABASE_FUNCTIONS_SECRET=<32+ char random string>
SUPABASE_ALLOWED_ORIGINS=https://your-pages-domain,https://your-custom-domain,http://localhost:5173
```

`SUPABASE_ALLOWED_ORIGINS` controls CORS for Edge Functions. Include all Cloudflare Pages domains you deploy to, plus localhost for local development.

## Database migrations

Apply the latest SQL migrations in `supabase/migrations` before deploying. This ensures:

- `user_settings` (per-user config)
- `user_secrets` (encrypted secret storage)
- module/provider defaults

## Verification checklist

- Sign in and visit **Settings**.
- Save at least one API key and run a provider test.
- Toggle a module and confirm the navigation updates.
