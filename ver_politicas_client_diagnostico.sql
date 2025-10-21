-- ===================================================================
-- VER SOLO POLÍTICAS RLS DE TODAS LAS TABLAS CLIENT*
-- ===================================================================

SELECT 
  tablename as tabla,
  policyname as politica,
  cmd as comando,
  CASE 
    WHEN qual LIKE '%advisors%' THEN '❌ USA ADVISORS (MAL)'
    WHEN qual LIKE '%is_admin()%' THEN '✅ USA is_admin() (BIEN)'
    WHEN qual LIKE '%is_advisor()%' THEN '⚠️ USA is_advisor()'
    ELSE '❓ OTRA CONDICIÓN'
  END as diagnostico_using,
  CASE 
    WHEN with_check LIKE '%advisors%' THEN '❌ USA ADVISORS (MAL)'
    WHEN with_check LIKE '%is_admin()%' THEN '✅ USA is_admin() (BIEN)'
    WHEN with_check LIKE '%is_advisor()%' THEN '⚠️ USA is_advisor()'
    ELSE '❓ OTRA CONDICIÓN'
  END as diagnostico_with_check,
  qual as codigo_using,
  with_check as codigo_with_check
FROM pg_policies
WHERE tablename LIKE 'client%'
ORDER BY 
  CASE WHEN qual LIKE '%advisors%' OR with_check LIKE '%advisors%' THEN 1 ELSE 2 END,
  tablename, 
  cmd, 
  policyname;
