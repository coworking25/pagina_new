-- 🔥 ACTUALIZAR CHECK CONSTRAINT DE STATUS EN APPOINTMENTS

-- 1. Ver el constraint actual
SELECT 
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'appointments' 
    AND tc.constraint_type = 'CHECK'
    AND cc.check_clause LIKE '%status%';

-- 2. Ver valores actuales de status (ANTES de cambiar)
SELECT DISTINCT status, COUNT(*) as count
FROM appointments
GROUP BY status
ORDER BY count DESC;

-- 3. Eliminar el constraint viejo 'valid_status' PRIMERO
ALTER TABLE appointments 
DROP CONSTRAINT IF EXISTS valid_status;

-- 4. Actualizar citas con status 'scheduled' a 'pending' (SIN constraint)
UPDATE appointments
SET status = 'pending'
WHERE status = 'scheduled' OR status IS NULL;

-- 5. Verificar que todos los status son válidos ahora
SELECT DISTINCT status, COUNT(*) as count
FROM appointments
GROUP BY status
ORDER BY count DESC;

-- 6. AHORA crear nuevo constraint con los valores correctos
ALTER TABLE appointments
ADD CONSTRAINT valid_status CHECK (
    status IN (
        'pending', 
        'confirmed', 
        'completed', 
        'cancelled', 
        'no_show', 
        'rescheduled'
    )
);

-- 5. Cambiar el default de 'scheduled' a 'pending'
ALTER TABLE appointments 
ALTER COLUMN status SET DEFAULT 'pending';

-- 6. Verificar el nuevo constraint
SELECT 
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'appointments' 
    AND tc.constraint_type = 'CHECK'
    AND cc.check_clause LIKE '%status%';

-- 7. Ver distribución de status
SELECT DISTINCT status, COUNT(*) as count
FROM appointments
GROUP BY status
ORDER BY count DESC;

-- 8. Verificar el nuevo default
SELECT column_name, column_default
FROM information_schema.columns
WHERE table_name = 'appointments'
  AND column_name = 'status';
