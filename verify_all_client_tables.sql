-- ===================================================================
-- SCRIPT DE VERIFICACIÓN COMPLETA - TABLAS DE CLIENTES
-- ===================================================================
-- Fecha: 20 de Octubre, 2025
-- Propósito: Verificar existencia, estructura y políticas RLS de todas las tablas

-- ===================================================================
-- 1. VERIFICAR QUÉ TABLAS EXISTEN
-- ===================================================================

SELECT 
  '📋 TABLAS EXISTENTES' as seccion;

SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'clients',
      'client_portal_credentials',
      'client_documents',
      'client_payment_config',
      'client_references',
      'client_contract_info',
      'client_property_relations'
    ) THEN '✅ ESPERADA'
    ELSE '❓ ADICIONAL'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'client%'
ORDER BY table_name;

-- ===================================================================
-- 2. VERIFICAR POLÍTICAS RLS DE CADA TABLA
-- ===================================================================

SELECT 
  '🔒 POLÍTICAS RLS' as seccion;

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as comando,
  qual as "USING_clause",
  CASE 
    WHEN with_check IS NULL THEN '❌ FALTA WITH CHECK'
    ELSE '✅ WITH CHECK OK'
  END as with_check_status,
  CASE 
    WHEN qual IS NULL THEN '❌ FALTA USING'
    ELSE '✅ USING OK'
  END as using_status
FROM pg_policies 
WHERE tablename LIKE 'client%'
ORDER BY tablename, cmd;

-- ===================================================================
-- 3. VERIFICAR QUE RLS ESTÉ HABILITADO
-- ===================================================================

SELECT 
  '🛡️ RLS HABILITADO' as seccion;

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity = true THEN '✅ HABILITADO'
    ELSE '❌ DESHABILITADO'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'client%'
ORDER BY tablename;

-- ===================================================================
-- 4. VERIFICAR ESTRUCTURA DE CADA TABLA
-- ===================================================================

SELECT 
  '📊 ESTRUCTURA: clients' as seccion;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'clients'
ORDER BY ordinal_position;

-- -------------------------------------------------------------------

SELECT 
  '📊 ESTRUCTURA: client_portal_credentials' as seccion;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'client_portal_credentials'
ORDER BY ordinal_position;

-- -------------------------------------------------------------------

SELECT 
  '📊 ESTRUCTURA: client_documents' as seccion;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'client_documents'
ORDER BY ordinal_position;

-- -------------------------------------------------------------------

SELECT 
  '📊 ESTRUCTURA: client_payment_config' as seccion;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'client_payment_config'
ORDER BY ordinal_position;

-- -------------------------------------------------------------------

SELECT 
  '📊 ESTRUCTURA: client_references' as seccion;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'client_references'
ORDER BY ordinal_position;

-- -------------------------------------------------------------------

SELECT 
  '📊 ESTRUCTURA: client_contract_info' as seccion;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'client_contract_info'
ORDER BY ordinal_position;

-- -------------------------------------------------------------------

SELECT 
  '📊 ESTRUCTURA: client_property_relations' as seccion;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'client_property_relations'
ORDER BY ordinal_position;

-- ===================================================================
-- 5. VERIFICAR RELACIONES FOREIGN KEY
-- ===================================================================

SELECT 
  '🔗 RELACIONES (FOREIGN KEYS)' as seccion;

SELECT 
  tc.table_name as tabla_origen,
  kcu.column_name as columna_origen,
  ccu.table_name as tabla_referenciada,
  ccu.column_name as columna_referenciada,
  rc.delete_rule as on_delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name LIKE 'client%'
ORDER BY tc.table_name;

-- ===================================================================
-- 6. VERIFICAR ÍNDICES
-- ===================================================================

SELECT 
  '📇 ÍNDICES' as seccion;

SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename LIKE 'client%'
ORDER BY tablename, indexname;

-- ===================================================================
-- 7. CONTAR REGISTROS EN CADA TABLA
-- ===================================================================

SELECT 
  '📈 CONTEO DE REGISTROS' as seccion;

SELECT 
  'clients' as tabla,
  COUNT(*) as total_registros
FROM clients
UNION ALL
SELECT 
  'client_portal_credentials' as tabla,
  COUNT(*) as total_registros
FROM client_portal_credentials
UNION ALL
SELECT 
  'client_documents' as tabla,
  COUNT(*) as total_registros
FROM client_documents
UNION ALL
SELECT 
  'client_payment_config' as tabla,
  COUNT(*) as total_registros
FROM client_payment_config
UNION ALL
SELECT 
  'client_references' as tabla,
  COUNT(*) as total_registros
FROM client_references
UNION ALL
SELECT 
  'client_contract_info' as tabla,
  COUNT(*) as total_registros
FROM client_contract_info
UNION ALL
SELECT 
  'client_property_relations' as tabla,
  COUNT(*) as total_registros
FROM client_property_relations
ORDER BY tabla;

-- ===================================================================
-- 8. VERIFICAR SI HAY TABLAS HUÉRFANAS (sin políticas RLS)
-- ===================================================================

SELECT 
  '⚠️ TABLAS SIN POLÍTICAS RLS' as seccion;

SELECT 
  t.tablename,
  '❌ SIN POLÍTICAS' as status
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.tablename LIKE 'client%'
  AND t.rowsecurity = true
  AND NOT EXISTS (
    SELECT 1 
    FROM pg_policies p 
    WHERE p.tablename = t.tablename
  )
ORDER BY t.tablename;

-- ===================================================================
-- 9. RESUMEN FINAL - CHECKLIST
-- ===================================================================

SELECT 
  '✅ CHECKLIST FINAL' as seccion;

SELECT 
  tabla,
  CASE WHEN existe THEN '✅' ELSE '❌' END as existe,
  CASE WHEN rls_enabled THEN '✅' ELSE '❌' END as rls_habilitado,
  CASE WHEN tiene_politicas THEN '✅' ELSE '❌' END as tiene_politicas,
  CASE WHEN with_check_ok THEN '✅' ELSE '❌' END as with_check_correcto
FROM (
  SELECT 
    'clients' as tabla,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') as existe,
    EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'clients' AND rowsecurity = true) as rls_enabled,
    EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'clients') as tiene_politicas,
    EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND with_check IS NOT NULL) as with_check_ok
  UNION ALL
  SELECT 
    'client_portal_credentials' as tabla,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'client_portal_credentials') as existe,
    EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'client_portal_credentials' AND rowsecurity = true) as rls_enabled,
    EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'client_portal_credentials') as tiene_politicas,
    EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'client_portal_credentials' AND with_check IS NOT NULL) as with_check_ok
  UNION ALL
  SELECT 
    'client_documents' as tabla,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'client_documents') as existe,
    EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'client_documents' AND rowsecurity = true) as rls_enabled,
    EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'client_documents') as tiene_politicas,
    EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'client_documents' AND with_check IS NOT NULL) as with_check_ok
  UNION ALL
  SELECT 
    'client_payment_config' as tabla,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'client_payment_config') as existe,
    EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'client_payment_config' AND rowsecurity = true) as rls_enabled,
    EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'client_payment_config') as tiene_politicas,
    EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'client_payment_config' AND with_check IS NOT NULL) as with_check_ok
  UNION ALL
  SELECT 
    'client_references' as tabla,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'client_references') as existe,
    EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'client_references' AND rowsecurity = true) as rls_enabled,
    EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'client_references') as tiene_politicas,
    EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'client_references' AND with_check IS NOT NULL) as with_check_ok
  UNION ALL
  SELECT 
    'client_contract_info' as tabla,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'client_contract_info') as existe,
    EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'client_contract_info' AND rowsecurity = true) as rls_enabled,
    EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'client_contract_info') as tiene_politicas,
    EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'client_contract_info' AND with_check IS NOT NULL) as with_check_ok
  UNION ALL
  SELECT 
    'client_property_relations' as tabla,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'client_property_relations') as existe,
    EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'client_property_relations' AND rowsecurity = true) as rls_enabled,
    EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'client_property_relations') as tiene_politicas,
    EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'client_property_relations' AND with_check IS NOT NULL) as with_check_ok
) as checklist
ORDER BY tabla;

-- ===================================================================
-- INTERPRETACIÓN DE RESULTADOS
-- ===================================================================

/*
✅ = Todo correcto
❌ = Necesita corrección

CHECKLIST FINAL debe mostrar:
✅✅✅✅ = Tabla perfecta
❌ en "existe" = Tabla no creada, ejecutar create_missing_client_tables.sql
❌ en "rls_habilitado" = Ejecutar: ALTER TABLE [tabla] ENABLE ROW LEVEL SECURITY;
❌ en "tiene_politicas" = Crear política RLS para la tabla
❌ en "with_check_correcto" = Agregar WITH CHECK a la política existente

ERRORES COMUNES:
- Error 406: Tabla no existe o columnas incorrectas
- Error 403: RLS bloqueando (falta WITH CHECK)
- Error 401: Usuario no autenticado
- Error 500: Foreign key constraint falla

SIGUIENTE PASO:
Si hay ❌ en el checklist, ejecutar create_missing_client_tables.sql
*/
