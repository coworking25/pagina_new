-- ============================================
-- CORRECCIÓN DE POLÍTICAS RLS PARA WIZARD
-- ============================================
-- Problema: Las políticas actuales solo permiten service_role
-- Solución: Agregar políticas para authenticated (usuarios admin)

-- ============================================
-- PASO 1: ELIMINAR POLÍTICAS RESTRICTIVAS
-- ============================================

-- Eliminar políticas antiguas de client_portal_credentials
DROP POLICY IF EXISTS "Service role can do everything on portal_credentials" ON client_portal_credentials;

-- Eliminar políticas antiguas de client_documents
DROP POLICY IF EXISTS "Service role can do everything on client_documents" ON client_documents;

-- Eliminar políticas antiguas de client_payment_config
DROP POLICY IF EXISTS "Service role can do everything on payment_config" ON client_payment_config;

-- Eliminar políticas antiguas de client_references
DROP POLICY IF EXISTS "Service role can do everything on references" ON client_references;

-- Eliminar políticas antiguas de client_contract_info
DROP POLICY IF EXISTS "Service role can do everything on contract_info" ON client_contract_info;

-- ============================================
-- PASO 2: CREAR POLÍTICAS PARA AUTHENTICATED
-- ============================================

-- Políticas para client_portal_credentials
CREATE POLICY "Authenticated users can manage portal credentials"
  ON client_portal_credentials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para client_documents
CREATE POLICY "Authenticated users can manage client documents"
  ON client_documents FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para client_payment_config
CREATE POLICY "Authenticated users can manage payment config"
  ON client_payment_config FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para client_references
CREATE POLICY "Authenticated users can manage references"
  ON client_references FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para client_contract_info
CREATE POLICY "Authenticated users can manage contract info"
  ON client_contract_info FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- PASO 3: POLÍTICAS PARA STORAGE (client-documents)
-- ============================================

-- Eliminar política restrictiva de Storage
DROP POLICY IF EXISTS "Service role full access to client documents" ON storage.objects;

-- Crear política para usuarios autenticados en Storage
CREATE POLICY "Authenticated users can manage client documents in storage"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'client-documents')
  WITH CHECK (bucket_id = 'client-documents');

-- ============================================
-- PASO 4: VERIFICAR TABLA client_properties
-- ============================================

-- Verificar si la tabla existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'client_properties'
  ) THEN
    -- Habilitar RLS si no está habilitado
    ALTER TABLE client_properties ENABLE ROW LEVEL SECURITY;
    
    -- Eliminar políticas antiguas
    DROP POLICY IF EXISTS "Service role can do everything on client_properties" ON client_properties;
    DROP POLICY IF EXISTS "Admins have full access to client properties" ON client_properties;
    
    -- Crear nueva política
    EXECUTE 'CREATE POLICY "Authenticated users can manage client properties"
      ON client_properties FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true)';
    
    RAISE NOTICE 'Políticas para client_properties actualizadas ✅';
  ELSE
    RAISE NOTICE 'Tabla client_properties no existe (OK si usas clients.assigned_property_ids) ℹ️';
  END IF;
END $$;

-- ============================================
-- PASO 5: VERIFICACIÓN
-- ============================================

-- Verificar políticas en tablas del wizard
SELECT 
  schemaname,
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

-- Verificar políticas en Storage
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'objects' 
  AND policyname LIKE '%client%'
ORDER BY policyname;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================

/*
DESPUÉS DE EJECUTAR ESTE SCRIPT DEBERÍAS VER:

1. client_portal_credentials:
   - Authenticated users can manage portal credentials | {authenticated} | ALL

2. client_documents:
   - Authenticated users can manage client documents | {authenticated} | ALL

3. client_payment_config:
   - Authenticated users can manage payment config | {authenticated} | ALL

4. client_references:
   - Authenticated users can manage references | {authenticated} | ALL

5. client_contract_info:
   - Authenticated users can manage contract info | {authenticated} | ALL

6. client_properties (si existe):
   - Authenticated users can manage client properties | {authenticated} | ALL

7. storage.objects:
   - Authenticated users can manage client documents in storage | {authenticated} | ALL

ESTO PERMITIRÁ:
✅ Crear credenciales del portal
✅ Subir documentos al Storage
✅ Guardar configuración de pagos
✅ Guardar referencias
✅ Guardar información del contrato
✅ Asignar propiedades a clientes
*/

-- ============================================
-- NOTAS DE SEGURIDAD
-- ============================================

/*
IMPORTANTE:
- Estas políticas permiten a TODOS los usuarios autenticados gestionar TODOS los registros
- Esto es apropiado para un panel de administración donde todos los admins tienen acceso total
- Si necesitas restricciones más granulares (ej: solo el admin que creó el cliente puede editarlo),
  necesitarás modificar las políticas usando condiciones como:
  USING (created_by = auth.uid())

ALTERNATIVA MÁS SEGURA (para implementar después):
- Crear tabla de roles/permisos
- Verificar que el usuario tenga rol 'admin'
- Aplicar políticas basadas en roles

EJEMPLO:
CREATE POLICY "Only admins can manage clients"
  ON client_portal_credentials FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );
*/

SELECT '✅ Políticas RLS corregidas exitosamente!' AS resultado;
SELECT 'ℹ️  Ahora todos los usuarios autenticados pueden gestionar datos del wizard' AS info;
SELECT '⚠️  Considera implementar políticas basadas en roles para mayor seguridad' AS advertencia;
