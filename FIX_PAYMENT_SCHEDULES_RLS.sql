-- =====================================================
-- SCRIPT: ARREGLAR POLÍTICAS RLS DE PAYMENT_SCHEDULES
-- Fecha: 2026-01-14
-- Problema: Error 403 - RLS policy violation
-- =====================================================

-- 1. Verificar si existen políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'payment_schedules';

-- 2. Habilitar RLS en la tabla (si no está habilitado)
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;

-- 3. ELIMINAR políticas existentes que puedan causar problemas
DROP POLICY IF EXISTS "payment_schedules_select_policy" ON payment_schedules;
DROP POLICY IF EXISTS "payment_schedules_insert_policy" ON payment_schedules;
DROP POLICY IF EXISTS "payment_schedules_update_policy" ON payment_schedules;
DROP POLICY IF EXISTS "payment_schedules_delete_policy" ON payment_schedules;

-- 4. CREAR nuevas políticas permisivas

-- Política para SELECT (lectura)
CREATE POLICY "payment_schedules_select_policy"
ON payment_schedules
FOR SELECT
TO authenticated
USING (true);

-- Política para INSERT (creación)
CREATE POLICY "payment_schedules_insert_policy"
ON payment_schedules
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para UPDATE (actualización)
CREATE POLICY "payment_schedules_update_policy"
ON payment_schedules
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para DELETE (eliminación)
CREATE POLICY "payment_schedules_delete_policy"
ON payment_schedules
FOR DELETE
TO authenticated
USING (true);

-- 5. Verificar que las políticas se crearon correctamente
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies
WHERE tablename = 'payment_schedules'
ORDER BY policyname;

-- 6. También verificar/arreglar payment_receipts si existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_receipts') THEN
        -- Habilitar RLS
        ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;
        
        -- Eliminar políticas antiguas
        DROP POLICY IF EXISTS "payment_receipts_select_policy" ON payment_receipts;
        DROP POLICY IF EXISTS "payment_receipts_insert_policy" ON payment_receipts;
        DROP POLICY IF EXISTS "payment_receipts_update_policy" ON payment_receipts;
        DROP POLICY IF EXISTS "payment_receipts_delete_policy" ON payment_receipts;
        
        -- Crear nuevas políticas
        CREATE POLICY "payment_receipts_select_policy"
        ON payment_receipts FOR SELECT TO authenticated USING (true);
        
        CREATE POLICY "payment_receipts_insert_policy"
        ON payment_receipts FOR INSERT TO authenticated WITH CHECK (true);
        
        CREATE POLICY "payment_receipts_update_policy"
        ON payment_receipts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
        
        CREATE POLICY "payment_receipts_delete_policy"
        ON payment_receipts FOR DELETE TO authenticated USING (true);
        
        RAISE NOTICE '✅ Políticas RLS de payment_receipts actualizadas';
    ELSE
        RAISE NOTICE 'ℹ️ Tabla payment_receipts no existe';
    END IF;
END $$;

-- 7. Mensaje final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ========================================';
    RAISE NOTICE '✅ POLÍTICAS RLS ACTUALIZADAS EXITOSAMENTE';
    RAISE NOTICE '✅ ========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Las siguientes operaciones ahora están permitidas:';
    RAISE NOTICE '  ✓ SELECT - Todos los usuarios autenticados';
    RAISE NOTICE '  ✓ INSERT - Todos los usuarios autenticados';
    RAISE NOTICE '  ✓ UPDATE - Todos los usuarios autenticados';
    RAISE NOTICE '  ✓ DELETE - Todos los usuarios autenticados';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ NOTA: Estas son políticas permisivas para desarrollo.';
    RAISE NOTICE '   En producción, considera políticas más restrictivas.';
    RAISE NOTICE '';
END $$;
