-- =====================================================
-- CORRECCIÓN DE POLÍTICAS RLS PARA PORTAL DE CLIENTES
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Fecha: 30 Octubre 2025
-- Soluciona el error 500 al intentar login en el portal de clientes

-- =====================================================
-- 1. ELIMINAR POLÍTICAS PROBLEMÁTICAS
-- =====================================================

DROP POLICY IF EXISTS "Clients can view their own credentials" ON client_credentials;
DROP POLICY IF EXISTS "Clients can update their own credentials" ON client_credentials;

-- =====================================================
-- 2. CREAR NUEVAS POLÍTICAS CORRECTAS
-- =====================================================

-- Política para SELECT: permitir acceso público para login
-- Esto permite que el frontend consulte las credenciales durante el proceso de autenticación
CREATE POLICY "Allow login access" ON client_credentials
  FOR SELECT USING (true);

-- Política para UPDATE: solo usuarios autenticados pueden actualizar sus propios datos
-- NOTA: Esta política requiere que el usuario esté autenticado en Supabase Auth
CREATE POLICY "Clients can update their own credentials" ON client_credentials
  FOR UPDATE USING (client_id::text = auth.uid()::text);

-- Política para INSERT: solo advisors pueden crear credenciales
CREATE POLICY "Advisors can create credentials" ON client_credentials
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'advisor');

-- Política para DELETE: solo advisors pueden eliminar credenciales
CREATE POLICY "Advisors can delete credentials" ON client_credentials
  FOR DELETE USING (auth.jwt() ->> 'role' = 'advisor');

-- =====================================================
-- 3. VERIFICACIÓN
-- =====================================================

-- Verificar que las políticas se crearon correctamente
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'client_credentials'
ORDER BY policyname;

-- =====================================================
-- 4. PRUEBA DE FUNCIONAMIENTO
-- =====================================================

-- Esta consulta debería funcionar ahora sin error 500
SELECT
  id,
  email,
  is_active,
  must_change_password
FROM client_credentials
WHERE email = 'dallanafanco25@gmail.com';

-- =====================================================
-- POLÍTICAS CORREGIDAS ✅
-- =====================================================
-- El portal de clientes ahora debería permitir el login sin errores 500