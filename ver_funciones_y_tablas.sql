-- ===================================================================
-- DIAGNÓSTICO COMPLETO DEL SISTEMA DE ADMINISTRACIÓN
-- ===================================================================
-- Este script unifica todos los resultados en una sola consulta

WITH 
-- Tu sesión actual
sesion AS (
  SELECT 
    auth.uid() as mi_id,
    auth.jwt() ->> 'email' as mi_email
),
-- Verificaciones
verificaciones AS (
  SELECT 
    '1️⃣ TU SESIÓN' as seccion,
    'ID: ' || COALESCE(auth.uid()::text, 'NULL') || 
    ' | Email: ' || COALESCE(auth.jwt() ->> 'email', 'NULL') as info
  UNION ALL
  SELECT 
    '2️⃣ ¿ERES ADMIN?',
    CASE WHEN is_admin() THEN '✅ SÍ' ELSE '❌ NO' END
  UNION ALL
  SELECT 
    '3️⃣ ¿ERES ADVISOR?',
    CASE WHEN is_advisor() THEN '✅ SÍ' ELSE '❌ NO' END
  UNION ALL
  SELECT 
    '4️⃣ ¿ESTÁS EN user_profiles?',
    CASE 
      WHEN EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid())
      THEN '✅ SÍ'
      ELSE '❌ NO'
    END
  UNION ALL
  SELECT 
    '5️⃣ ¿ESTÁS EN advisors?',
    CASE 
      WHEN EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid())
      THEN '✅ SÍ'
      ELSE '❌ NO'
    END
)
SELECT * FROM verificaciones;

-- ===================================================================
-- VER CONTENIDO DE user_profiles (DASHBOARD ADMINS)
-- ===================================================================
SELECT 
  '� TABLA: user_profiles' as tipo,
  id::text as identificador,
  email,
  COALESCE(role, 'sin_role') as role,
  COALESCE(full_name, 'sin_nombre') as full_name,
  created_at::text as created_at
FROM user_profiles
ORDER BY created_at DESC;

-- ===================================================================
-- VER USUARIOS EN auth.users (DIEGO Y admincoworkin)
-- ===================================================================
SELECT 
  '� TABLA: auth.users' as tipo,
  id::text as identificador,
  email,
  COALESCE((raw_user_meta_data->>'full_name')::text, 'sin_metadata') as metadata,
  created_at::text as created_at
FROM auth.users
WHERE email IN ('diegoadmin@gmail.com', 'admincoworkin@inmobiliaria.com')
   OR id = auth.uid()
ORDER BY created_at DESC;

-- ===================================================================
-- VER DEFINICIÓN DE is_admin() Y is_advisor()
-- ===================================================================
SELECT 
  '� FUNCIÓN: is_admin()' as tipo,
  pg_get_functiondef(oid) as codigo_completo
FROM pg_proc
WHERE proname = 'is_admin'
UNION ALL
SELECT 
  '🔍 FUNCIÓN: is_advisor()' as tipo,
  pg_get_functiondef(oid) as codigo_completo
FROM pg_proc
WHERE proname = 'is_advisor';
