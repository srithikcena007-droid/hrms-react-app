-- Add reports_to column
ALTER TABLE employees ADD COLUMN reports_to UUID REFERENCES employees(id);
