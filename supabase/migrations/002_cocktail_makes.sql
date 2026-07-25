-- ============================================================================
-- Migration 002 — "I made this" (real photos, ratings, reviews)
--
-- Run this in the Supabase SQL editor. Then create the Storage bucket (below).
-- Safe to run more than once.
-- ============================================================================

create table if not exists public.cocktail_makes (
  id uuid primary key default gen_random_uuid(),
  cocktail_id uuid not null references public.cocktails(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  username text not null,
  rating integer check (rating between 1 and 5),
  photo_url text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists cocktail_makes_cocktail_idx
  on public.cocktail_makes (cocktail_id, created_at desc);

alter table public.cocktail_makes enable row level security;

drop policy if exists "makes readable" on public.cocktail_makes;
create policy "makes readable" on public.cocktail_makes
  for select using (true);

drop policy if exists "users add makes" on public.cocktail_makes;
create policy "users add makes" on public.cocktail_makes
  for insert with check (auth.uid() = user_id);

-- ── Storage bucket for real community photos ────────────────────────────────
-- Creates a public bucket named "community-photos". (The API uploads with the
-- service-role key, which bypasses RLS; public read lets photos display.)
insert into storage.buckets (id, name, public)
values ('community-photos', 'community-photos', true)
on conflict (id) do nothing;
