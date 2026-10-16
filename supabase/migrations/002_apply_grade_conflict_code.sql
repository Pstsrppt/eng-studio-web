-- Fix for 001: report "the card changed in another tab" as HTTP 409 instead of SQLSTATE 40001.
-- PostgREST retries transactions that fail with 40001 (serialization failure), so the old code made
-- the second of two simultaneous grades retry until it timed out. PT409 is answered as 409 at once,
-- and the app re-reads the card and grades again. Safe to run more than once.

create or replace function public.apply_grade(
  p_event_id  uuid,
  p_item_id   text,
  p_grade     text,
  p_expected  timestamptz,
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
