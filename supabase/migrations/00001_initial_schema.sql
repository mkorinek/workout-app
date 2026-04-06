-- Enable trigram extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. User profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  default_rest_seconds integer NOT NULL DEFAULT 60,
  timer_sound boolean NOT NULL DEFAULT true,
  timer_vibration boolean NOT NULL DEFAULT true,
  timer_flash boolean NOT NULL DEFAULT true,
  total_volume_kg numeric(12,2) NOT NULL DEFAULT 0,
  lifter_rank text NOT NULL DEFAULT 'ROOKIE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'full_name', new.email));
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Saved exercises per user
CREATE TABLE public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own exercises" ON public.exercises FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_exercises_name ON public.exercises USING gin (name gin_trgm_ops);

-- 3. Workout templates
CREATE TABLE public.workout_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  exercises jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own templates" ON public.workout_templates FOR ALL USING (auth.uid() = user_id);

-- 4. Workout sessions
CREATE TABLE public.workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.workout_templates(id) ON DELETE SET NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  notes text
);

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own sessions" ON public.workout_sessions FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_sessions_user_date ON public.workout_sessions(user_id, started_at DESC);

-- 5. Individual sets within a session
CREATE TABLE public.workout_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_name text NOT NULL,
  set_number integer NOT NULL,
  weight_kg numeric(6,2) NOT NULL DEFAULT 0,
  reps integer NOT NULL DEFAULT 0,
  rest_seconds integer NOT NULL DEFAULT 60,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own sets" ON public.workout_sets FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.workout_sessions s
    WHERE s.id = workout_sets.session_id AND s.user_id = auth.uid()
  ));
CREATE INDEX idx_sets_session ON public.workout_sets(session_id, set_number);
CREATE INDEX idx_sets_exercise ON public.workout_sets(exercise_name, created_at DESC);

-- 6. Personal records
CREATE TABLE public.personal_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name text NOT NULL,
  record_type text NOT NULL CHECK (record_type IN ('max_weight', 'max_reps', 'max_volume')),
  value numeric(8,2) NOT NULL,
  achieved_at timestamptz NOT NULL DEFAULT now(),
  set_id uuid REFERENCES public.workout_sets(id) ON DELETE SET NULL,
  UNIQUE(user_id, exercise_name, record_type)
);

ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own records" ON public.personal_records FOR ALL USING (auth.uid() = user_id);

-- 7. Achievement definitions (seeded, not user-created)
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('milestone', 'streak', 'hidden')),
  condition_type text NOT NULL,
  condition_value numeric NOT NULL,
  icon text NOT NULL DEFAULT '>'
);

-- No RLS needed — achievements are global read-only definitions
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read achievements" ON public.achievements FOR SELECT USING (true);

-- 8. User achievements (unlocked)
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own achievements" ON public.user_achievements FOR ALL USING (auth.uid() = user_id);

-- Seed achievements
INSERT INTO public.achievements (name, description, category, condition_type, condition_value, icon) VALUES
  -- Milestones
  ('Century Club', 'Lift 100kg in a single set', 'milestone', 'single_set_weight', 100, '#'),
  ('Iron Will', 'Complete 500 total sets', 'milestone', 'total_sets', 500, '!'),
  ('Volume King', 'Lift 10,000kg total volume in one session', 'milestone', 'session_volume', 10000, '*'),
  ('First Blood', 'Complete your first workout', 'milestone', 'total_workouts', 1, '>'),
  ('Fifty Strong', 'Complete 50 workouts', 'milestone', 'total_workouts', 50, '%'),
  ('Heavy Lifter', 'Lift 200kg in a single set', 'milestone', 'single_set_weight', 200, '&'),
  -- Streaks
  ('On Fire', 'Work out 3 days in a row', 'streak', 'streak_days', 3, '~'),
  ('Machine', 'Work out 7 days in a row', 'streak', 'streak_days', 7, '='),
  ('Unstoppable', 'Work out 30 days in a row', 'streak', 'streak_days', 30, '^'),
  ('Weekly Warrior', '4 workouts in a single week', 'streak', 'weekly_workouts', 4, '+'),
  -- Hidden (descriptions intentionally vague until unlocked)
  ('Night Owl', '???', 'hidden', 'workout_after_midnight', 1, '@'),
  ('Marathon', '???', 'hidden', 'workout_duration_minutes', 120, '$'),
  ('Minimalist', '???', 'hidden', 'exercises_in_session', 1, '.'),
  ('The Grind', '???', 'hidden', 'sets_in_session', 100, '|');
