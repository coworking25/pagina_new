-- ===================================================================
-- CONFIGURACIÓN COMPLETA: ADMIN CON ACCESO TOTAL
-- ===================================================================
-- Fecha: 20 de Octubre, 2025
-- Objetivo: Dar acceso TOTAL al administrador para TODAS las operaciones

-- ===================================================================
-- PASO 1: REGISTRAR TU USUARIO COMO ADMIN/ADVISOR
-- ===================================================================

SELECT '🎯 PASO 1: Registrar como Administrador' as seccion;

-- Ver tu información actual
SELECT 
  'Tu usuario actual:' as info,
  auth.uid() as user_id,
  auth.jwt() ->> 'email' as email;

-- Insertar/Actualizar como advisor (ADMIN PRINCIPAL)
INSERT INTO advisors (
  id,
  full_name,
  email,
  phone,
  active,
  role,
  created_at,
  updated_at
) VALUES (
  auth.uid(),
  'Administrador Principal',     -- ← Cambiar por tu nombre
  auth.jwt() ->> 'email',
  '+57 302 824 04 88',               -- ← Cambiar por tu teléfono
  true,
  'admin',                       -- ROL: admin (máximo privilegio)
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  active = true,
  role = 'admin',
  updated_at = NOW();

-- Verificar que fuiste agregado
SELECT 
  '✅ Verificación' as status,
  id,
  full_name,
  email,
  role,
  active
FROM advisors
WHERE id = auth.uid();

-- ===================================================================
-- PASO 2: POLÍTICAS RLS - ACCESO TOTAL PARA ADVISORS
-- ===================================================================

SELECT '🔒 PASO 2: Configurar Políticas RLS' as seccion;

-- ===================================================================
-- CLIENTES - ACCESO TOTAL
-- ===================================================================

DROP POLICY IF EXISTS "Advisors have full access to clients" ON clients;

CREATE POLICY "Advisors have full access to clients" 
ON clients
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- ===================================================================
-- CREDENCIALES - ACCESO TOTAL
-- ===================================================================

DROP POLICY IF EXISTS "Advisors have full access to credentials" ON client_portal_credentials;

CREATE POLICY "Advisors have full access to credentials" 
ON client_portal_credentials
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- ===================================================================
-- DOCUMENTOS - ACCESO TOTAL
-- ===================================================================

DROP POLICY IF EXISTS "Advisors have full access to documents" ON client_documents;

CREATE POLICY "Advisors have full access to documents" 
ON client_documents
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- ===================================================================
-- CONFIGURACIÓN DE PAGOS - ACCESO TOTAL
-- ===================================================================

DROP POLICY IF EXISTS "Advisors have full access to payment config" ON client_payment_config;

CREATE POLICY "Advisors have full access to payment config" 
ON client_payment_config
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- ===================================================================
-- REFERENCIAS - ACCESO TOTAL
-- ===================================================================

DROP POLICY IF EXISTS "Advisors have full access to references" ON client_references;

CREATE POLICY "Advisors have full access to references" 
ON client_references
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- ===================================================================
-- INFORMACIÓN DE CONTRATO - ACCESO TOTAL
-- ===================================================================

DROP POLICY IF EXISTS "Advisors have full access to contract info" ON client_contract_info;

CREATE POLICY "Advisors have full access to contract info" 
ON client_contract_info
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- ===================================================================
-- RELACIONES CLIENTE-PROPIEDAD - ACCESO TOTAL
-- ===================================================================

DROP POLICY IF EXISTS "Advisors have full access to property relations" ON client_property_relations;

CREATE POLICY "Advisors have full access to property relations" 
ON client_property_relations
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- ===================================================================
-- PROPIEDADES - ACCESO TOTAL
-- ===================================================================

DROP POLICY IF EXISTS "Advisors have full access to properties" ON properties;

CREATE POLICY "Advisors have full access to properties" 
ON properties
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- ===================================================================
-- CITAS - ACCESO TOTAL
-- ===================================================================

DROP POLICY IF EXISTS "Advisors have full access to appointments" ON appointments;

CREATE POLICY "Advisors have full access to appointments" 
ON appointments
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- ===================================================================
-- CONSULTAS/INQUIRIES - ACCESO TOTAL
-- ===================================================================

DROP POLICY IF EXISTS "Advisors have full access to inquiries" ON inquiries;

CREATE POLICY "Advisors have full access to inquiries" 
ON inquiries
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- ===================================================================
-- IMÁGENES DE PROPIEDADES - ACCESO TOTAL
-- ===================================================================

DROP POLICY IF EXISTS "Advisors have full access to property images" ON property_images;

CREATE POLICY "Advisors have full access to property images" 
ON property_images
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- ===================================================================
-- ANALYTICS - ACCESO TOTAL
-- ===================================================================

DROP POLICY IF EXISTS "Advisors have full access to analytics" ON analytics_page_views;

CREATE POLICY "Advisors have full access to analytics" 
ON analytics_page_views
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

DROP POLICY IF EXISTS "Advisors have full access to property views" ON analytics_property_views;

CREATE POLICY "Advisors have full access to property views" 
ON analytics_property_views
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true));

-- ===================================================================
-- PASO 3: VERIFICACIÓN COMPLETA
-- ===================================================================

SELECT '✅ PASO 3: Verificación Final' as seccion;

-- Verificar que eres advisor activo
SELECT 
  'Tu estado como Admin:' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true) 
    THEN '✅ ADMIN ACTIVO - ACCESO TOTAL'
    ELSE '❌ NO REGISTRADO'
  END as estado;

-- Contar políticas creadas
SELECT 
  'Total de políticas RLS para advisors:' as info,
  COUNT(*) as total_politicas
FROM pg_policies 
WHERE (qual LIKE '%advisors%' OR with_check LIKE '%advisors%')
  AND cmd = 'ALL';

-- Ver todas las tablas protegidas
SELECT 
  'Tablas con acceso total para admins:' as info,
  tablename
FROM pg_policies 
WHERE (qual LIKE '%advisors%' OR with_check LIKE '%advisors%')
  AND cmd = 'ALL'
GROUP BY tablename
ORDER BY tablename;

-- ===================================================================
-- PASO 4: PRUEBA DE PERMISOS
-- ===================================================================

SELECT '🧪 PASO 4: Prueba de Permisos' as seccion;

-- Test: ¿Puedo ver clientes?
SELECT 
  'Puedo ver clientes?' as test,
  COUNT(*) as total_visible
FROM clients;

-- Test: ¿Puedo ver propiedades?
SELECT 
  'Puedo ver propiedades?' as test,
  COUNT(*) as total_visible
FROM properties;

-- Test: ¿Puedo ver citas?
SELECT 
  'Puedo ver citas?' as test,
  COUNT(*) as total_visible
FROM appointments;

-- ===================================================================
-- RESUMEN FINAL
-- ===================================================================

SELECT '🎉 CONFIGURACIÓN COMPLETADA' as seccion;

SELECT 
  '✅ RESUMEN' as titulo,
  CASE 
    WHEN EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true)
    THEN 'Ahora tienes acceso TOTAL como administrador'
    ELSE 'ERROR: No se pudo configurar el acceso'
  END as mensaje;

-- ===================================================================
-- INSTRUCCIONES POST-INSTALACIÓN
-- ===================================================================

/*
✅ DESPUÉS DE EJECUTAR ESTE SCRIPT:

1. REFRESCA TU APLICACIÓN (F5)

2. AHORA PUEDES:
   ✅ Ver todos los clientes
   ✅ Crear clientes nuevos
   ✅ Editar clientes existentes
   ✅ ELIMINAR clientes (ya no volverán a aparecer)
   ✅ Gestionar propiedades
   ✅ Ver y modificar citas
   ✅ Acceder a consultas (inquiries)
   ✅ Ver analytics
   ✅ Todo con acceso completo

3. PRUEBA ELIMINAR UN CLIENTE:
   - Ve a Admin → Clientes
   - Elimina un cliente de prueba
   - Refresca la página (F5)
   - El cliente debe desaparecer permanentemente ✅

4. SI AÚN HAY PROBLEMAS:
   - Cierra sesión completamente
   - Vuelve a iniciar sesión
   - Prueba nuevamente

5. PARA AGREGAR MÁS ADMINISTRADORES:
   - Repite el INSERT INTO advisors con otro user_id
   - O crea usuarios en Supabase Auth y agrégalos a advisors

NOTAS IMPORTANTES:

📌 Las políticas RLS verifican:
   EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true)
   
   - auth.uid() = Tu ID de sesión actual
   - advisors.id = IDs de usuarios con permisos de admin
   - active = true = Solo admins activos

📌 FOR ALL incluye:
   - SELECT (ver)
   - INSERT (crear)
   - UPDATE (editar)
   - DELETE (eliminar)

📌 USING = Qué registros puedes VER/MODIFICAR/ELIMINAR
📌 WITH CHECK = Qué registros puedes CREAR/ACTUALIZAR

SEGURIDAD:

✅ Solo usuarios registrados en "advisors" tienen acceso
✅ Solo advisors con active=true pueden operar
✅ Cualquier otro usuario NO puede ver ni modificar nada
✅ Los clientes del portal tienen sus propias políticas separadas

SIGUIENTE PASO:
Ejecuta este script y prueba tu acceso total como administrador.
*/
