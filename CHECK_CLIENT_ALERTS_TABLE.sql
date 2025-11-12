-- ============================================
-- VERIFICAR TABLA CLIENT_ALERTS
-- ============================================

-- Ver si la tabla existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'client_alerts'
);

-- Ver estructura de la tabla
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'client_alerts'
ORDER BY ordinal_position;

-- Ver constraints
SELECT
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'client_alerts';

-- Ver datos existentes (si los hay)
SELECT COUNT(*) as total_alerts FROM client_alerts;
