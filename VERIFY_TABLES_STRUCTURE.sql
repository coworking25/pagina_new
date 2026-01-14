-- =====================================================
-- SCRIPT: VERIFICAR ESTRUCTURA DE TABLAS
-- Fecha: 2026-01-14
-- Propósito: Verificar columnas y foreign keys
-- =====================================================

-- 1. Verificar estructura de payment_schedules
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'payment_schedules'
ORDER BY ordinal_position;

-- 2. Verificar foreign keys de payment_schedules
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'payment_schedules';

-- 3. Verificar estructura de client_alerts
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'client_alerts'
ORDER BY ordinal_position;

-- 4. Verificar si existe tabla advisors
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_name IN ('advisors', 'system_users', 'auth.users')
ORDER BY table_name;

-- 5. Verificar qué columnas tiene payment_schedules relacionadas con usuario
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'payment_schedules'
    AND column_name LIKE '%user%' 
    OR column_name LIKE '%created%'
    OR column_name LIKE '%updated%'
ORDER BY column_name;

-- 6. SOLUCIÓN: Si created_by referencia a 'advisors' pero debe ser a 'system_users'
-- Descomentar si necesitas cambiar la foreign key:
/*
ALTER TABLE payment_schedules
DROP CONSTRAINT IF EXISTS payment_schedules_created_by_fkey;

ALTER TABLE payment_schedules
DROP CONSTRAINT IF EXISTS payment_schedules_updated_by_fkey;

-- Si las columnas no existen, crearlas:
ALTER TABLE payment_schedules
ADD COLUMN IF NOT EXISTS created_by UUID;

ALTER TABLE payment_schedules
ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Agregar foreign keys correctos a system_users (si existe) o auth.users
-- Opción A: Si existe system_users
ALTER TABLE payment_schedules
ADD CONSTRAINT payment_schedules_created_by_fkey
FOREIGN KEY (created_by) REFERENCES system_users(id);

ALTER TABLE payment_schedules
ADD CONSTRAINT payment_schedules_updated_by_fkey
FOREIGN KEY (updated_by) REFERENCES system_users(id);

-- Opción B: Si solo existe auth.users
ALTER TABLE payment_schedules
ADD CONSTRAINT payment_schedules_created_by_fkey
FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE payment_schedules
ADD CONSTRAINT payment_schedules_updated_by_fkey
FOREIGN KEY (updated_by) REFERENCES auth.users(id);
*/

-- 7. Mensaje final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ========================================';
    RAISE NOTICE '✅ VERIFICACIÓN DE ESTRUCTURA COMPLETADA';
    RAISE NOTICE '✅ ========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Revisa los resultados arriba para:';
    RAISE NOTICE '  1. Columnas de payment_schedules';
    RAISE NOTICE '  2. Foreign keys de payment_schedules';
    RAISE NOTICE '  3. Columnas de client_alerts';
    RAISE NOTICE '  4. Tablas de usuarios disponibles';
    RAISE NOTICE '  5. Columnas de usuario en payment_schedules';
    RAISE NOTICE '';
END $$;
