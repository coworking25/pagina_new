-- =====================================================
-- VERIFICAR ESTADO DE TABLAS DE ANALYTICS
-- Ejecutar PRIMERO para ver si ya existen
-- =====================================================

-- 1. Verificar si las tablas existen
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'property_likes') 
    THEN '✅ property_likes EXISTE'
    ELSE '❌ property_likes NO EXISTE'
  END as property_likes,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'property_views') 
    THEN '✅ property_views EXISTE'
    ELSE '❌ property_views NO EXISTE'
  END as property_views,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'property_contacts') 
    THEN '✅ property_contacts EXISTE'
    ELSE '❌ property_contacts NO EXISTE'
  END as property_contacts;

-- 2. Si existen, mostrar estructura de columnas
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('property_likes', 'property_views', 'property_contacts')
ORDER BY table_name, ordinal_position;

-- 3. Verificar políticas RLS
SELECT 
  tablename,
  policyname,
  permissive,
  cmd as comando,
  CASE 
    WHEN qual IS NOT NULL THEN 'Con filtro'
    ELSE 'Sin filtro (permitir todo)'
  END as tipo_politica
FROM pg_policies
WHERE tablename IN ('property_likes', 'property_views', 'property_contacts')
ORDER BY tablename, policyname;

-- 4. Contar registros (solo si las tablas existen)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'property_likes') THEN
    RAISE NOTICE 'Contando registros en property_likes...';
  END IF;
END $$;

-- Intentar contar (puede fallar si no existe)
SELECT 
  (SELECT COUNT(*) FROM property_likes) as likes,
  (SELECT COUNT(*) FROM property_views) as views,
  (SELECT COUNT(*) FROM property_contacts) as contacts;
