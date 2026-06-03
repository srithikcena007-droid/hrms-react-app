-- Supabase Schema for HRMS Application

-- Employees Table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID,
    emp_code TEXT UNIQUE NOT NULL, -- Format: STS001, STS002...
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT,
    role TEXT CHECK (role IN ('superadmin', 'admin', 'employee')),
    designation TEXT,
    status TEXT CHECK (status IN ('Active', 'On Leave')),
    date_of_joining DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Attendance Table
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    status TEXT CHECK (status IN ('Present', 'Late', 'Absent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Leaves Table
CREATE TABLE leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('Sick Leave', 'Annual Leave', 'Casual Leave')),
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    days INTEGER NOT NULL,
    status TEXT CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inbox Table
CREATE TABLE inbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES employees(id) ON DELETE SET NULL, -- Nullable for system messages
    receiver_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Salary Configs Table
CREATE TABLE salary_configs (
    employee_id UUID PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE,
    ctc NUMERIC,
    basic NUMERIC,
    hra NUMERIC,
    cca NUMERIC,
    conveyance NUMERIC,
    special_allowance NUMERIC,
    pf NUMERIC,
    esic NUMERIC,
    tds NUMERIC,
    professional_tax NUMERIC,
    loan_repayment NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Salary Payments Table
CREATE TABLE salary_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    amount_paid NUMERIC NOT NULL,
    payment_date DATE NOT NULL,
    month_days INTEGER,
    paid_days INTEGER,
    lop_days INTEGER,
    lop_amount NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
