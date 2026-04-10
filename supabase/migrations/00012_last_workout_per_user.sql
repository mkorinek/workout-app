-- Returns the most recent completed workout for each of the given user IDs.
-- Uses DISTINCT ON to efficiently pick one row per user in Postgres.
create or replace function get_last_workouts(user_ids uuid[])
returns table(user_id uuid, completed_at timestamptz) as $$
  select distinct on (ws.user_id)
    ws.user_id,
    ws.completed_at
  from workout_sessions ws
  where ws.user_id = any(user_ids)
    and ws.completed_at is not null
  order by ws.user_id, ws.completed_at desc;
$$ language sql stable;
