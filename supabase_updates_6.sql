-- Add avatar_url column to employees table for profile pictures
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS avatar_url TEXT;
