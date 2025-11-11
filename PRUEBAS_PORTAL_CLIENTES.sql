-- =====================================================
-- 🧪 SCRIPT DE PRUEBAS - PORTAL DE CLIENTES
-- =====================================================
-- Ejecutar estas queries para validar que todo funciona
-- Reemplaza los UUIDs de ejemplo con datos reales de tu BD
-- =====================================================

-- =====================================================
-- PASO 1: OBTENER UN CLIENT_ID REAL PARA PROBAR
-- =====================================================

-- Ver clientes que tienen credenciales activas
SELECT 
  c.id as client_id,
  c.full_name,
  c.email,
  cc.email as credential_email,
  cc.is_active,
  cc.last_login
FROM clients c
INNER JOIN client_credentials cc ON cc.client_id = c.id
WHERE cc.is_active = true
ORDER BY cc.last_login DESC NULLS LAST
LIMIT 5;

-- Copiar uno de los client_id de arriba para usar en las siguientes pruebas
-- Ejemplo: e05ac24a-0bf1-4b09-8e10-0ae9c1b676f0

-- =====================================================
-- PASO 2: PROBAR FUNCIÓN get_client_dashboard_summary
-- =====================================================

-- Reemplaza 'CLIENT_ID_AQUI' con un UUID real
SELECT get_client_dashboard_summary('e05ac24a-0bf1-4b09-8e10-0ae9c1b676f0'::UUID);

-- La respuesta debe ser un JSON con esta estructura:
/*
{
  "client_id": "...",
  "full_name": "Nombre del Cliente",
  "active_contracts_count": 1,
  "pending_payments_count": 2,
  "overdue_payments_count": 0,
  "next_payment_due_date": "2025-11-15",
  "next_payment_amount": 1500000,
  "total_paid_this_month": 3000000,
  "total_paid_this_year": 18000000,
  "recent_payments": [...],
  "upcoming_payments": [...]
}
*/

-- =====================================================
-- PASO 3: VERIFICAR DATOS DE CONTRATOS
-- =====================================================

-- Ver contratos del cliente (reemplaza el UUID)
SELECT 
  id,
  contract_number,
  status,
  start_date,
  end_date,
  monthly_rent,
  client_id,
  landlord_id
FROM contracts
WHERE client_id = 'e05ac24a-0bf1-4b09-8e10-0ae9c1b676f0'
   OR landlord_id = 'e05ac24a-0bf1-4b09-8e10-0ae9c1b676f0'
ORDER BY created_at DESC;

-- =====================================================
-- PASO 4: VERIFICAR DATOS DE PAGOS
-- =====================================================

-- Ver pagos del cliente (reemplaza el UUID)
SELECT 
  id,
  payment_type,
  amount,
  amount_paid,
  status,
  due_date,
  payment_date,
  contract_id
FROM payments
WHERE client_id = 'e05ac24a-0bf1-4b09-8e10-0ae9c1b676f0'
   OR beneficiary_id = 'e05ac24a-0bf1-4b09-8e10-0ae9c1b676f0'
ORDER BY due_date DESC
LIMIT 10;

-- =====================================================
-- PASO 5: VERIFICAR PROPIEDADES ASIGNADAS
-- =====================================================

-- Ver propiedades del cliente (reemplaza el UUID)
SELECT 
  cpr.id,
  cpr.relation_type,
  cpr.status,
  p.code,
  p.title,
  p.location,
  p.price
FROM client_property_relations cpr
INNER JOIN properties p ON p.id = cpr.property_id
WHERE cpr.client_id = 'e05ac24a-0bf1-4b09-8e10-0ae9c1b676f0'
ORDER BY cpr.created_at DESC;

-- =====================================================
-- PASO 6: VERIFICAR DOCUMENTOS
-- =====================================================

-- Ver documentos del cliente (reemplaza el UUID)
SELECT 
  id,
  document_type,
  document_name,
  status,
  file_path,
  created_at
FROM client_documents
WHERE client_id = 'e05ac24a-0bf1-4b09-8e10-0ae9c1b676f0'
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- PASO 7: VERIFICAR POLÍTICAS RLS
-- =====================================================

-- Verificar que RLS está habilitado en todas las tablas
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'client_credentials',
    'clients',
    'contracts',
    'payments',
    'client_documents',
    'client_property_relations'
  );

-- Todas deben mostrar "true"

-- Ver resumen de políticas
SELECT 
  tablename,
  COUNT(*) as total_policies,
  COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as select_policies,
  COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as insert_policies,
  COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) as update_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'client_credentials',
    'clients',
    'contracts',
    'payments',
    'client_documents',
    'client_property_relations',
    'client_alerts',
    'client_communications'
  )
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- PASO 8: PROBAR CREDENCIALES DE LOGIN
-- =====================================================

-- Ver credenciales activas con información del cliente
SELECT 
  cc.id,
  cc.email,
  cc.is_active,
  cc.must_change_password,
  cc.last_login,
  cc.failed_login_attempts,
  cc.locked_until,
  c.full_name,
  c.phone
FROM client_credentials cc
INNER JOIN clients c ON c.id = cc.client_id
WHERE cc.is_active = true
ORDER BY cc.last_login DESC NULLS LAST;

-- =====================================================
-- PASO 9: ESTADÍSTICAS GENERALES
-- =====================================================

-- Resumen de datos del portal
SELECT 
  'Total Clientes' as metric,
  COUNT(*) as value
FROM clients
UNION ALL
SELECT 
  'Credenciales Activas' as metric,
  COUNT(*) as value
FROM client_credentials
WHERE is_active = true
UNION ALL
SELECT 
  'Contratos Activos' as metric,
  COUNT(*) as value
FROM contracts
WHERE status = 'active'
UNION ALL
SELECT 
  'Pagos Pendientes' as metric,
  COUNT(*) as value
FROM payments
WHERE status IN ('pending', 'overdue')
UNION ALL
SELECT 
  'Propiedades Asignadas' as metric,
  COUNT(*) as value
FROM client_property_relations
WHERE status = 'active';

-- =====================================================
-- PASO 10: VERIFICAR FUNCIONES SQL EXISTEN
-- =====================================================

-- Listar funciones del portal de clientes
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_client_dashboard_summary',
    'generate_monthly_extract',
    'generate_annual_summary',
    'get_account_status',
    'get_extract_pdf_data'
  )
ORDER BY routine_name;

-- =====================================================
-- ✅ CHECKLIST DE VALIDACIÓN
-- =====================================================

/*
Verifica que cada prueba devuelva resultados esperados:

[ ] PASO 1: Se muestran clientes con credenciales activas
[ ] PASO 2: La función devuelve JSON con todos los campos
[ ] PASO 3: Se muestran contratos del cliente
[ ] PASO 4: Se muestran pagos del cliente
[ ] PASO 5: Se muestran propiedades asignadas
[ ] PASO 6: Se muestran documentos del cliente
[ ] PASO 7: RLS está habilitado en todas las tablas
[ ] PASO 8: Se muestran credenciales activas
[ ] PASO 9: Estadísticas generales se calculan correctamente
[ ] PASO 10: Todas las funciones SQL existen

Si todos los pasos pasan, el portal está listo para usar.
*/

-- =====================================================
-- 🔧 TROUBLESHOOTING
-- =====================================================

-- Si get_client_dashboard_summary falla:
-- 1. Verificar que la función existe
SELECT EXISTS (
  SELECT 1 FROM information_schema.routines 
  WHERE routine_name = 'get_client_dashboard_summary'
) as function_exists;

-- 2. Ver el error exacto
DO $$
BEGIN
  PERFORM get_client_dashboard_summary('e05ac24a-0bf1-4b09-8e10-0ae9c1b676f0'::UUID);
  RAISE NOTICE 'Función ejecutada correctamente';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error: %', SQLERRM;
END $$;

-- 3. Recrear la función ejecutando FIX_CLIENT_DASHBOARD_SUMMARY.sql

-- =====================================================
-- ✅ SCRIPT DE PRUEBAS COMPLETADO
-- =====================================================
