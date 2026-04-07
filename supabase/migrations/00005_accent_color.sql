-- Add accent color preference to profiles (index into preset array, 0 = blue default)
ALTER TABLE profiles ADD COLUMN accent_color integer NOT NULL DEFAULT 0;
