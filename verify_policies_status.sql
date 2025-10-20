-- ============================================
-- VERIFICACIÓN RÁPIDA DE POLÍTICAS RLS
-- ============================================

-- 1. Verificar políticas en tablas del wizard
SELECT 
  '📋 TABLAS DEL WIZARD' AS seccion,
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN (
  'client_portal_credentials',
  'client_documents',
  'client_payment_config',
  'client_references',
  'client_contract_info',
  'client_properties'
)
ORDER BY tablename, policyname;

-- 2. Verificar políticas en Storage
SELECT 
  '🗄️ STORAGE BUCKET' AS seccion,
  tablename,
  policyname,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'objects' 
  AND policyname LIKE '%client%'
ORDER BY policyname;

-- 3. Contar políticas creadas
SELECT 
  '📊 RESUMEN' AS tipo,
  COUNT(*) FILTER (WHERE tablename IN ('client_portal_credentials', 'client_documents', 'client_payment_config', 'client_references', 'client_contract_info', 'client_properties')) AS "Políticas en Tablas",
  COUNT(*) FILTER (WHERE tablename = 'objects' AND policyname LIKE '%client%') AS "Políticas en Storage"
FROM pg_policies;

-- 4. Verificar que todas usan 'authenticated' role
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ ERROR: No hay políticas con role authenticated'
    WHEN COUNT(*) >= 6 THEN '✅ CORRECTO: ' || COUNT(*)::text || ' políticas configuradas para authenticated'
    ELSE '⚠️ INCOMPLETO: Solo ' || COUNT(*)::text || ' políticas encontradas (esperadas: 6+)'
  END AS estado
FROM pg_policies
WHERE tablename IN (
  'client_portal_credentials',
  'client_documents',
  'client_payment_config',
  'client_references',
  'client_contract_info',
  'client_properties',
  'objects'
)
AND 'authenticated' = ANY(roles);
