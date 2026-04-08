-- Allow all authenticated users to view all profiles (for leaderboards, social features)
CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');