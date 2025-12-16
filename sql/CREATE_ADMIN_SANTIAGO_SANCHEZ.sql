-- =====================================================
-- CREAR USUARIO ADMIN: SANTIAGO SANCHEZ
-- =====================================================
-- Email: santiagosanchezcoworking@gmail.com
-- Password: Santiago2026+
-- Ejecutar este script en Supabase SQL Editor
-- =====================================================

-- PASO 1: Crear el usuario en auth.users con contraseña encriptada
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  role,
  aud,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'santiagosanchezcoworking@gmail.com',
  crypt('Santiago2026+', gen_salt('bf')),  -- Encripta la contraseña
  NOW(),
  '{"full_name": "Santiago Sanchez", "role": "admin"}'::jsonb,
  'authenticated',
  'authenticated',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- PASO 2: Verificar que el usuario se creó correctamente
SELECT
  au.id,
  au.email,
  au.email_confirmed_at,
  au.created_at,
  au.raw_user_meta_data
FROM auth.users au
WHERE au.email = 'santiagosanchezcoworking@gmail.com';

-- PASO 3: Verificar que el perfil se creó automáticamente (via trigger)
SELECT
  up.id,
  up.email,
  up.full_name,
  up.role,
  up.is_active,
  up.created_at
FROM public.user_profiles up
WHERE up.email = 'santiagosanchezcoworking@gmail.com';

-- PASO 4: Si el perfil NO se creó automáticamente, crearlo manualmente
INSERT INTO public.user_profiles (
  id,
  email,
  full_name,
  role,
  is_active,
  created_at,
  updated_at
)
SELECT
  au.id,
  'santiagosanchezcoworking@gmail.com',
  'Santiago Sanchez',
  'admin',
  true,
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'santiagosanchezcoworking@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.email = 'santiagosanchezcoworking@gmail.com'
  );

-- PASO 5: Verificación final - Listar todos los admins
SELECT
  au.email,
  up.full_name,
  up.role,
  up.is_active,
  au.created_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.role = 'admin'
ORDER BY au.created_at DESC;

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================
-- Usuario: santiagosanchezcoworking@gmail.com
-- Contraseña: Santiago2026+
-- Nombre: Santiago Sanchez
-- Rol: admin
-- Estado: activo
-- =====================================================

-- MENSAJE DE CONFIRMACIÓN
DO $$
BEGIN
    RAISE NOTICE '✅ Usuario Santiago Sanchez creado correctamente';
    RAISE NOTICE '📧 Email: santiagosanchezcoworking@gmail.com';
    RAISE NOTICE '🔑 Contraseña: Santiago2026+';
    RAISE NOTICE '👤 Nombre: Santiago Sanchez';
    RAISE NOTICE '🛡️ Rol: admin';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ IMPORTANTE: Cambiar la contraseña después del primer login';
END $$;
