-- =====================================================
-- VERIFICAR ESTRUCTURA DE TODAS LAS TABLAS DE CLIENTES
-- =====================================================

-- 1. client_contract_info
SELECT 
  'client_contract_info' as tabla,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'client_contract_info'
ORDER BY ordinal_position;

-- 2. client_payment_config
SELECT 
  'client_payment_config' as tabla,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'client_payment_config'
ORDER BY ordinal_position;

-- 3. client_references
SELECT 
  'client_references' as tabla,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'client_references'
ORDER BY ordinal_position;

-- 4. client_documents
SELECT 
  'client_documents' as tabla,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'client_documents'
ORDER BY ordinal_position;
