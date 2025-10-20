-- =====================================================
-- CREAR USUARIO ADMIN DESDE SQL EDITOR
-- =====================================================
-- Ejecutar después de la migración de autenticación

-- 1. CREAR USUARIO ADMIN EN SUPABASE AUTH
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  role,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admincoworkin@inmobiliaria.com',
  crypt('21033384', gen_salt('bf')),
  NOW(),
  '{"full_name": "Admin Coworkin", "role": "admin"}'::jsonb,
  'authenticated',
  NOW(),
  NOW()
);

-- 2. VERIFICAR QUE SE CREÓ EL PERFIL AUTOMÁTICAMENTE
-- (El trigger handle_new_user debería crear el perfil automáticamente)
SELECT
  au.email,
  up.full_name,
  up.role,
  up.is_active,
  au.created_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'admincoworkin@inmobiliaria.com';

-- =====================================================
-- CREAR USUARIO ASESOR DESDE SQL EDITOR
-- =====================================================

-- 1. CREAR USUARIO ASESOR
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  role,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'asesor@empresa.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"full_name": "Juan Pérez", "role": "advisor"}'::jsonb,
  'authenticated',
  NOW(),
  NOW()
);

-- 2. VERIFICAR CREACIÓN
SELECT
  au.email,
  up.full_name,
  up.role,
  up.is_active
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'asesor@empresa.com';

-- =====================================================
-- CREAR USUARIO NORMAL DESDE SQL EDITOR
-- =====================================================

-- 1. CREAR USUARIO NORMAL
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  role,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'usuario@cliente.com',
  crypt('cliente123', gen_salt('bf')),
  NOW(),
  '{"full_name": "María García", "role": "user"}'::jsonb,
  'authenticated',
  NOW(),
  NOW()
);

-- 2. VERIFICAR CREACIÓN
SELECT
  au.email,
  up.full_name,
  up.role,
  up.is_active
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'usuario@cliente.com';

-- =====================================================
-- ACTUALIZAR ROL DE UN USUARIO EXISTENTE
-- =====================================================

-- Cambiar un usuario existente a admin
UPDATE public.user_profiles
SET role = 'admin',
    updated_at = NOW()
WHERE email = 'usuario@cliente.com';

-- Cambiar un usuario existente a asesor
UPDATE public.user_profiles
SET role = 'advisor',
    updated_at = NOW()
WHERE email = 'otro@usuario.com';

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Ver todos los usuarios creados
SELECT
  'Usuarios en auth.users' as tabla,
  COUNT(*) as total
FROM auth.users
UNION ALL
SELECT
  'Perfiles en user_profiles' as tabla,
  COUNT(*) as total
FROM public.user_profiles
UNION ALL
SELECT
  'Usuarios activos' as tabla,
  COUNT(*) as total
FROM public.user_profiles
WHERE is_active = true;

-- Detalle de todos los usuarios
SELECT
  au.email,
  up.full_name,
  up.role,
  up.is_active,
  au.created_at as auth_created,
  up.created_at as profile_created
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
ORDER BY au.created_at DESC;