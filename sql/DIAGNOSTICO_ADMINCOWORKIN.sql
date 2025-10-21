-- =====================================================
-- DIAGNÓSTICO Y CORRECCIÓN DEL USUARIO admincoworkin@inmobiliaria.com
-- =====================================================

-- 1. Verificar dónde existe este usuario
SELECT
  '🔍 DIAGNÓSTICO COMPLETO:' as analisis,
  CASE
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'admincoworkin@inmobiliaria.com')
    THEN '✅ Existe en auth.users (Supabase Auth)'
    ELSE '❌ NO existe en auth.users - necesita crearse'
  END as auth_users,
  CASE
    WHEN EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'admincoworkin@inmobiliaria.com')
    THEN '✅ Existe en user_profiles'
    ELSE '❌ NO existe en user_profiles'
  END as user_profiles,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_users')
    AND EXISTS (SELECT 1 FROM system_users WHERE email = 'admincoworkin@inmobiliaria.com')
    THEN '✅ Existe en system_users (sistema antiguo)'
    ELSE '❌ NO existe en system_users'
  END as system_users;

-- 2. Detalles del usuario en cada tabla
SELECT
  '📋 DETALLES EN auth.users:' as tabla,
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'admincoworkin@inmobiliaria.com';

SELECT
  '📋 DETALLES EN user_profiles:' as tabla,
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM public.user_profiles
WHERE email = 'admincoworkin@inmobiliaria.com';

-- 3. Si existe en system_users, mostrar detalles
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_users') THEN
    IF EXISTS (SELECT 1 FROM system_users WHERE email = 'admincoworkin@inmobiliaria.com') THEN
      RAISE NOTICE '📋 DETALLES EN system_users:';
      PERFORM id, email, password_hash, full_name, role, status, created_at
      FROM system_users
      WHERE email = 'admincoworkin@inmobiliaria.com';
    END IF;
  END IF;
END $$;

-- 4. CORRECCIÓN: Crear usuario en auth.users si no existe
DO $$
DECLARE
  user_exists BOOLEAN := FALSE;
  profile_exists BOOLEAN := FALSE;
BEGIN
  -- Verificar si existe en auth.users
  SELECT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admincoworkin@inmobiliaria.com') INTO user_exists;

  -- Verificar si existe en user_profiles
  SELECT EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'admincoworkin@inmobiliaria.com') INTO profile_exists;

  IF NOT user_exists THEN
    RAISE NOTICE '⚠️ El usuario admincoworkin@inmobiliaria.com NO existe en auth.users';
    RAISE NOTICE '📝 INSTRUCCIONES PARA CREARLO MANUALMENTE:';
    RAISE NOTICE '';
    RAISE NOTICE 'Ve al Dashboard de Supabase > Authentication > Users';
    RAISE NOTICE '1. Haz clic en "Add user"';
    RAISE NOTICE '2. Email: admincoworkin@inmobiliaria.com';
    RAISE NOTICE '3. Password: 21033384';
    RAISE NOTICE '4. Marca "Auto confirm user"';
    RAISE NOTICE '5. User Metadata: {"full_name": "Admin Coworkin", "role": "admin"}';
    RAISE NOTICE '';
    RAISE NOTICE 'Después de crearlo, ejecuta este script nuevamente.';
  ELSE
    RAISE NOTICE '✅ El usuario admincoworkin@inmobiliaria.com existe en auth.users';

    -- Si existe en auth.users pero no en user_profiles, crear perfil
    IF NOT profile_exists THEN
      RAISE NOTICE '⚠️ Creando perfil faltante en user_profiles...';
      INSERT INTO public.user_profiles (id, email, full_name, role, is_active)
      SELECT
        au.id,
        au.email,
        COALESCE(au.raw_user_meta_data->>'full_name', 'Admin Coworkin'),
        'admin',
        true
      FROM auth.users au
      WHERE au.email = 'admincoworkin@inmobiliaria.com'
      ON CONFLICT (email) DO UPDATE SET
        role = 'admin',
        is_active = true,
        updated_at = NOW();
      RAISE NOTICE '✅ Perfil creado correctamente';
    ELSE
      RAISE NOTICE '✅ El perfil ya existe en user_profiles';
    END IF;
  END IF;
END $$;

-- 5. Verificación final
SELECT
  '🎯 VERIFICACIÓN FINAL:' as resultado,
  CASE
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'admincoworkin@inmobiliaria.com')
    AND EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'admincoworkin@inmobiliaria.com' AND role = 'admin' AND is_active = true)
    THEN '✅ Usuario admincoworkin@inmobiliaria.com está listo para login'
    ELSE '❌ Aún hay problemas con el usuario admin'
  END as estado;

-- 6. Credenciales correctas
SELECT
  '🔑 CREDENCIALES DE ACCESO:' as info,
  'Email: admincoworkin@inmobiliaria.com' as email,
  'Password: 21033384' as password,
  'Role: admin' as role,
  CASE
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'admincoworkin@inmobiliaria.com')
    THEN '✅ Usuario existe en Supabase Auth'
    ELSE '❌ Usuario NO existe - crear manualmente en dashboard'
  END as estado_auth,
  CASE
    WHEN EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'admincoworkin@inmobiliaria.com' AND role = 'admin')
    THEN '✅ Tiene permisos de admin'
    ELSE '❌ No tiene rol de admin'
  END as permisos;