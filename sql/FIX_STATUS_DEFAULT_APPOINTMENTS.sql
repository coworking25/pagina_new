-- 🔥 ACTUALIZAR DEFAULT Y VALORES DE STATUS EN APPOINTMENTS

-- 1. Ver valores actuales de status
SELECT DISTINCT status, COUNT(*) as count
FROM appointments
GROUP BY status
ORDER BY count DESC;

-- 2. Actualizar todas las citas con status 'scheduled' a 'pending'
UPDATE appointments
SET status = 'pending'
WHERE status = 'scheduled' OR status IS NULL;

-- 3. Cambiar el default de 'scheduled' a 'pending'
ALTER TABLE appointments 
ALTER COLUMN status SET DEFAULT 'pending';

-- 4. Verificar que se aplicaron los cambios
SELECT DISTINCT status, COUNT(*) as count
FROM appointments
GROUP BY status
ORDER BY count DESC;

-- 5. Verificar el nuevo default
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'appointments'
  AND column_name = 'status';
