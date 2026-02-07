create extension if not exists "pgcrypto";

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  company_name text,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_secrets (
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null,
  value_encrypted text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.user_settings enable row level security;
alter table public.user_secrets enable row level security;

create policy "Users can view their settings"
  on public.user_settings
  for select
  using (auth.uid() = user_id);

create policy "Users can upsert their settings"
  on public.user_settings
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their settings"
  on public.user_settings
  for update
  using (auth.uid() = user_id);

create policy "Users can manage their secrets"
  on public.user_secrets
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
