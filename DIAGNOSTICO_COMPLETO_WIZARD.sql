-- ===================================================================
-- DIAGNÓSTICO COMPLETO DEL WIZARD Y TABLAS DE CLIENTES
-- ===================================================================

-- 1. VER TODAS LAS TABLAS RELACIONADAS CON CLIENTS
SELECT 
  '📊 TABLAS EXISTENTES' as seccion,
  table_name as tabla,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as num_columnas
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name LIKE 'client%'
ORDER BY table_name;

-- ===================================================================
-- 2. VER POLÍTICAS RLS DE TODAS LAS TABLAS DE CLIENTES
-- ===================================================================

SELECT 
  '🔒 POLÍTICAS RLS' as seccion,
  tablename as tabla,
  policyname as politica,
  cmd as comando,
  qual as condicion_using,
  with_check as condicion_with_check
FROM pg_policies
WHERE tablename LIKE 'client%'
ORDER BY tablename, cmd, policyname;

-- ===================================================================
-- 3. VERIFICAR SI RLS ESTÁ HABILITADO
-- ===================================================================

SELECT 
  '🔐 RLS HABILITADO' as seccion,
  tablename as tabla,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'client%'
ORDER BY tablename;

-- ===================================================================
-- 4. VER ESTRUCTURA DE CADA TABLA
-- ===================================================================

-- client_portal_credentials
SELECT 
  '📋 ESTRUCTURA: client_portal_credentials' as seccion,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'client_portal_credentials'
ORDER BY ordinal_position;

-- client_documents
SELECT 
  '📋 ESTRUCTURA: client_documents' as seccion,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'client_documents'
ORDER BY ordinal_position;

-- client_payment_config
SELECT 
  '📋 ESTRUCTURA: client_payment_config' as seccion,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'client_payment_config'
ORDER BY ordinal_position;

-- client_references
SELECT 
  '📋 ESTRUCTURA: client_references' as seccion,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'client_references'
ORDER BY ordinal_position;

-- client_contract_info
SELECT 
  '📋 ESTRUCTURA: client_contract_info' as seccion,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'client_contract_info'
ORDER BY ordinal_position;

-- client_property_relations
SELECT 
  '📋 ESTRUCTURA: client_property_relations' as seccion,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'client_property_relations'
ORDER BY ordinal_position;

-- ===================================================================
-- 5. VERIFICAR FOREIGN KEYS
-- ===================================================================

SELECT 
  '🔗 FOREIGN KEYS' as seccion,
  tc.table_name as tabla_hijo,
  kcu.column_name as columna,
  ccu.table_name as tabla_padre,
  ccu.column_name as columna_padre
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name LIKE 'client%'
ORDER BY tc.table_name;
