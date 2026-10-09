-- English Studio database schema (PostgreSQL / Supabase).
-- Paste this whole file into Supabase > SQL Editor and press Run.
--
-- Lesson content (grammar, verbs, vocabulary) lives in the repo under src/content,
-- so these tables hold only what each learner does.

-- One row per quiz attempt on a grammar lesson.
create table if not exists public.lesson_attempts (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  lesson_id   text not null,
  score       smallint not null check (score between 0 and 100),
  passed      boolean not null,
  created_at  timestamptz not null default now()
);
create index if not exists lesson_attempts_user_idx on public.lesson_attempts (user_id, lesson_id);

-- Spaced-repetition cards (Leitner boxes 0-5). item_id is a word id ("v1", "l12")
-- or a verb id ("vb-write"); custom words use "u-<word>".
create table if not exists public.cards (
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  item_id     text not null,
  kind        text not null check (kind in ('word', 'verb')),
  box         smallint not null default 0 check (box between 0 and 5),
  due_on      date not null default current_date,
  -- Only for words the learner added themselves.
  custom_en   text,
  custom_th   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, item_id)
);
create index if not exists cards_due_idx on public.cards (user_id, due_on);

-- Every single review. This is the dataset for the "will I forget this word?" ML project.
create table if not exists public.reviews (
  id           bigint generated always as identity primary key,
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  item_id      text not null,
  kind         text not null check (kind in ('word', 'verb')),
  correct      boolean not null,
  box_before   smallint not null,
  box_after    smallint not null,
  answer       text,
  ms           integer,
  reviewed_at  timestamptz not null default now()
);
create index if not exists reviews_user_time_idx on public.reviews (user_id, reviewed_at desc);

-- Wrong answers from practice and quizzes, so the dashboard can show repeat mistakes.
create table if not exists public.mistakes (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  source      text not null,          -- e.g. 'grammar:1-5' or 'verb:vb-go'
  wrong       text not null,
  correct     text not null,
  note        text,
  created_at  timestamptz not null default now()
);
create index if not exists mistakes_user_idx on public.mistakes (user_id, created_at desc);

-- Best score per lesson, derived from attempts.
create or replace view public.lesson_best
with (security_invoker = true) as
select user_id,
       lesson_id,
       max(score)        as best_score,
       bool_or(passed)   as passed,
       max(created_at)   as last_at
from public.lesson_attempts
group by user_id, lesson_id;

-- Days with any study activity (for streaks and the heatmap), in Bangkok time.
create or replace view public.activity_days
with (security_invoker = true) as
select user_id, day, sum(n)::int as actions
from (
  select user_id, (reviewed_at at time zone 'Asia/Bangkok')::date as day, 1 as n from public.reviews
  union all
  select user_id, (created_at at time zone 'Asia/Bangkok')::date, 1 from public.lesson_attempts
) a
group by user_id, day;

-- Row Level Security: every learner sees and changes only their own rows.
alter table public.lesson_attempts enable row level security;
alter table public.cards           enable row level security;
alter table public.reviews         enable row level security;
alter table public.mistakes        enable row level security;

do $$
declare t text;
begin
  foreach t in array array['lesson_attempts', 'cards', 'reviews', 'mistakes'] loop
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format(
      'create policy "own rows" on public.%I for all to authenticated
         using ((select auth.uid()) = user_id)
         with check ((select auth.uid()) = user_id)', t);
  end loop;
end $$;

-- Data API access. Needed when "Automatically expose new tables" is off,
-- harmless when it is on. Signed-out visitors (anon) get nothing.
revoke all on public.lesson_attempts, public.cards, public.reviews, public.mistakes,
              public.lesson_best, public.activity_days from anon;
grant select, insert, update, delete on public.lesson_attempts, public.cards,
      public.reviews, public.mistakes to authenticated;
grant select on public.lesson_best, public.activity_days to authenticated;

-- Record one review and move the card to its next box in a single call.
-- Intervals in days per box: 0,1,3,7,14,30.
create or replace function public.record_review(
  p_item_id text,
  p_kind    text,
  p_correct boolean,
  p_answer  text default null,
  p_ms      integer default null
) returns public.cards
language plpgsql
security invoker
set search_path = public
as $$
declare
  intervals constant int[] := array[0, 1, 3, 7, 14, 30];
  today   date := (now() at time zone 'Asia/Bangkok')::date;
  before  smallint;
  after   smallint;
  result  public.cards;
begin
  select box into before from public.cards
   where user_id = auth.uid() and item_id = p_item_id;
  before := coalesce(before, 0);
  after  := case when p_correct then least(before + 1, 5) else 0 end;

  insert into public.cards (item_id, kind, box, due_on)
  values (p_item_id, p_kind, after, today + intervals[after + 1])
  on conflict (user_id, item_id) do update
     set box = excluded.box, due_on = excluded.due_on, updated_at = now()
  returning * into result;

  insert into public.reviews (item_id, kind, correct, box_before, box_after, answer, ms)
  values (p_item_id, p_kind, p_correct, before, after, p_answer, p_ms);

  return result;
end $$;

revoke execute on function public.record_review(text, text, boolean, text, integer) from public, anon;
grant execute on function public.record_review(text, text, boolean, text, integer) to authenticated;
