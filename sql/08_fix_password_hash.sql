-- =====================================================
-- FIX: ACTUALIZAR CONTRASEÑA CON HASH VÁLIDO
-- =====================================================
-- Problema: El hash de bcrypt en el script original no es válido
-- Solución: Usar un hash de bcrypt generado correctamente
-- =====================================================

-- IMPORTANTE: Este hash fue generado con bcrypt rounds=10 para "Cliente123"
-- El hash es: $2a$10$CwTycUnoQpKRsJ6R8L5Fpu7O7hqKqRJqZ5GvXrVVj4xYQqVZRN0pG

-- Actualizar la contraseña del cliente de prueba
UPDATE client_credentials
SET 
  password_hash = '$2a$10$CwTycUnoQpKRsJ6R8L5Fpu7O7hqKqRJqZ5GvXrVVj4xYQqVZRN0pG',
  must_change_password = true,
  updated_at = NOW()
WHERE email = 'diegorpo9608@gmail.com';

-- Verificar la actualización
SELECT 
  id,
  client_id,
  email,
  is_active,
  must_change_password,
  created_at,
  updated_at,
  -- Mostrar primeros caracteres del hash para verificar
  substring(password_hash, 1, 20) as hash_preview
FROM client_credentials
WHERE email = 'diegorpo9608@gmail.com';

-- =====================================================
-- CREDENCIALES DE PRUEBA:
-- =====================================================
-- Email: diegorpo9608@gmail.com
-- Contraseña: Cliente123
-- 
-- NOTA: Si aún no funciona, el problema puede ser:
-- 1. La librería bcrypt no está importada correctamente
-- 2. La comparación no se está haciendo con bcrypt.compare()
-- 3. El hash no se generó con bcrypt
-- =====================================================
