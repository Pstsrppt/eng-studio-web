-- Placement test results, so the site can start learners at their level and show progress over time.
-- Paste into Supabase > SQL Editor and press Run. Adds one table; nothing existing changes. Safe to run twice.

create table if not exists public.placement_results (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  level       text not null check (level in ('pre-A1', 'A1', 'A2', 'B1', 'B2')),
  correct     smallint not null check (correct >= 0),
  total       smallint not null check (total > 0 and correct <= total),
  by_level    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists placement_results_user_idx on public.placement_results (user_id, created_at desc);

alter table public.placement_results enable row level security;
drop policy if exists "own rows" on public.placement_results;
create policy "own rows" on public.placement_results for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
revoke all on public.placement_results from anon;
grant select, insert on public.placement_results to authenticated;
