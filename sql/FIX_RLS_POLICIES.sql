-- =====================================================
-- CORREGIR POLÍTICAS RLS CON RECURSIÓN INFINITA
-- =====================================================

-- Verificar políticas existentes antes de eliminar
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'user_profiles'
ORDER BY policyname;

-- Eliminar TODAS las políticas existentes (una por una)
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.user_profiles;

-- Crear función auxiliar que no cause recursión
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar directamente en auth.users usando metadata
  RETURN (
    SELECT (raw_user_meta_data->>'role') = 'admin'
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recrear todas las políticas
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles
  FOR SELECT
  USING (public.is_user_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.user_profiles
  FOR UPDATE
  USING (public.is_user_admin())
  WITH CHECK (public.is_user_admin());

CREATE POLICY "Admins can insert profiles"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (public.is_user_admin());

-- Verificar que las políticas se crearon correctamente
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'user_profiles'
ORDER BY policyname;