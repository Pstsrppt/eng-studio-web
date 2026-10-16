-- Learning Studio (October 2026): Again / Hard / Good reviews, bookmarks, daily quests and XP.
-- Paste into Supabase > SQL Editor and press Run, after schema.sql. Safe to run more than once.
--
-- Only adds columns, tables and functions. Nothing is dropped, and record_review (V1-V2-V3 drill)
-- keeps working. Existing word cards get their new columns filled in from their box and review history.

-- 1. Scheduling state on each card (see src/lib/learning/srs.ts for the algorithm).
alter table public.cards
  add column if not exists state            text    not null default 'new',
  add column if not exists interval_days    integer not null default 0,
  add column if not exists ease             real    not null default 2.5,
  add column if not exists reps             integer not null default 0,
  add column if not exists lapses           integer not null default 0,
  add column if not exists last_reviewed_at timestamptz,
  add column if not exists bookmarked       boolean not null default false;

do $$ begin
  alter table public.cards add constraint cards_state_check check (state in ('new', 'learning', 'review', 'mastered'));
exception when duplicate_object then null; end $$;

-- 2. Each review remembers its grade and a client event id, so a double click or a retry is saved once.
alter table public.reviews
  add column if not exists grade    text,
  add column if not exists event_id uuid,
  add column if not exists was_new  boolean not null default false;

do $$ begin
  alter table public.reviews add constraint reviews_grade_check check (grade in ('again', 'hard', 'good'));
exception when duplicate_object then null; end $$;

create unique index if not exists reviews_event_idx on public.reviews (user_id, event_id) where event_id is not null;

-- 3. Backfill cards that were reviewed before this migration (only rows it hasn't touched yet).
update public.cards c
   set reps = s.n,
       lapses = s.wrong,
       last_reviewed_at = s.last_at,
       interval_days = (array[0, 1, 3, 7, 14, 30])[c.box + 1],
       state = case when c.box >= 5 then 'mastered' when c.box >= 2 then 'review' else 'learning' end
  from (
    select user_id, item_id, count(*)::int as n, (count(*) filter (where not correct))::int as wrong, max(reviewed_at) as last_at
      from public.reviews
     group by user_id, item_id
  ) s
 where c.user_id = s.user_id and c.item_id = s.item_id and c.reps = 0 and c.state = 'new';

-- Bookmarks weren't stored separately before. Best guess for old rows: the learner's own words, and
-- never-reviewed word cards added on their own (a passed lesson adds its words together, in one statement).
update public.cards c
   set bookmarked = true
 where c.bookmarked = false and c.kind = 'word' and c.reps = 0
   and (c.custom_en is not null
        or not exists (select 1 from public.cards o
                        where o.user_id = c.user_id and o.item_id <> c.item_id and o.created_at = c.created_at));

-- 4. Daily quest rewards. The primary key is what stops a quest paying out twice on the same day.
create table if not exists public.quest_claims (
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day         date not null,
  quest_id    text not null,
  xp          smallint not null check (xp between 0 and 500),
  claimed_at  timestamptz not null default now(),
  primary key (user_id, day, quest_id)
);

alter table public.quest_claims enable row level security;
drop policy if exists "own rows" on public.quest_claims;
create policy "own rows" on public.quest_claims for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
revoke all on public.quest_claims from anon;
grant select, insert on public.quest_claims to authenticated;

-- 5. Save one graded word review atomically. The schedule is worked out in the app (srs.ts, unit
-- tested); this function checks nobody changed the card meanwhile, then writes card and review together.
create or replace function public.apply_grade(
  p_event_id  uuid,
  p_item_id   text,
  p_grade     text,
  p_expected  timestamptz,   -- updated_at the app read, or null for a card that didn't exist
  p_state     text,
  p_interval  integer,
  p_ease      real,
  p_reps      integer,
  p_lapses    integer,
  p_box       smallint,
  p_due       date,
  p_ms        integer default null
) returns public.cards
language plpgsql
security invoker
set search_path = public
as $$
declare
  cur      public.cards;
  had_card boolean;
  result   public.cards;
begin
  if p_grade not in ('again', 'hard', 'good') then
    raise exception 'unknown grade %', p_grade;
  end if;

  -- The same answer sent twice (double click, retry after a reload) changes nothing.
  if exists (select 1 from public.reviews where user_id = auth.uid() and event_id = p_event_id) then
    select * into result from public.cards where user_id = auth.uid() and item_id = p_item_id;
    return result;
  end if;

  select * into cur from public.cards where user_id = auth.uid() and item_id = p_item_id for update;
  had_card := found;
  -- Another tab graded this card after the app read it: the app recomputes from the newer state.
  if (had_card and cur.updated_at is distinct from p_expected) or (not had_card and p_expected is not null) then
    raise exception 'card changed since it was read' using errcode = 'PT409';
  end if;

  insert into public.cards (item_id, kind, box, due_on, state, interval_days, ease, reps, lapses, last_reviewed_at)
  values (p_item_id, 'word', p_box, p_due, p_state, p_interval, p_ease, p_reps, p_lapses, now())
  on conflict (user_id, item_id) do update
     set box = excluded.box, due_on = excluded.due_on, state = excluded.state,
         interval_days = excluded.interval_days, ease = excluded.ease, reps = excluded.reps,
         lapses = excluded.lapses, last_reviewed_at = now(), updated_at = now()
  returning * into result;

  insert into public.reviews (item_id, kind, correct, box_before, box_after, grade, event_id, was_new, ms)
  values (p_item_id, 'word', p_grade <> 'again', coalesce(cur.box, 0), p_box, p_grade, p_event_id,
          not had_card or cur.reps = 0, p_ms);

  return result;
end $$;

revoke execute on function public.apply_grade(uuid, text, text, timestamptz, text, integer, real, integer, integer, smallint, date, integer) from public, anon;
grant execute on function public.apply_grade(uuid, text, text, timestamptz, text, integer, real, integer, integer, smallint, date, integer) to authenticated;
