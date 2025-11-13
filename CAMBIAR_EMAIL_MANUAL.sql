-- =====================================================
-- SCRIPT PARA CAMBIAR EMAIL MANUALMENTE EN SUPABASE
-- =====================================================
-- Ejecuta este script en Supabase SQL Editor

-- 1. VER USUARIOS ACTUALES
SELECT 
  au.id,
  au.email as "Email en Auth",
  up.email as "Email en Perfil",
  up.full_name,
  up.role,
  au.email_confirmed_at as "Email Confirmado"
FROM auth.users au
LEFT JOIN user_profiles up ON up.id = au.id
WHERE up.role = 'admin';

-- 2. CAMBIAR EMAIL DIRECTAMENTE (REEMPLAZA CON TUS DATOS)
-- Cambia 'EMAIL_ACTUAL' por tu email actual (diegoadmin@gmail.com)
-- Cambia 'NUEVO_EMAIL' por tu nuevo email (diegorpo9608@gmail.com)

-- Actualizar en auth.users
UPDATE auth.users
SET 
  email = 'diegorpo9608@gmail.com',
  email_confirmed_at = NOW(),  -- Marca como confirmado inmediatamente
  updated_at = NOW()
WHERE email = 'diegoadmin@gmail.com';

-- Actualizar en user_profiles
UPDATE user_profiles
SET 
  email = 'diegorpo9608@gmail.com',
  updated_at = NOW()
WHERE email = 'diegoadmin@gmail.com';

-- 3. VERIFICAR QUE SE ACTUALIZÓ
SELECT 
  au.id,
  au.email as "Email en Auth",
  up.email as "Email en Perfil",
  up.full_name,
  up.role,
  au.email_confirmed_at as "Email Confirmado"
FROM auth.users au
LEFT JOIN user_profiles up ON up.id = au.id
WHERE up.role = 'admin';

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- Email en Auth: diegorpo9608@gmail.com
-- Email en Perfil: diegorpo9608@gmail.com
-- Email Confirmado: [fecha actual] <- Ya no es NULL
-- =====================================================

-- 4. SI NECESITAS REVERTIR (OPCIONAL)
-- UPDATE auth.users
-- SET 
--   email = 'diegoadmin@gmail.com',
--   email_confirmed_at = NOW(),
--   updated_at = NOW()
-- WHERE email = 'diegorpo9608@gmail.com';
-- 
-- UPDATE user_profiles
-- SET 
--   email = 'diegoadmin@gmail.com',
--   updated_at = NOW()
-- WHERE email = 'diegorpo9608@gmail.com';
