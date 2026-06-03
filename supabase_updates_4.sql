-- SQL script to create holidays table
CREATE TABLE public.holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: In Supabase you might also need to disable RLS if you don't use policies
ALTER TABLE public.holidays DISABLE ROW LEVEL SECURITY;
