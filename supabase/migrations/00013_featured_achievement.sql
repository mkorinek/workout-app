-- Allow users to pin one unlocked achievement as their featured badge
alter table public.profiles
  add column featured_achievement_id uuid references public.achievements(id) on delete set null;
