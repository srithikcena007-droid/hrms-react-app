ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_status_check;
ALTER TABLE employees ADD CONSTRAINT employees_status_check CHECK (status IN ('Active', 'On Leave', 'On Notice', 'Released'));
