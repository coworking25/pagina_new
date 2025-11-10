-- Verificar valores únicos de status en appointments
SELECT DISTINCT status, COUNT(*) as count
FROM appointments
GROUP BY status
ORDER BY count DESC;

-- Ver estructura del check constraint de status
SELECT 
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'appointments' 
    AND tc.constraint_type = 'CHECK'
    AND cc.check_clause LIKE '%status%';

-- Ver todas las citas con su status
SELECT 
    id,
    contact_name,
    start_time,
    status,
    created_at
FROM appointments
ORDER BY created_at DESC
LIMIT 10;
