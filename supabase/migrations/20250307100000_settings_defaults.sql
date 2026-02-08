alter table public.user_settings
  add column if not exists settings_version integer not null default 1;

update public.user_settings
set settings = jsonb_set(
  jsonb_set(
    jsonb_set(
      settings,
      '{modules}',
      coalesce(
        settings->'modules',
        '{"multi_tools": true, "build": true, "daily_checks": true, "asset_tracker": true, "nico_geo": true, "nexus_opencopy": true}'::jsonb
      ),
      true
    ),
    '{providers}',
    coalesce(
      settings->'providers',
      '{"keyword_data": "dataforseo", "ai": "openai"}'::jsonb
    ),
    true
  ),
  '{integrations}',
  coalesce(settings->'integrations', '{}'::jsonb),
  true
)
where settings is not null;
