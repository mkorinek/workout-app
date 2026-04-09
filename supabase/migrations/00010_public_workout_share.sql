-- Allow anyone to read completed workout sessions (for sharing)
CREATE POLICY "Public read completed sessions"
  ON public.workout_sessions
  FOR SELECT
  USING (completed_at IS NOT NULL);

-- Allow anyone to read sets of completed sessions (for sharing)
CREATE POLICY "Public read sets of completed sessions"
  ON public.workout_sets
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.workout_sessions
    WHERE workout_sessions.id = workout_sets.session_id
    AND workout_sessions.completed_at IS NOT NULL
  ));

-- Allow anyone to read personal records linked to completed sessions (for sharing)
CREATE POLICY "Public read PRs of completed sessions"
  ON public.personal_records
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.workout_sets
    JOIN public.workout_sessions ON workout_sessions.id = workout_sets.session_id
    WHERE workout_sets.id = personal_records.set_id
    AND workout_sessions.completed_at IS NOT NULL
  ));
