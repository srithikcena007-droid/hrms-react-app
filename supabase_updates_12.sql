-- =============================================================
-- HRMS Supabase Updates Script 12
-- Run this in your Supabase SQL Editor
-- =============================================================

-- Change days column to NUMERIC to support half days (0.5)
ALTER TABLE leaves ALTER COLUMN days TYPE NUMERIC USING days::numeric;

-- Add reason column if not exists (for leave edits)
ALTER TABLE leaves ADD COLUMN IF NOT EXISTS reason TEXT;
