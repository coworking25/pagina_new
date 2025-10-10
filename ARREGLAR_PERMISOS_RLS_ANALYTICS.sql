-- =====================================================
-- VERIFICAR Y ARREGLAR PERMISOS RLS
-- =====================================================

-- 1. Ver políticas actuales
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('property_likes', 'property_views', 'property_contacts')
ORDER BY tablename, policyname;

-- 2. Ver si RLS está habilitado
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('property_likes', 'property_views', 'property_contacts');

-- 3. ARREGLAR: Eliminar todas las políticas restrictivas y crear nuevas permisivas
-- Para property_likes
DROP POLICY IF EXISTS "Permitir lectura pública de likes" ON property_likes;
DROP POLICY IF EXISTS "Permitir inserción pública de likes" ON property_likes;
DROP POLICY IF EXISTS "Permitir eliminación de likes por sesión" ON property_likes;
DROP POLICY IF EXISTS "Enable read access for all users" ON property_likes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON property_likes;

CREATE POLICY "public_read_likes" 
  ON property_likes FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "public_insert_likes" 
  ON property_likes FOR INSERT 
  TO public
  WITH CHECK (true);

CREATE POLICY "public_delete_likes" 
  ON property_likes FOR DELETE 
  TO public
  USING (true);

-- Para property_views
DROP POLICY IF EXISTS "Permitir lectura pública de vistas" ON property_views;
DROP POLICY IF EXISTS "Permitir inserción pública de vistas" ON property_views;
DROP POLICY IF EXISTS "Enable read access for all users" ON property_views;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON property_views;

CREATE POLICY "public_read_views" 
  ON property_views FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "public_insert_views" 
  ON property_views FOR INSERT 
  TO public
  WITH CHECK (true);

-- Para property_contacts
DROP POLICY IF EXISTS "Permitir lectura pública de contactos" ON property_contacts;
DROP POLICY IF EXISTS "Permitir inserción pública de contactos" ON property_contacts;
DROP POLICY IF EXISTS "Enable read access for all users" ON property_contacts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON property_contacts;

CREATE POLICY "public_read_contacts" 
  ON property_contacts FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "public_insert_contacts" 
  ON property_contacts FOR INSERT 
  TO public
  WITH CHECK (true);

-- 4. VERIFICAR que las políticas se crearon correctamente
SELECT 
  tablename,
  policyname,
  cmd as operacion,
  CASE 
    WHEN roles = '{public}' THEN '✅ Público'
    ELSE '⚠️ ' || array_to_string(roles, ', ')
  END as acceso
FROM pg_policies
WHERE tablename IN ('property_likes', 'property_views', 'property_contacts')
ORDER BY tablename, policyname;

-- 5. TEST: Verificar que podemos leer los datos
SELECT 
  'property_likes' as tabla,
  COUNT(*) as registros,
  '✅ Lectura OK' as estado
FROM property_likes
UNION ALL
SELECT 
  'property_views' as tabla,
  COUNT(*) as registros,
  '✅ Lectura OK' as estado
FROM property_views
UNION ALL
SELECT 
  'property_contacts' as tabla,
  COUNT(*) as registros,
  '✅ Lectura OK' as estado
FROM property_contacts;
