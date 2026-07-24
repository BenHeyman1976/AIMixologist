-- ============================================================================
-- Bob the AI Mixologist — Supabase schema
--
-- Run this in the Supabase SQL editor (or via the CLI) to create all tables,
-- indexes, and row-level-security policies for the MVP.
--
-- Tables: users, cocktails, cocktail_images, votes, comments,
--         image_generation_usage, sponsored_brands
-- ============================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── enums ──────────────────────────────────────────────────────────────────
do $$ begin
  create type alcohol_level as enum ('alcohol-free', 'low-alcohol', 'full-strength');
exception when duplicate_object then null; end $$;

do $$ begin
  create type moderation_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_plan as enum ('free', 'paid');
exception when duplicate_object then null; end $$;

-- ─── users ──────────────────────────────────────────────────────────────────
-- Mirrors auth.users with app-specific profile fields. In production, populate
-- via a trigger on auth.users (see "Going to production" in the README).
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  email text,
  plan user_plan not null default 'free',
  created_at timestamptz not null default now()
);

-- ─── cocktails ──────────────────────────────────────────────────────────────
create table if not exists public.cocktails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  prompt text not null,
  ingredients jsonb not null default '[]',
  method jsonb not null default '[]',
  garnish text,
  glassware text,
  tasting_notes text,
  occasion text,
  alcohol_level alcohol_level not null default 'full-strength',
  tags text[] not null default '{}',
  meta jsonb not null default '{}',   -- enriched fields: abv, calories, prep_time, etc.
  image_url text,
  is_public boolean not null default false,
  is_flagged boolean not null default false,
  moderation_status moderation_status not null default 'approved',
  vote_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists cocktails_public_idx
  on public.cocktails (is_public, created_at desc);
create index if not exists cocktails_user_idx on public.cocktails (user_id);
create index if not exists cocktails_votes_idx on public.cocktails (vote_count desc);
create index if not exists cocktails_tags_idx on public.cocktails using gin (tags);

-- ─── cocktail_images ────────────────────────────────────────────────────────
-- A cocktail can have multiple generated images over time; cocktails.image_url
-- points at the currently selected hero image.
create table if not exists public.cocktail_images (
  id uuid primary key default gen_random_uuid(),
  cocktail_id uuid not null references public.cocktails(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  url text not null,
  is_mock boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists cocktail_images_cocktail_idx
  on public.cocktail_images (cocktail_id);

-- ─── votes ──────────────────────────────────────────────────────────────────
-- One vote per user per cocktail (enforced by the unique constraint).
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  cocktail_id uuid not null references public.cocktails(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (cocktail_id, user_id)
);
create index if not exists votes_cocktail_idx on public.votes (cocktail_id);

-- ─── comments ───────────────────────────────────────────────────────────────
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  cocktail_id uuid not null references public.cocktails(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  username text not null,
  body text not null,
  is_flagged boolean not null default false,
  moderation_status moderation_status not null default 'approved',
  created_at timestamptz not null default now()
);
create index if not exists comments_cocktail_idx on public.comments (cocktail_id);

-- ─── image_generation_usage ─────────────────────────────────────────────────
-- One row per generated image, used to enforce the monthly plan allowance.
create table if not exists public.image_generation_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  cocktail_id uuid references public.cocktails(id) on delete set null,
  period text not null,                 -- 'YYYY-MM'
  created_at timestamptz not null default now()
);
create index if not exists usage_user_period_idx
  on public.image_generation_usage (user_id, period);

-- ─── sponsored_brands ───────────────────────────────────────────────────────
-- Drives native advertising + verified sponsored partnerships. A cocktail may
-- only display an "official partnership" badge when a matching active row
-- exists here.
create table if not exists public.sponsored_brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ingredient_keyword text not null,
  blurb text,
  cta_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.users enable row level security;
alter table public.cocktails enable row level security;
alter table public.cocktail_images enable row level security;
alter table public.votes enable row level security;
alter table public.comments enable row level security;
alter table public.image_generation_usage enable row level security;
alter table public.sponsored_brands enable row level security;

-- Public read of approved, public cocktails.
drop policy if exists "public cocktails readable" on public.cocktails;
create policy "public cocktails readable" on public.cocktails
  for select using (is_public = true and moderation_status = 'approved');

-- Owners can read/write their own cocktails.
drop policy if exists "owner manages cocktails" on public.cocktails;
create policy "owner manages cocktails" on public.cocktails
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Comments: anyone can read approved comments; authenticated users can insert.
drop policy if exists "approved comments readable" on public.comments;
create policy "approved comments readable" on public.comments
  for select using (moderation_status = 'approved');
drop policy if exists "users add comments" on public.comments;
create policy "users add comments" on public.comments
  for insert with check (auth.uid() = user_id);

-- Votes: users manage their own votes.
drop policy if exists "users manage votes" on public.votes;
create policy "users manage votes" on public.votes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Sponsored brands are world-readable.
drop policy if exists "sponsors readable" on public.sponsored_brands;
create policy "sponsors readable" on public.sponsored_brands
  for select using (true);

-- NOTE: API routes in this MVP use the service-role key, which bypasses RLS.
-- The policies above are what protect data once you move logic to the client
-- with the anon key and real Supabase Auth.

-- ============================================================================
-- Seed data (optional) — a couple of sponsored brands + demo user
-- ============================================================================
insert into public.users (id, username, email, plan)
values ('00000000-0000-0000-0000-000000000001', 'demo_mixologist', null, 'free')
on conflict (id) do nothing;

insert into public.sponsored_brands (name, ingredient_keyword, blurb, cta_url, is_active)
values
  ('Trip', 'cbd', 'Trip''s CBD-infused drinks — a calming, refreshing mixer.', 'https://example.com/trip', true),
  ('Aperol', 'aperol', 'The iconic bittersweet orange aperitif.', 'https://example.com/aperol', true)
on conflict do nothing;

-- Storage bucket for generated images (run once):
--   insert into storage.buckets (id, name, public) values ('cocktail-images', 'cocktail-images', true);
