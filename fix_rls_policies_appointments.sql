-- =====================================================
-- POLÍTICAS RLS PARA SINCRONIZACIÓN DE CITAS
-- =====================================================
-- ⚠️ IMPORTANTE: Ejecutar PASO A PASO, NO todo de una vez
-- Esto evita deadlocks con consultas activas

-- =====================================================
-- PASO 1: VERIFICAR POLÍTICAS EXISTENTES
-- =====================================================
-- Ejecutar solo esta sección primero

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
WHERE tablename IN ('appointments', 'property_appointments')
ORDER BY tablename, cmd;

-- =====================================================
-- PASO 2: HABILITAR RLS (si no está habilitado)
-- =====================================================
-- Ejecutar solo si el paso anterior no mostró políticas

-- ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE property_appointments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASO 3A: POLÍTICA CRÍTICA - INSERT EN APPOINTMENTS
-- =====================================================
-- ⭐ Esta es la MÁS IMPORTANTE para la sincronización
-- Ejecutar SOLO esta sección:

DO $$
BEGIN
  -- Eliminar solo si existe
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' 
    AND policyname = 'Permitir inserción en appointments'
  ) THEN
    DROP POLICY "Permitir inserción en appointments" ON appointments;
  END IF;
  
  -- Crear política de INSERT
  CREATE POLICY "Permitir inserción en appointments"
  ON appointments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
  
  RAISE NOTICE '✅ Política de INSERT en appointments creada';
END $$;

-- =====================================================
-- PASO 3B: POLÍTICA CRÍTICA - INSERT EN PROPERTY_APPOINTMENTS
-- =====================================================
-- Ejecutar SOLO esta sección después del paso anterior:

DO $$
BEGIN
  -- Eliminar solo si existe
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'property_appointments' 
    AND policyname = 'Permitir inserción en property_appointments'
  ) THEN
    DROP POLICY "Permitir inserción en property_appointments" ON property_appointments;
  END IF;
  
  -- Crear política de INSERT
  CREATE POLICY "Permitir inserción en property_appointments"
  ON property_appointments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
  
  RAISE NOTICE '✅ Política de INSERT en property_appointments creada';
END $$;

-- =====================================================
-- PASO 4: POLÍTICAS DE SELECT (LECTURA)
-- =====================================================
-- Ejecutar estas después de los INSERT:

DO $$
BEGIN
  -- SELECT en appointments
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' 
    AND policyname = 'Permitir lectura en appointments'
  ) THEN
    DROP POLICY "Permitir lectura en appointments" ON appointments;
  END IF;
  
  CREATE POLICY "Permitir lectura en appointments"
  ON appointments
  FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL);
  
  -- SELECT en property_appointments
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'property_appointments' 
    AND policyname = 'Permitir lectura en property_appointments'
  ) THEN
    DROP POLICY "Permitir lectura en property_appointments" ON property_appointments;
  END IF;
  
  CREATE POLICY "Permitir lectura en property_appointments"
  ON property_appointments
  FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL);
  
  RAISE NOTICE '✅ Políticas de SELECT creadas';
END $$;

-- =====================================================
-- PASO 5: POLÍTICAS DE UPDATE
-- =====================================================
-- Ejecutar estas al final:

DO $$
BEGIN
  -- UPDATE en appointments
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' 
    AND policyname = 'Permitir actualización en appointments'
  ) THEN
    DROP POLICY "Permitir actualización en appointments" ON appointments;
  END IF;
  
  CREATE POLICY "Permitir actualización en appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
  
  -- UPDATE en property_appointments
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'property_appointments' 
    AND policyname = 'Permitir actualización en property_appointments'
  ) THEN
    DROP POLICY "Permitir actualización en property_appointments" ON property_appointments;
  END IF;
  
  CREATE POLICY "Permitir actualización en property_appointments"
  ON property_appointments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
  
  RAISE NOTICE '✅ Políticas de UPDATE creadas';
END $$;

-- =====================================================
-- PASO 6: VERIFICAR POLÍTICAS CREADAS
-- =====================================================
-- Ejecutar para confirmar que todo está bien:

SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename IN ('appointments', 'property_appointments')
ORDER BY tablename, cmd;

-- =====================================================
-- PASO 7: TEST RÁPIDO (OPCIONAL)
-- =====================================================
-- Solo ejecutar si quieres probar que funciona:

-- Test INSERT en appointments
DO $$
DECLARE
  test_id uuid;
BEGIN
  INSERT INTO appointments (
    title,
    description,
    start_time,
    end_time,
    appointment_type,
    status,
    contact_name,
    contact_email
  ) VALUES (
    'Test RLS',
    'Prueba de política RLS',
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '1 day' + INTERVAL '1 hour',
    'viewing',
    'scheduled',
    'Test User',
    'test@rls.com'
  ) RETURNING id INTO test_id;
  
  -- Eliminar inmediatamente
  DELETE FROM appointments WHERE id = test_id;
  
  RAISE NOTICE '✅ Test de INSERT exitoso - Políticas funcionan correctamente';
END $$;

-- =====================================================
-- RESUMEN FINAL
-- =====================================================

SELECT 
  '✅ CONFIGURACIÓN COMPLETADA' as status,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename IN ('appointments', 'property_appointments');

SELECT 
  tablename,
  COUNT(*) as policies_count
FROM pg_policies 
WHERE tablename IN ('appointments', 'property_appointments')
GROUP BY tablename;
