-- Add rejection_comment column to leaves table
ALTER TABLE public.leaves ADD COLUMN IF NOT EXISTS rejection_comment TEXT;
