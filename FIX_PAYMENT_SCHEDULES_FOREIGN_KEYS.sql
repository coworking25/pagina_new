-- =====================================================
-- SCRIPT: ARREGLAR FOREIGN KEYS DE PAYMENT_SCHEDULES
-- Fecha: 2026-01-14
-- Problema: created_by/updated_by apuntan a 'advisors' 
--           pero el admin no está en esa tabla
-- =====================================================

-- PASO 1: Verificar las tablas de usuarios disponibles
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_name IN ('advisors', 'system_users')
  AND table_schema = 'public'
ORDER BY table_name;

-- PASO 2: Eliminar los foreign keys problemáticos
ALTER TABLE payment_schedules
DROP CONSTRAINT IF EXISTS payment_schedules_created_by_fkey;

ALTER TABLE payment_schedules
DROP CONSTRAINT IF EXISTS payment_schedules_updated_by_fkey;

-- PASO 3: Hacer las columnas nullable (permitir NULL)
ALTER TABLE payment_schedules
ALTER COLUMN created_by DROP NOT NULL;

ALTER TABLE payment_schedules
ALTER COLUMN updated_by DROP NOT NULL;

-- PASO 4: Agregar nuevos foreign keys OPCIONALES a system_users
-- Esto permite que created_by/updated_by puedan ser NULL
-- o referenciar a cualquier usuario en system_users

-- Verificar si existe system_users
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'system_users' 
        AND table_schema = 'public'
    ) THEN
        -- Agregar foreign keys a system_users (con ON DELETE SET NULL)
        ALTER TABLE payment_schedules
        ADD CONSTRAINT payment_schedules_created_by_fkey
        FOREIGN KEY (created_by) 
        REFERENCES system_users(id)
        ON DELETE SET NULL;

        ALTER TABLE payment_schedules
        ADD CONSTRAINT payment_schedules_updated_by_fkey
        FOREIGN KEY (updated_by) 
        REFERENCES system_users(id)
        ON DELETE SET NULL;
        
        RAISE NOTICE '✅ Foreign keys actualizados a system_users';
    ELSE
        RAISE NOTICE '⚠️ Tabla system_users no existe - columnas quedan sin foreign key';
        RAISE NOTICE '   Los campos created_by/updated_by ahora aceptan NULL';
    END IF;
END $$;

-- PASO 5: Verificar los nuevos constraints
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
    AND tc.table_name = 'payment_schedules'
ORDER BY kcu.column_name;

-- PASO 6: Mensaje final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ================================================';
    RAISE NOTICE '✅ FOREIGN KEYS DE PAYMENT_SCHEDULES ACTUALIZADOS';
    RAISE NOTICE '✅ ================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Cambios realizados:';
    RAISE NOTICE '  ✓ Eliminados constraints a tabla "advisors"';
    RAISE NOTICE '  ✓ Columnas created_by/updated_by ahora permiten NULL';
    RAISE NOTICE '  ✓ Foreign keys actualizados (si existe system_users)';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ IMPORTANTE:';
    RAISE NOTICE '   Si no usas created_by/updated_by en el código,';
    RAISE NOTICE '   estos campos quedarán en NULL automáticamente.';
    RAISE NOTICE '';
END $$;
