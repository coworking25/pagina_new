-- =====================================================
-- CORRECCIÓN MASIVA DE PERFILES DE USUARIO
-- Crear perfiles faltantes para usuarios existentes
-- =====================================================

-- 1. Ver estado actual antes de correcciones
SELECT
  '📊 ESTADO ACTUAL:' as info,
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM public.user_profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN public.user_profiles up ON au.id = up.id WHERE up.id IS NULL) as usuarios_sin_perfil;

-- 2. Crear perfiles faltantes con roles apropiados
INSERT INTO public.user_profiles (
  id,
  email,
  full_name,
  role,
  is_active
)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name',
           CASE
             WHEN au.email = 'admin@test.com' THEN 'Admin Test'
             WHEN au.email = 'asesor@test.com' THEN 'Asesor Test'
             WHEN au.email = 'usuario@test.com' THEN 'Usuario Test'
             WHEN au.email = 'asesorandres@coworking.com' THEN 'Andres Asesor'
             WHEN au.email = 'diego@cliente.com' THEN 'Diego Cliente'
             ELSE 'Usuario'
           END
  ),
  CASE
    WHEN au.email LIKE '%admin%' THEN 'admin'
    WHEN au.email LIKE '%asesor%' THEN 'advisor'
    WHEN au.email LIKE '%cliente%' OR au.email = 'usuario@test.com' THEN 'user'
    ELSE 'user'
  END as role,
  true as is_active
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles up WHERE up.id = au.id
)
ON CONFLICT (email) DO NOTHING;

-- 3. Asegurar que todos los perfiles estén activos y con roles correctos
UPDATE public.user_profiles
SET
  role = CASE
    WHEN email LIKE '%admin%' THEN 'admin'
    WHEN email LIKE '%asesor%' THEN 'advisor'
    WHEN email LIKE '%cliente%' OR email = 'usuario@test.com' THEN 'user'
    ELSE role
  END,
  is_active = true,
  updated_at = NOW()
WHERE is_active = false OR role IS NULL OR role = '';

-- 4. Ver estado después de correcciones
SELECT
  '📊 ESTADO DESPUÉS DE CORRECCIONES:' as info,
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM public.user_profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users au INNER JOIN public.user_profiles up ON au.id = up.id) as usuarios_con_perfil;

-- 5. Mostrar todos los usuarios con sus perfiles completos
SELECT
  au.id,
  au.email,
  au.email_confirmed_at,
  COALESCE(up.full_name, 'Sin perfil') as full_name,
  COALESCE(up.role, 'Sin rol') as role,
  COALESCE(up.is_active::text, 'Sin estado') as is_active,
  au.created_at as auth_created,
  up.created_at as profile_created
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
ORDER BY au.created_at DESC;

-- 6. Verificar distribución de roles
SELECT
  role,
  COUNT(*) as cantidad,
  COUNT(*) FILTER (WHERE is_active = true) as activos
FROM public.user_profiles
GROUP BY role
ORDER BY role;

-- 7. Confirmar que todos pueden hacer login
SELECT
  '🎯 RESULTADO FINAL:' as verificacion,
  CASE
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.user_profiles WHERE is_active = true)
    THEN '✅ Todos los usuarios tienen perfiles activos y pueden hacer login'
    ELSE '⚠️ Algunos usuarios aún no tienen perfiles o están inactivos'
  END as estado,
  (SELECT COUNT(*) FROM auth.users) as total_usuarios,
  (SELECT COUNT(*) FROM public.user_profiles WHERE is_active = true) as perfiles_activos;