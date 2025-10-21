-- ===================================================================
-- CONFIGURACIÓN ADMIN - VERSIÓN CORREGIDA
-- ===================================================================
-- Fecha: 20 de Octubre, 2025
-- Corrección: Adaptado a la estructura real de la tabla advisors

-- ===================================================================
-- PASO 1: VER INFORMACIÓN ACTUAL
-- ===================================================================

SELECT '📋 PASO 1: Información Actual' as seccion;

-- Ver tu usuario actual
SELECT 
  'Tu sesión actual:' as info,
  auth.uid() as user_id,
  auth.jwt() ->> 'email' as email;

-- Ver estructura de advisors
SELECT 
  'Columnas de advisors:' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'advisors'
ORDER BY ordinal_position;

-- Ver advisors existentes
SELECT 
  'Advisors actuales:' as info,
  *
FROM advisors;

-- ===================================================================
-- PASO 2: ELIMINAR ADMIN NO FUNCIONAL
-- ===================================================================

SELECT '🗑️ PASO 2: Limpiar Admin No Funcional' as seccion;

-- Eliminar admincoworkin@inmobiliaria.com
DELETE FROM advisors 
WHERE email = 'admincoworkin@inmobiliaria.com'
RETURNING id, email;

-- Verificar eliminación
SELECT 
  'Advisors después de limpiar:' as info,
  COUNT(*) as total
FROM advisors;

-- ===================================================================
-- PASO 3: ASEGURAR QUE DIEGO ES ADMIN PRINCIPAL
-- ===================================================================

SELECT '✅ PASO 3: Verificar Admin Principal' as seccion;

-- Ver datos de diegoadmin@gmail.com
SELECT 
  'Admin Principal (Diego):' as info,
  *
FROM advisors
WHERE email = 'diegoadmin@gmail.com';

-- Si necesita actualizarse (asegurar que está activo)
UPDATE advisors
SET 
  active = true
WHERE email = 'diegoadmin@gmail.com'
RETURNING *;

-- ===================================================================
-- PASO 4: AGREGAR NUEVO ADMIN (TU USUARIO ACTUAL)
-- ===================================================================

SELECT '➕ PASO 4: Agregar Tu Usuario Como Admin' as seccion;

-- OPCIÓN A: Si la tabla tiene columnas básicas (id, email, phone, active)
INSERT INTO advisors (
  id,
  email,
  phone,
  active
) VALUES (
  auth.uid(),
  auth.jwt() ->> 'email',
  '+57 302 824 04 88',
  true
)
ON CONFLICT (id) DO UPDATE SET
  active = true,
  updated_at = NOW();

-- OPCIÓN B: Si la tabla tiene más columnas (name, role, etc.)
-- Descomenta y ajusta según la estructura real:
/*
INSERT INTO advisors (
  id,
  name,              -- o 'full_name' o 'display_name'
  email,
  phone,
  role,              -- 'admin', 'advisor', etc.
  active
) VALUES (
  auth.uid(),
  'Admin 2',
  auth.jwt() ->> 'email',
  '+57 302 824 04 88',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  active = true,
  role = 'admin';
*/

-- ===================================================================
-- PASO 5: POLÍTICAS RLS - ACCESO TOTAL
-- ===================================================================

SELECT '🔒 PASO 5: Configurar Políticas RLS' as seccion;

-- CLIENTES
DROP POLICY IF EXISTS "Advisors have full access to clients" ON clients;
CREATE POLICY "Advisors have full access to clients" 
ON clients FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- CREDENCIALES
DROP POLICY IF EXISTS "Advisors have full access to credentials" ON client_portal_credentials;
CREATE POLICY "Advisors have full access to credentials" 
ON client_portal_credentials FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- DOCUMENTOS
DROP POLICY IF EXISTS "Advisors have full access to documents" ON client_documents;
CREATE POLICY "Advisors have full access to documents" 
ON client_documents FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- CONFIGURACIÓN DE PAGOS
DROP POLICY IF EXISTS "Advisors have full access to payment config" ON client_payment_config;
CREATE POLICY "Advisors have full access to payment config" 
ON client_payment_config FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- REFERENCIAS
DROP POLICY IF EXISTS "Advisors have full access to references" ON client_references;
CREATE POLICY "Advisors have full access to references" 
ON client_references FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- INFORMACIÓN DE CONTRATO
DROP POLICY IF EXISTS "Advisors have full access to contract info" ON client_contract_info;
CREATE POLICY "Advisors have full access to contract info" 
ON client_contract_info FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- RELACIONES CLIENTE-PROPIEDAD
DROP POLICY IF EXISTS "Advisors have full access to property relations" ON client_property_relations;
CREATE POLICY "Advisors have full access to property relations" 
ON client_property_relations FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- PROPIEDADES
DROP POLICY IF EXISTS "Advisors have full access to properties" ON properties;
CREATE POLICY "Advisors have full access to properties" 
ON properties FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- CITAS
DROP POLICY IF EXISTS "Advisors have full access to appointments" ON appointments;
CREATE POLICY "Advisors have full access to appointments" 
ON appointments FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- CONSULTAS
DROP POLICY IF EXISTS "Advisors have full access to inquiries" ON inquiries;
CREATE POLICY "Advisors have full access to inquiries" 
ON inquiries FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- IMÁGENES DE PROPIEDADES
DROP POLICY IF EXISTS "Advisors have full access to property images" ON property_images;
CREATE POLICY "Advisors have full access to property images" 
ON property_images FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- ANALYTICS
DROP POLICY IF EXISTS "Advisors have full access to analytics" ON analytics_page_views;
CREATE POLICY "Advisors have full access to analytics" 
ON analytics_page_views FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

DROP POLICY IF EXISTS "Advisors have full access to property views" ON analytics_property_views;
CREATE POLICY "Advisors have full access to property views" 
ON analytics_property_views FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- POLÍTICA PARA LA TABLA ADVISORS (para que puedan gestionarse entre ellos)
DROP POLICY IF EXISTS "Advisors can manage other advisors" ON advisors;
CREATE POLICY "Advisors can manage other advisors" 
ON advisors FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- ===================================================================
-- PASO 6: VERIFICACIÓN FINAL
-- ===================================================================

SELECT '✅ PASO 6: Verificación' as seccion;

-- Verificar que eres admin
SELECT 
  'Tu estado:' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true) 
    THEN '✅ ADMIN ACTIVO'
    ELSE '❌ NO REGISTRADO'
  END as resultado;

-- Ver todos los admins activos
SELECT 
  'Admins activos:' as info,
  *
FROM advisors
WHERE active = true;

-- Contar políticas
SELECT 
  'Políticas RLS configuradas:' as info,
  COUNT(*) as total
FROM pg_policies 
WHERE cmd = 'ALL'
  AND (qual LIKE '%advisors%' OR with_check LIKE '%advisors%');

-- ===================================================================
-- RESUMEN
-- ===================================================================

/*
✅ DESPUÉS DE EJECUTAR ESTE SCRIPT:

1. Admin no funcional eliminado ✅
2. Diego (diegoadmin@gmail.com) confirmado como admin principal ✅
3. Tu usuario agregado como admin ✅
4. Políticas RLS configuradas para TODAS las tablas ✅
5. Política en "advisors" permite que se gestionen entre ellos ✅

PRÓXIMOS PASOS:

1. Refresca tu aplicación (F5)
2. Verifica que puedes eliminar clientes
3. Para agregar más admins desde el frontend, necesitamos:
   - Crear un componente de gestión de usuarios
   - Interfaz para cambiar contraseñas
   - Listado y activación/desactivación de admins

¿Quieres que cree el componente de gestión de admins para el frontend?
*/
