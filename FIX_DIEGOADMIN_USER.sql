-- =====================================================
-- VERIFICAR Y CONFIGURAR USUARIO DIEGOADMIN@GMAIL.COM
-- =====================================================

-- Verificar si el usuario existe en auth.users
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'diegoadmin@gmail.com';

-- Verificar si tiene perfil en user_profiles
SELECT
  up.id,
  up.email,
  up.full_name,
  up.role,
  up.is_active,
  up.created_at as profile_created
FROM public.user_profiles up
WHERE up.email = 'diegoadmin@gmail.com';

-- Si no tiene perfil, crearlo manualmente
INSERT INTO public.user_profiles (id, email, full_name, role, is_active)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', 'Admin User'),
  'admin',
  true
FROM auth.users au
WHERE au.email = 'diegoadmin@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_profiles up WHERE up.id = au.id
);

-- Actualizar rol a admin si ya existe el perfil
UPDATE public.user_profiles
SET role = 'admin',
    full_name = COALESCE(full_name, 'Admin User'),
    is_active = true,
    updated_at = NOW()
WHERE email = 'diegoadmin@gmail.com';

-- Verificación final
SELECT
  'Usuario en auth.users' as status,
  COUNT(*) as count
FROM auth.users
WHERE email = 'diegoadmin@gmail.com'
UNION ALL
SELECT
  'Perfil en user_profiles' as status,
  COUNT(*) as count
FROM public.user_profiles
WHERE email = 'diegoadmin@gmail.com'
UNION ALL
SELECT
  'Usuario activo con rol admin' as status,
  COUNT(*) as count
FROM public.user_profiles
WHERE email = 'diegoadmin@gmail.com'
AND role = 'admin'
AND is_active = true;