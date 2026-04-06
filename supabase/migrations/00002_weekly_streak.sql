-- Add weekly streak tracking columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN weekly_workout_goal integer,
  ADD COLUMN week_start_day integer NOT NULL DEFAULT 1,
  ADD COLUMN current_week_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN streak_last_completed_week text;
