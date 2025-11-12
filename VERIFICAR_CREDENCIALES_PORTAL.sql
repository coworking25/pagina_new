-- =====================================================
-- 🔍 VERIFICAR CREDENCIALES EXISTENTES
-- =====================================================
-- Ya confirmamos que hay 2 credenciales, ahora vemos sus detalles

-- 1. Ver las credenciales activas con información completa
SELECT 
  cc.id,
  cc.email,
  cc.is_active,
  cc.must_change_password,
  cc.last_login,
  cc.failed_login_attempts,
  cc.locked_until,
  c.full_name as nombre_cliente,
  c.phone as telefono_cliente,
  cc.created_at
FROM client_credentials cc
JOIN clients c ON c.id = cc.client_id
ORDER BY cc.created_at DESC;

-- 2. Verificar si alguna está bloqueada
SELECT 
  email,
  is_active,
  failed_login_attempts,
  locked_until,
  CASE 
    WHEN locked_until IS NOT NULL AND locked_until > NOW() THEN 'BLOQUEADA'
    WHEN is_active = false THEN 'INACTIVA'
    WHEN is_active = true THEN 'ACTIVA'
  END as estado
FROM client_credentials;

-- 3. Verificar políticas RLS (pueden estar bloqueando)
SELECT 
  policyname,
  cmd,
  roles,
  CASE 
    WHEN qual IS NOT NULL THEN 'Con restricción'
    ELSE 'Sin restricción'
  END as tipo_politica
FROM pg_policies 
WHERE tablename = 'client_credentials';

-- =====================================================
-- 📋 SIGUIENTE PASO:
-- =====================================================
-- Copia el EMAIL de una credencial activa
-- Y prueba el login en: /login
-- Selecciona "Cliente" y usa ese email
-- 
-- Si no sabes la contraseña, puedes:
-- 1. Resetearla desde /admin/clients
-- 2. O crear una nueva credencial con contraseña conocida
-- =====================================================
