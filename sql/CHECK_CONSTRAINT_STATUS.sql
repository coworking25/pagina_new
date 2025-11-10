-- Ver el CHECK constraint de status
SELECT 
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'appointments' 
    AND tc.constraint_type = 'CHECK'
    AND cc.check_clause LIKE '%status%';

-- Ver todos los CHECK constraints de la tabla appointments
SELECT 
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'appointments' 
    AND tc.constraint_type = 'CHECK';
