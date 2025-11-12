-- ============================================
-- VERIFICAR TABLA CLIENT_COMMUNICATIONS
-- ============================================

-- Ver si la tabla existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'client_communications'
) as table_exists;

-- Ver estructura de la tabla (si existe)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'client_communications'
ORDER BY ordinal_position;

-- Ver constraints
SELECT
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'client_communications';

-- Ver datos existentes (si los hay)
SELECT COUNT(*) as total_messages FROM client_communications;
