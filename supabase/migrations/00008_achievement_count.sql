-- Add achievement_count to profiles for efficient social display
ALTER TABLE public.profiles
  ADD COLUMN achievement_count integer NOT NULL DEFAULT 0;

-- Backfill from existing data
UPDATE public.profiles p
SET achievement_count = (
  SELECT COUNT(*) FROM public.user_achievements ua WHERE ua.user_id = p.id
);

-- RPC to atomically increment achievement_count
CREATE OR REPLACE FUNCTION public.increment_achievement_count(user_id_input uuid, amount integer)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.profiles
  SET achievement_count = achievement_count + amount
  WHERE id = user_id_input;
$$;
