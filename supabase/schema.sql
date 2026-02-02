-- supabase/schema.sql
--
-- SQL migration for the Supabase database backing the unified SEO &
-- content platform.  This schema defines core entities such as users,
-- credits, websites, generated content and audit reports.  You can run
-- this file via the Supabase CLI (`supabase db push`) after creating
-- a project.  Adjust or extend fields as needed.

-- Enable the auth extension for managing users via Supabase auth
create extension if not exists "uuid-ossp";

-- Profiles table: stores metadata for each user.  Supabase Auth manages
-- authentication, so we use the `auth.users.id` UUID as the primary key.
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user','admin')),
  email text,
  created_at timestamp with time zone default current_timestamp
);

-- Credits table: tracks the credit balance per user
create table if not exists credits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles (id) on delete cascade,
  total integer not null default 0,
  used integer not null default 0,
  updated_at timestamp with time zone default current_timestamp
);

create unique index if not exists idx_credits_user_unique on credits (user_id);

-- Auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  insert into public.credits (user_id, total, used)
  values (new.id, 0, 0)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Websites table: list of websites monitored by each user
create table if not exists websites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles (id) on delete cascade,
  url text not null,
  status integer,
  last_checked_at timestamp with time zone,
  created_at timestamp with time zone default current_timestamp
);

-- Geo content table: stores generated articles targeting specific
-- locations/keywords
create table if not exists geo_content (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles (id) on delete cascade,
  location text not null,
  keyword text not null,
  title text,
  body text,
  created_at timestamp with time zone default current_timestamp
);

-- SEO audit results table
create table if not exists seo_audits (
  id uuid primary key default uuid_generate_v4(),
  website_id uuid references websites (id) on delete cascade,
  score integer,
  report jsonb,
  created_at timestamp with time zone default current_timestamp
);

-- Indexes for performance
create index if not exists idx_websites_user on websites (user_id);
create index if not exists idx_geo_content_user on geo_content (user_id);
create index if not exists idx_seo_audits_website on seo_audits (website_id);