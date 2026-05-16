-- ViralPro / WordRocket-style SaaS MVP schema.
-- Run this in the Supabase SQL Editor, or apply the matching migration in
-- supabase/migrations/20260515000000_saas_content_backend.sql.

create extension if not exists pgcrypto;

create schema if not exists private;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  plan text not null default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists plan text not null default 'free';
alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists stripe_subscription_id text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_plan_check'
  ) then
    alter table public.profiles
      add constraint profiles_plan_check check (plan in ('free', 'pro'));
  end if;
end $$;

create table if not exists public.user_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_key text not null,
  articles_generated integer not null default 0,
  images_generated integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, month_key)
);

create table if not exists public.wordpress_sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  site_url text not null,
  username text,
  encrypted_app_password text,
  default_category_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  topic text not null,
  primary_keyword text,
  content_html text,
  content_markdown text,
  excerpt text,
  meta_title text,
  meta_description text,
  slug text,
  word_count integer,
  status text not null default 'draft',
  generation_settings jsonb not null default '{}'::jsonb,
  external_references jsonb not null default '[]'::jsonb,
  seo_score integer,
  ai_search_optimized boolean not null default false,
  featured_image_id uuid,
  wordpress_post_id text,
  wordpress_site_id uuid references public.wordpress_sites(id) on delete set null,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generated_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid references public.articles(id) on delete set null,
  prompt text not null,
  image_url text,
  storage_path text,
  alt_text text,
  provider text not null default 'fal',
  status text not null default 'queued',
  width integer,
  height integer,
  aspect_ratio text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'articles_featured_image_id_fkey'
  ) then
    alter table public.articles
      add constraint articles_featured_image_id_fkey
      foreign key (featured_image_id)
      references public.generated_images(id)
      on delete set null;
  end if;
end $$;

create table if not exists public.generation_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'articles_status_check'
  ) then
    alter table public.articles
      add constraint articles_status_check
      check (status in ('queued', 'generating', 'completed', 'failed', 'draft', 'published'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'generated_images_status_check'
  ) then
    alter table public.generated_images
      add constraint generated_images_status_check
      check (status in ('queued', 'generating', 'completed', 'failed'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'generation_templates_type_check'
  ) then
    alter table public.generation_templates
      add constraint generation_templates_type_check
      check (type in ('article', 'image'));
  end if;
end $$;

create index if not exists articles_user_created_idx
  on public.articles (user_id, created_at desc);
create index if not exists articles_user_status_idx
  on public.articles (user_id, status);
create index if not exists generated_images_user_created_idx
  on public.generated_images (user_id, created_at desc);
create index if not exists generated_images_article_idx
  on public.generated_images (article_id);
create index if not exists generation_templates_user_type_idx
  on public.generation_templates (user_id, type);
create index if not exists user_usage_user_month_idx
  on public.user_usage (user_id, month_key);
create index if not exists wordpress_sites_user_created_idx
  on public.wordpress_sites (user_id, created_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure private.set_updated_at();

drop trigger if exists user_usage_set_updated_at on public.user_usage;
create trigger user_usage_set_updated_at
before update on public.user_usage
for each row execute procedure private.set_updated_at();

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
before update on public.articles
for each row execute procedure private.set_updated_at();

drop trigger if exists generated_images_set_updated_at on public.generated_images;
create trigger generated_images_set_updated_at
before update on public.generated_images
for each row execute procedure private.set_updated_at();

drop trigger if exists generation_templates_set_updated_at on public.generation_templates;
create trigger generation_templates_set_updated_at
before update on public.generation_templates
for each row execute procedure private.set_updated_at();

drop trigger if exists wordpress_sites_set_updated_at on public.wordpress_sites;
create trigger wordpress_sites_set_updated_at
before update on public.wordpress_sites
for each row execute procedure private.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(coalesce(new.raw_user_meta_data->>'full_name', ''), '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        updated_at = now();
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_usage enable row level security;
alter table public.articles enable row level security;
alter table public.generated_images enable row level security;
alter table public.generation_templates enable row level security;
alter table public.wordpress_sites enable row level security;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.user_usage to authenticated;
grant select, insert, update, delete on public.articles to authenticated;
grant select, insert, update, delete on public.generated_images to authenticated;
grant select, insert, update, delete on public.generation_templates to authenticated;
grant select, insert, update, delete on public.wordpress_sites to authenticated;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own
on public.profiles for delete
to authenticated
using ((select auth.uid()) = id);

drop policy if exists user_usage_select_own on public.user_usage;
create policy user_usage_select_own
on public.user_usage for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists user_usage_insert_own on public.user_usage;
create policy user_usage_insert_own
on public.user_usage for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists user_usage_update_own on public.user_usage;
create policy user_usage_update_own
on public.user_usage for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists user_usage_delete_own on public.user_usage;
create policy user_usage_delete_own
on public.user_usage for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists articles_select_own on public.articles;
create policy articles_select_own
on public.articles for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists articles_insert_own on public.articles;
create policy articles_insert_own
on public.articles for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists articles_update_own on public.articles;
create policy articles_update_own
on public.articles for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists articles_delete_own on public.articles;
create policy articles_delete_own
on public.articles for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists generated_images_select_own on public.generated_images;
create policy generated_images_select_own
on public.generated_images for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists generated_images_insert_own on public.generated_images;
create policy generated_images_insert_own
on public.generated_images for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists generated_images_update_own on public.generated_images;
create policy generated_images_update_own
on public.generated_images for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists generated_images_delete_own on public.generated_images;
create policy generated_images_delete_own
on public.generated_images for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists generation_templates_select_own on public.generation_templates;
create policy generation_templates_select_own
on public.generation_templates for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists generation_templates_insert_own on public.generation_templates;
create policy generation_templates_insert_own
on public.generation_templates for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists generation_templates_update_own on public.generation_templates;
create policy generation_templates_update_own
on public.generation_templates for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists generation_templates_delete_own on public.generation_templates;
create policy generation_templates_delete_own
on public.generation_templates for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists wordpress_sites_select_own on public.wordpress_sites;
create policy wordpress_sites_select_own
on public.wordpress_sites for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists wordpress_sites_insert_own on public.wordpress_sites;
create policy wordpress_sites_insert_own
on public.wordpress_sites for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists wordpress_sites_update_own on public.wordpress_sites;
create policy wordpress_sites_update_own
on public.wordpress_sites for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists wordpress_sites_delete_own on public.wordpress_sites;
create policy wordpress_sites_delete_own
on public.wordpress_sites for delete
to authenticated
using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public)
values ('generated-images', 'generated-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists generated_images_storage_select_own on storage.objects;
create policy generated_images_storage_select_own
on storage.objects for select
to authenticated
using (
  bucket_id = 'generated-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists generated_images_storage_insert_own on storage.objects;
create policy generated_images_storage_insert_own
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'generated-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists generated_images_storage_update_own on storage.objects;
create policy generated_images_storage_update_own
on storage.objects for update
to authenticated
using (
  bucket_id = 'generated-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'generated-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists generated_images_storage_delete_own on storage.objects;
create policy generated_images_storage_delete_own
on storage.objects for delete
to authenticated
using (
  bucket_id = 'generated-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
