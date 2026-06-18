alter table public.yanmar_festival_scores
  add column if not exists has_email boolean not null default true;

update public.yanmar_festival_scores
set has_email = true
where email is not null and length(trim(email)) > 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'yanmar_festival_scores_email_required'
      and conrelid = 'public.yanmar_festival_scores'::regclass
  ) then
    alter table public.yanmar_festival_scores
      add constraint yanmar_festival_scores_email_required
      check (has_email = true and length(trim(email)) > 3 and position('@' in email) > 1);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'yanmar_festival_scores'
      and policyname = 'allow score inserts with email'
  ) then
    execute 'create policy "allow score inserts with email" on public.yanmar_festival_scores for insert to anon, authenticated with check (has_email = true and length(trim(email)) > 3 and position(''@'' in email) > 1)';
  end if;
end $$;

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
  and length(trim(email)) > 3;

grant select on public.yanmar_festival_public_scores to anon, authenticated;
