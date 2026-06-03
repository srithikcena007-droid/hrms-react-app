-- Update salary_payments table with dynamic salary breakdown columns
ALTER TABLE public.salary_payments 
ADD COLUMN IF NOT EXISTS basic_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS hra_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS conveyance_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS special_allowance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS pf_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tds_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS professional_tax NUMERIC DEFAULT 0;
