-- Add note field to workout_sets for per-set feedback (e.g. "felt heavy", "easy", "form broke down")
ALTER TABLE workout_sets ADD COLUMN note text DEFAULT NULL;
