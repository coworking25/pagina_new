-- =====================================================
-- CREAR O CORREGIR USUARIO ADMIN diegoadmin@gmail.com
-- =====================================================

-- 1. Verificar estado actual antes de cambios
SELECT
  '📊 ESTADO ANTES DE CAMBIOS:' as info,
  (SELECT COUNT(*) FROM auth.users WHERE email = 'diegoadmin@gmail.com') as existe_auth,
  (SELECT COUNT(*) FROM public.user_profiles WHERE email = 'diegoadmin@gmail.com') as existe_perfil,
  (SELECT role FROM public.user_profiles WHERE email = 'diegoadmin@gmail.com') as rol_actual,
  (SELECT is_active FROM public.user_profiles WHERE email = 'diegoadmin@gmail.com') as activo;

-- 2. Si no existe en user_profiles pero sí en auth.users, crear perfil
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
  COALESCE(au.raw_user_meta_data->>'full_name', 'Diego Admin'),
  'admin',
  true
FROM auth.users au
WHERE au.email = 'diegoadmin@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_profiles up WHERE up.email = 'diegoadmin@gmail.com'
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  is_active = true,
  updated_at = NOW();

-- 3. Si existe en user_profiles, asegurar que tenga rol admin y esté activo
UPDATE public.user_profiles
SET
  role = 'admin',
  is_active = true,
  updated_at = NOW()
WHERE email = 'diegoadmin@gmail.com'
AND (role != 'admin' OR is_active = false);

-- 4. Si no existe en auth.users, mostrar instrucciones para crearlo
DO $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM auth.users WHERE email = 'diegoadmin@gmail.com') INTO user_exists;

  IF NOT user_exists THEN
    RAISE NOTICE '⚠️ El usuario diegoadmin@gmail.com no existe en auth.users';
    RAISE NOTICE '📝 INSTRUCCIONES PARA CREARLO:';
    RAISE NOTICE '1. Ve al Dashboard de Supabase > Authentication > Users';
    RAISE NOTICE '2. Haz clic en "Add user"';
    RAISE NOTICE '3. Email: diegoadmin@gmail.com';
    RAISE NOTICE '4. Password: [elige una contraseña segura]';
    RAISE NOTICE '5. Marca "Auto confirm user"';
    RAISE NOTICE '6. User Metadata: {"full_name": "Diego Admin", "role": "admin"}';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 O usa este SQL (reemplaza PASSWORD_HASH):';
    RAISE NOTICE 'INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)';
    RAISE NOTICE 'VALUES (gen_random_uuid(), ''diegoadmin@gmail.com'', ''PASSWORD_HASH'', NOW(), ''{"full_name": "Diego Admin", "role": "admin"}''::jsonb);';
  ELSE
    RAISE NOTICE '✅ Usuario diegoadmin@gmail.com encontrado en auth.users';
  END IF;
END $$;

-- 5. Verificar estado después de cambios
SELECT
  '📊 ESTADO DESPUÉS DE CAMBIOS:' as info,
  (SELECT COUNT(*) FROM auth.users WHERE email = 'diegoadmin@gmail.com') as existe_auth,
  (SELECT COUNT(*) FROM public.user_profiles WHERE email = 'diegoadmin@gmail.com') as existe_perfil,
  (SELECT role FROM public.user_profiles WHERE email = 'diegoadmin@gmail.com') as rol_actual,
  (SELECT is_active FROM public.user_profiles WHERE email = 'diegoadmin@gmail.com') as activo;

-- 6. Mostrar detalles finales
SELECT
  au.id,
  au.email,
  au.email_confirmed_at,
  up.full_name,
  up.role,
  up.is_active,
  up.created_at,
  up.updated_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'diegoadmin@gmail.com';

-- 7. Confirmar que puede hacer login como admin
SELECT
  '🎯 RESULTADO FINAL:' as verificacion,
  CASE
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'diegoadmin@gmail.com')
    AND EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'diegoadmin@gmail.com' AND role = 'admin' AND is_active = true)
    THEN '✅ Usuario diegoadmin@gmail.com configurado correctamente como admin'
    ELSE '❌ Aún hay problemas con la configuración del usuario admin'
  END as estado;