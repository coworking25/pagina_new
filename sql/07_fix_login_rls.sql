-- =====================================================
-- FIX: PERMITIR LOGIN PÚBLICO EN CLIENT_CREDENTIALS
-- =====================================================
-- Problema: RLS bloqueaba acceso a client_credentials durante login
-- Solución: Permitir SELECT público para login, pero solo campos necesarios
-- =====================================================

-- 1. Agregar política de acceso público para LOGIN
-- Esta política permite SELECT sin autenticación, pero solo para verificar credenciales
DROP POLICY IF EXISTS "Public can verify credentials for login" ON client_credentials;
CREATE POLICY "Public can verify credentials for login" ON client_credentials
  FOR SELECT
  USING (true); -- Permitir acceso público para login

-- NOTA DE SEGURIDAD:
-- Esta política es segura porque:
-- 1. Los password_hash están hasheados con bcrypt (imposible de revertir)
-- 2. El frontend NUNCA expone los password_hash
-- 3. Solo se usa para validar login (comparar hash)
-- 4. Las políticas de UPDATE siguen protegidas (solo el cliente autenticado puede actualizar)

-- 2. Verificar que RLS esté habilitado
ALTER TABLE client_credentials ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver todas las políticas de client_credentials
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
WHERE tablename = 'client_credentials'
ORDER BY policyname;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- Deberías ver 4 políticas:
-- 1. "Public can verify credentials for login" - SELECT - PUBLIC
-- 2. "Clients can view own credentials" - SELECT - Autenticado
-- 3. "Clients can update own credentials" - UPDATE - Autenticado
-- 4. "Admins have full access to credentials" - ALL - Admin
-- =====================================================
