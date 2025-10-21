-- ===================================================================
-- DIAGNÓSTICO: ¿POR QUÉ NO SE ELIMINAN LOS CLIENTES?
-- ===================================================================
-- Fecha: 20 de Octubre, 2025
-- Problema: Cliente "eliminado" vuelve a aparecer después de refrescar

-- ===================================================================
-- 1. VERIFICAR POLÍTICAS RLS PARA DELETE
-- ===================================================================

SELECT 
  '🔒 POLÍTICAS RLS - COMANDO DELETE' as seccion;

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as comando,
  CASE 
    WHEN cmd = 'DELETE' THEN '✅ TIENE DELETE'
    ELSE '❌ NO ES DELETE'
  END as es_delete,
  qual as "USING_clause",
  with_check as "WITH_CHECK_clause"
FROM pg_policies 
WHERE tablename LIKE 'client%'
  AND cmd = 'DELETE'
ORDER BY tablename;

-- Si no aparece ninguna política DELETE, ese es el problema!

-- ===================================================================
-- 2. VERIFICAR POLÍTICAS "FOR ALL" (incluyen DELETE)
-- ===================================================================

SELECT 
  '🔓 POLÍTICAS RLS - FOR ALL (incluye DELETE)' as seccion;

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as comando,
  CASE 
    WHEN cmd = 'ALL' THEN '✅ FOR ALL (incluye DELETE)'
    ELSE '❌ NO ES ALL'
  END as incluye_delete,
  qual as "USING_clause"
FROM pg_policies 
WHERE tablename LIKE 'client%'
  AND cmd = 'ALL'
ORDER BY tablename;

-- ===================================================================
-- 3. VERIFICAR FOREIGN KEYS CON CASCADE DELETE
-- ===================================================================

SELECT 
  '🔗 FOREIGN KEYS - ON DELETE CASCADE' as seccion;

SELECT 
  tc.table_name as tabla_hijo,
  kcu.column_name as columna_fk,
  ccu.table_name as tabla_padre,
  ccu.column_name as columna_padre,
  rc.delete_rule as on_delete_rule,
  CASE 
    WHEN rc.delete_rule = 'CASCADE' THEN '✅ CASCADE'
    WHEN rc.delete_rule = 'SET NULL' THEN '⚠️ SET NULL'
    WHEN rc.delete_rule = 'RESTRICT' THEN '❌ RESTRICT (BLOQUEA)'
    WHEN rc.delete_rule = 'NO ACTION' THEN '❌ NO ACTION (BLOQUEA)'
    ELSE '❓ OTRO'
  END as resultado
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
-- 4. PROBAR SI EL USUARIO ACTUAL PUEDE ELIMINAR
-- ===================================================================

SELECT 
  '🧪 PRUEBA: ¿Puedo eliminar?' as seccion;

-- Verificar si existe la función auth.uid()
SELECT 
  'Usuario actual (auth.uid):' as info,
  auth.uid() as user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ NO AUTENTICADO'
    ELSE '✅ AUTENTICADO'
  END as estado;

-- Verificar si el usuario es advisor
SELECT 
  'Soy advisor?:' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()) THEN '✅ SÍ'
    ELSE '❌ NO (por eso no puedo eliminar!)'
  END as es_advisor;

-- ===================================================================
-- 5. CONTAR CLIENTES Y REGISTROS RELACIONADOS
-- ===================================================================

SELECT 
  '📊 CONTEO DE REGISTROS' as seccion;

SELECT 
  'clients' as tabla,
  COUNT(*) as total
FROM clients
UNION ALL
SELECT 
  'client_portal_credentials' as tabla,
  COUNT(*) as total
FROM client_portal_credentials
UNION ALL
SELECT 
  'client_documents' as tabla,
  COUNT(*) as total
FROM client_documents
UNION ALL
SELECT 
  'client_payment_config' as tabla,
  COUNT(*) as total
FROM client_payment_config
UNION ALL
SELECT 
  'client_references' as tabla,
  COUNT(*) as total
FROM client_references
UNION ALL
SELECT 
  'client_contract_info' as tabla,
  COUNT(*) as total
FROM client_contract_info
UNION ALL
SELECT 
  'client_property_relations' as tabla,
  COUNT(*) as total
FROM client_property_relations
ORDER BY tabla;

-- ===================================================================
-- 6. VERIFICAR SI HAY TRIGGERS QUE BLOQUEEN DELETE
-- ===================================================================

SELECT 
  '⚡ TRIGGERS EN TABLAS DE CLIENTES' as seccion;

SELECT 
  event_object_table as tabla,
  trigger_name,
  event_manipulation as evento,
  action_timing as momento,
  action_statement as accion
FROM information_schema.triggers
WHERE event_object_table LIKE 'client%'
  AND event_manipulation = 'DELETE'
ORDER BY event_object_table, trigger_name;

-- ===================================================================
-- 7. RESUMEN DEL PROBLEMA
-- ===================================================================

SELECT 
  '🎯 DIAGNÓSTICO FINAL' as seccion;

WITH diagnostico AS (
  SELECT 
    'clients' as tabla,
    EXISTS(
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'clients' 
      AND (cmd = 'DELETE' OR cmd = 'ALL')
    ) as puede_eliminar_rls,
    EXISTS(
      SELECT 1 FROM advisors WHERE id = auth.uid()
    ) as usuario_es_advisor
)
SELECT 
  tabla,
  CASE WHEN puede_eliminar_rls THEN '✅' ELSE '❌' END as "RLS permite DELETE",
  CASE WHEN usuario_es_advisor THEN '✅' ELSE '❌' END as "Usuario es advisor",
  CASE 
    WHEN puede_eliminar_rls AND usuario_es_advisor THEN '✅ DEBE FUNCIONAR'
    WHEN NOT puede_eliminar_rls THEN '❌ FALTA POLÍTICA DELETE'
    WHEN NOT usuario_es_advisor THEN '❌ USUARIO NO ES ADVISOR'
    ELSE '❓ REVISAR LOGS'
  END as diagnostico
FROM diagnostico;

-- ===================================================================
-- INTERPRETACIÓN DE RESULTADOS
-- ===================================================================

/*
PROBLEMA IDENTIFICADO: El cliente se elimina pero vuelve a aparecer

CAUSAS POSIBLES:

1️⃣ FALTA POLÍTICA RLS PARA DELETE
   - Síntoma: No aparece ninguna política con cmd='DELETE' o cmd='ALL'
   - Solución: Crear política que permita DELETE

2️⃣ USUARIO NO ES ADVISOR
   - Síntoma: "Soy advisor?" = ❌ NO
   - Solución: Verificar autenticación, el usuario debe ser advisor

3️⃣ FOREIGN KEYS SIN CASCADE
   - Síntoma: delete_rule = 'RESTRICT' o 'NO ACTION'
   - Solución: Cambiar a CASCADE para eliminar registros relacionados

4️⃣ TRIGGERS BLOQUEANDO DELETE
   - Síntoma: Aparecen triggers en evento DELETE
   - Solución: Revisar o eliminar triggers que bloqueen

5️⃣ EL CLIENTE SE ELIMINA PERO LA UI NO SE ACTUALIZA
   - Síntoma: Todo ✅ en diagnóstico pero el cliente "vuelve"
   - Solución: Problema en el frontend, no en la BD

SIGUIENTE PASO:
Ejecutar este script y compartir los resultados para identificar la causa exacta.
*/
