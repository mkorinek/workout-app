ALTER TABLE public.profiles
ADD COLUMN tracked_exercises text[] NOT NULL DEFAULT '{}';
