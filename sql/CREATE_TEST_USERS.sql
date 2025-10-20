-- =====================================================
-- CREAR USUARIO DE PRUEBA PARA LOGIN
-- =====================================================

-- Crear usuario admin de prueba con credenciales conocidas
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
  'admin@test.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  '{"full_name": "Admin Test", "role": "admin"}'::jsonb,
  'authenticated',
  NOW(),
  NOW()
);

-- Crear usuario asesor de prueba
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
  'asesor@test.com',
  crypt('asesor123', gen_salt('bf')),
  NOW(),
  '{"full_name": "Asesor Test", "role": "advisor"}'::jsonb,
  'authenticated',
  NOW(),
  NOW()
);

-- Crear usuario normal de prueba
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
  'usuario@test.com',
  crypt('usuario123', gen_salt('bf')),
  NOW(),
  '{"full_name": "Usuario Test", "role": "user"}'::jsonb,
  'authenticated',
  NOW(),
  NOW()
);

-- Verificar que se crearon
SELECT
  au.email,
  up.full_name,
  up.role,
  up.is_active,
  'CREDENCIALES:' as info,
  CASE
    WHEN au.email = 'admin@test.com' THEN 'admin123'
    WHEN au.email = 'asesor@test.com' THEN 'asesor123'
    WHEN au.email = 'usuario@test.com' THEN 'usuario123'
    ELSE 'N/A'
  END as password
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.email IN ('admin@test.com', 'asesor@test.com', 'usuario@test.com')
ORDER BY au.email;