-- Follow system: users can follow other users

CREATE TABLE public.follows (
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Users can see their own follows
CREATE POLICY "Users can view own follows"
  ON public.follows FOR SELECT
  USING (auth.uid() = follower_id);

-- Users can follow others
CREATE POLICY "Users can insert own follows"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "Users can delete own follows"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);

-- Function to search users by email (auth.users not directly queryable)
-- Returns matching profiles with email for the search UI
CREATE OR REPLACE FUNCTION public.search_users_by_email(search_query text)
RETURNS TABLE (
  id uuid,
  display_name text,
  email text,
  lifter_rank text,
  total_volume_kg numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.display_name,
    u.email::text,
    p.lifter_rank,
    p.total_volume_kg
  FROM auth.users u
  JOIN public.profiles p ON p.id = u.id
  WHERE u.email ILIKE '%' || search_query || '%'
    AND u.id != auth.uid()
  LIMIT 10;
END;
$$;
