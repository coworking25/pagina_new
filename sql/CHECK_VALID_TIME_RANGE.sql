-- Ver el constraint valid_time_range
SELECT 
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'appointments' 
    AND tc.constraint_name = 'valid_time_range';
