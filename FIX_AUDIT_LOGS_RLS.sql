-- Solución al error 403/42501: Permission denied for table users
-- El error ocurre porque la política RLS intentaba leer directamente de auth.users,
-- lo cual no está permitido para usuarios normales.
-- Solución: Usar auth.jwt() para leer los metadatos del token directamente.

-- 1. Eliminar la política defectuosa
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;

-- 2. Crear nueva política segura usando JWT
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT
  USING (
    -- Opción A: El usuario tiene rol 'admin' en sus metadatos (auth.jwt)
    (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
    OR
    -- Opción B: El usuario existe en la tabla de asesores (validado por email del token)
    (EXISTS (
      SELECT 1 FROM public.advisors 
      WHERE email = (auth.jwt() ->> 'email')
    ))
  );
