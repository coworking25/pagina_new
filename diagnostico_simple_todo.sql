-- ===================================================================
-- DIAGNÓSTICO SUPER SIMPLE - TODO EN UNA SOLA TABLA
-- ===================================================================

SELECT 
  '1️⃣ TU ID' as info,
  COALESCE(auth.uid()::text, 'NULL') as valor
UNION ALL
SELECT 
  '2️⃣ TU EMAIL',
  COALESCE(auth.jwt() ->> 'email', 'NULL')
UNION ALL
SELECT 
  '3️⃣ ¿ERES ADMIN?',
  CASE WHEN is_admin() THEN '✅ SÍ' ELSE '❌ NO' END
UNION ALL
SELECT 
  '4️⃣ ¿ERES ADVISOR?',
  CASE WHEN is_advisor() THEN '✅ SÍ' ELSE '❌ NO' END
UNION ALL
SELECT 
  '5️⃣ ¿ESTÁS EN user_profiles?',
  CASE 
    WHEN EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid())
    THEN '✅ SÍ'
    ELSE '❌ NO'
  END
UNION ALL
SELECT 
  '6️⃣ ¿ESTÁS EN advisors?',
  CASE 
    WHEN EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid())
    THEN '✅ SÍ'
    ELSE '❌ NO'
  END
UNION ALL
SELECT 
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
UNION ALL
SELECT 
  '📊 USER_PROFILES #' || ROW_NUMBER() OVER (ORDER BY created_at) || ' - ID',
  id::text
FROM user_profiles
UNION ALL
SELECT 
  '📊 USER_PROFILES #' || ROW_NUMBER() OVER (ORDER BY created_at) || ' - EMAIL',
  COALESCE(email, 'sin_email')
FROM user_profiles
UNION ALL
SELECT 
  '📊 USER_PROFILES #' || ROW_NUMBER() OVER (ORDER BY created_at) || ' - ROLE',
  COALESCE(role, 'sin_role')
FROM user_profiles
UNION ALL
SELECT 
  '📊 USER_PROFILES #' || ROW_NUMBER() OVER (ORDER BY created_at) || ' - NOMBRE',
  COALESCE(full_name, 'sin_nombre')
FROM user_profiles
UNION ALL
SELECT 
  '📊 USER_PROFILES #' || ROW_NUMBER() OVER (ORDER BY created_at) || ' - ACTIVO',
  CASE WHEN is_active THEN '✅' ELSE '❌' END
FROM user_profiles
UNION ALL
SELECT 
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
UNION ALL
SELECT 
  '🔐 AUTH.USERS - ' || email,
  'ID: ' || id::text
FROM auth.users
WHERE email IN ('diegoadmin@gmail.com', 'admincoworkin@inmobiliaria.com')
   OR id = auth.uid()
ORDER BY info;
