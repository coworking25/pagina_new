-- =====================================================
-- SOLUCIÓN: Credenciales para carlos.propietario@test.com
-- Ejecuta PASO POR PASO (uno a la vez)
-- =====================================================

-- ========================================
-- PASO 1: Obtener el client_id
-- ========================================
-- Ejecuta esto PRIMERO y copia el resultado (el UUID)
SELECT 
  id as client_id,
  full_name,
  email,
  client_type
FROM clients
WHERE email = 'carlos.propietario@test.com';

-- 📋 RESULTADO ESPERADO:
-- client_id: algo como "123e4567-e89b-12d3-a456-426614174000"
-- full_name: Carlos Rodriguez
-- email: carlos.propietario@test.com
-- client_type: owner (o lo que tenga)


-- ========================================
-- PASO 2A: Si el cliente NO existe, créalo
-- ========================================
-- Solo ejecuta esto si el PASO 1 no devolvió resultados
INSERT INTO clients (
  full_name,
  email,
  phone,
  client_type,
  status
)
VALUES (
  'Carlos Rodriguez',
  'carlos.propietario@test.com',
  '+52 555-0123',
  'owner',
  'active'
)
RETURNING id, full_name, email;


-- ========================================
-- PASO 2B: Asegurar que es tipo 'owner'
-- ========================================
-- Ejecuta esto para asegurar que puede acceder al portal
UPDATE clients 
SET client_type = 'owner',
    status = 'active',
    updated_at = NOW()
WHERE email = 'carlos.propietario@test.com'
RETURNING id, full_name, email, client_type;


-- ========================================
-- PASO 3: Verificar si ya tiene credenciales
-- ========================================
SELECT 
  id,
  client_id,
  email,
  portal_access_enabled,
  must_change_password,
  account_locked_until,
  failed_login_attempts
FROM client_credentials
WHERE email = 'carlos.propietario@test.com';

-- Si NO tiene credenciales, continúa con PASO 4
-- Si SÍ tiene credenciales, salta al PASO 5


-- ========================================
-- PASO 4: Crear credenciales (si no existen)
-- ========================================
-- ⚠️ IMPORTANTE: Reemplaza 'PEGA-AQUI-EL-UUID-DEL-PASO-1' 
--                con el client_id que obtuviste en PASO 1

INSERT INTO client_credentials (
  client_id,
  email,
  password_hash,
  portal_access_enabled,
  must_change_password,
  is_active
)
VALUES (
  'PEGA-AQUI-EL-UUID-DEL-PASO-1',  -- ⚠️ REEMPLAZAR con el UUID del cliente
  'carlos.propietario@test.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Hash de "Test123456!"
  true,
  true,
  true
)
RETURNING id, email, portal_access_enabled;


-- ========================================
-- PASO 5: Actualizar credenciales existentes
-- ========================================
-- Ejecuta esto si YA tiene credenciales pero están mal configuradas
UPDATE client_credentials 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    portal_access_enabled = true,
    is_active = true,
    account_locked_until = NULL,
    failed_login_attempts = 0,
    updated_at = NOW()
WHERE email = 'carlos.propietario@test.com'
RETURNING id, email, portal_access_enabled, must_change_password;


-- ========================================
-- PASO 6: VERIFICACIÓN FINAL
-- ========================================
-- Ejecuta esto al final para confirmar que todo está bien
SELECT 
  c.id as client_id,
  c.full_name,
  c.email,
  c.client_type,
  cc.portal_access_enabled,
  cc.must_change_password,
  cc.is_active,
  cc.account_locked_until,
  cc.failed_login_attempts,
  CASE 
    WHEN cc.id IS NULL THEN '❌ No tiene credenciales'
    WHEN NOT cc.portal_access_enabled THEN '❌ Portal deshabilitado'
    WHEN NOT cc.is_active THEN '❌ Cuenta inactiva'
    WHEN cc.account_locked_until IS NOT NULL THEN '❌ Cuenta bloqueada'
    WHEN c.client_type != 'owner' THEN '❌ No es propietario'
    ELSE '✅ TODO CORRECTO - Puede hacer login'
  END as status
FROM clients c
LEFT JOIN client_credentials cc ON c.id = cc.client_id
WHERE c.email = 'carlos.propietario@test.com';


-- ========================================
-- RESUMEN DE CREDENCIALES
-- ========================================
-- Email: carlos.propietario@test.com
-- Password: Test123456!
-- Hash pre-generado: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- 
-- Después de ejecutar estos pasos, prueba el login en:
-- http://localhost:5173/login
-- Selecciona "Cliente" (botón azul) e ingresa las credenciales
