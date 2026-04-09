-- Add language preference to profiles (ISO 639-1 code, default English)
ALTER TABLE profiles ADD COLUMN language text NOT NULL DEFAULT 'en';
