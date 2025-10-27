-- ===================================================================
-- VERIFICAR ESTRUCTURA DE TABLAS REFERENCIADAS
-- ===================================================================

-- Ver estructura de la tabla properties
SELECT
  'properties table structure:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'properties'
ORDER BY ordinal_position;

-- Ver estructura de la tabla clients
SELECT
  'clients table structure:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'clients'
ORDER BY ordinal_position;

-- Ver estructura de la tabla advisors
SELECT
  'advisors table structure:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'advisors'
ORDER BY ordinal_position;

-- Ver estructura de auth.users
SELECT
  'auth.users table structure:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'auth'
  AND table_name = 'users'
ORDER BY ordinal_position;