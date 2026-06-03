-- Supabase Updates Part 2: RBAC, Departments, and Leave Balances

-- 1. Add managed_department to employees (For Admins)
ALTER TABLE employees ADD COLUMN IF NOT EXISTS managed_department TEXT;

-- 2. Update the leaves constraint to allow 'Comp Off'
-- PostgreSQL auto-names constraints if not provided. Usually table_column_check.
ALTER TABLE leaves DROP CONSTRAINT IF EXISTS leaves_type_check;
ALTER TABLE leaves ADD CONSTRAINT leaves_type_check CHECK (type IN ('Sick Leave', 'Annual Leave', 'Casual Leave', 'Comp Off'));

-- 3. Create Leave Balances table
CREATE TABLE IF NOT EXISTS leave_balances (
    employee_id UUID PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE,
    sick_leave INTEGER DEFAULT 12,
    casual_leave INTEGER DEFAULT 8,
    comp_off INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Backfill existing employees with default balances
INSERT INTO leave_balances (employee_id)
SELECT id FROM employees
ON CONFLICT (employee_id) DO NOTHING;

-- 5. Disable RLS for the new table (to match development environment setup)
ALTER TABLE leave_balances DISABLE ROW LEVEL SECURITY;
