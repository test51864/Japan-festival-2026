alter table public.yanmar_festival_scores
  add column if not exists has_email boolean not null default true;

alter table public.yanmar_festival_scores
  drop constraint if exists yanmar_festival_scores_email_required;

alter table public.yanmar_festival_scores
  drop constraint if exists yanmar_festival_scores_contact_required;

alter table public.yanmar_festival_scores
  add constraint yanmar_festival_scores_contact_required
  check (has_email = true and length(trim(email)) > 1);

drop policy if exists "allow score inserts with email" on public.yanmar_festival_scores;
drop policy if exists "allow score inserts with contact" on public.yanmar_festival_scores;

create policy "allow score inserts with contact"
  on public.yanmar_festival_scores
  for insert
  to anon, authenticated
  with check (has_email = true and length(trim(email)) > 1);

create or replace view public.yanmar_festival_public_scores as
select
  id,
  created_at,
  name,
  points,
  correct,
  total,
  percentage,
  team,
  language
from public.yanmar_festival_scores
where has_email = true
  and email is not null
  and length(trim(email)) > 1;

grant select on public.yanmar_festival_public_scores to anon, authenticated;

create or replace function public.yanmar_festival_admin_scores(admin_pin text)
returns table (
  id uuid,
  created_at timestamptz,
  name text,
  email text,
  has_email boolean,
  points integer,
  correct integer,
  total integer,
  percentage integer,
  team text,
  language text
)
language sql
security definer
set search_path = public
as $$
  select
    scores.id,
    scores.created_at,
    scores.name,
    scores.email,
    scores.has_email,
    scores.points,
    scores.correct,
    scores.total,
    scores.percentage,
    scores.team,
    scores.language
  from public.yanmar_festival_scores as scores
  where admin_pin = 'yanmar-score-2026'
  order by scores.points desc, scores.correct desc, scores.percentage desc, scores.created_at asc
  limit 1000;
$$;

revoke all on function public.yanmar_festival_admin_scores(text) from public;
grant execute on function public.yanmar_festival_admin_scores(text) to anon, authenticated;
