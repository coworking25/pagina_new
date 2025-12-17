-- =====================================================
-- FIX AUDIT LOG - PASO 2: MODIFICAR TABLA
-- =====================================================
-- Ejecuta este paso después del Paso 1

-- 1. Eliminar la constraint de foreign key
ALTER TABLE client_audit_log 
DROP CONSTRAINT IF EXISTS client_audit_log_changed_by_fkey;

-- 2. Hacer la columna nullable
ALTER TABLE client_audit_log 
ALTER COLUMN changed_by DROP NOT NULL;

-- 3. Recrear la constraint como nullable
ALTER TABLE client_audit_log
ADD CONSTRAINT client_audit_log_changed_by_fkey 
FOREIGN KEY (changed_by) 
REFERENCES advisors(id) 
ON DELETE SET NULL;

-- 4. Recrear índice
DROP INDEX IF EXISTS idx_audit_log_changed_by;
CREATE INDEX idx_audit_log_changed_by 
ON client_audit_log(changed_by) 
WHERE changed_by IS NOT NULL;

SELECT '✅ Paso 2 completado: Tabla modificada' as status;
