-- Add admin flag to profiles
ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
