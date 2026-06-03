-- Add reason column to leaves table
ALTER TABLE public.leaves ADD COLUMN IF NOT EXISTS reason TEXT;
