-- =====================================================
-- VERIFICAR USUARIOS EN AUTH.USERS
-- =====================================================

-- Ver todos los usuarios en auth.users
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'role' as role_from_metadata
FROM auth.users
ORDER BY created_at DESC;

-- Verificar si coinciden con user_profiles
SELECT
  'auth.users' as tabla,
  COUNT(*) as total_usuarios
FROM auth.users
UNION ALL
SELECT
  'user_profiles' as tabla,
  COUNT(*) as total_perfiles
FROM public.user_profiles
UNION ALL
SELECT
  'Coincidencias' as tabla,
  COUNT(*) as coinciden
FROM auth.users au
INNER JOIN public.user_profiles up ON au.id = up.id;

-- Detalle completo de usuarios
SELECT
  au.id,
  au.email,
  au.email_confirmed_at,
  au.created_at as auth_created,
  up.full_name,
  up.role,
  up.is_active,
  up.created_at as profile_created,
  CASE
    WHEN au.email = 'admin@test.com' THEN 'admin123'
    WHEN au.email = 'asesor@test.com' THEN 'asesor123'
    WHEN au.email = 'usuario@test.com' THEN 'usuario123'
    ELSE 'DESCONOCIDA'
  END as expected_password
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
ORDER BY au.created_at DESC;