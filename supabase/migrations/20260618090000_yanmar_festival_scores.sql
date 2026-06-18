create extension if not exists pgcrypto;

create table if not exists public.yanmar_festival_scores (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  points integer not null default 0,
  correct integer not null default 0,
  total integer not null default 0,
  percentage integer not null default 0,
  team text,
  language text,
  user_agent text
);

alter table public.yanmar_festival_scores enable row level security;

create index if not exists yanmar_festival_scores_rank_idx
  on public.yanmar_festival_scores (points desc, correct desc, percentage desc, created_at asc);

create index if not exists yanmar_festival_scores_email_idx
  on public.yanmar_festival_scores (email);

-- The Vercel API uses SUPABASE_SERVICE_ROLE_KEY, so no public select policy is needed.
-- Keeping RLS enabled prevents direct public reads of e-mail addresses.
