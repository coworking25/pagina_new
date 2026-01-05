-- Solución al error: Could not find the 'action' column of 'auth_logs'
-- Este script asegura que la tabla auth_logs exista y tenga la estructura correcta.

-- 1. Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS public.auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Verificar y agregar columnas faltantes (si la tabla ya existía pero estaba incompleta)
DO $$
BEGIN
    -- Verificar columna action
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'auth_logs' AND column_name = 'action') THEN
        ALTER TABLE public.auth_logs ADD COLUMN action TEXT;
    END IF;

    -- Verificar columna ip_address
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'auth_logs' AND column_name = 'ip_address') THEN
        ALTER TABLE public.auth_logs ADD COLUMN ip_address INET;
    END IF;

    -- Verificar columna user_agent
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'auth_logs' AND column_name = 'user_agent') THEN
        ALTER TABLE public.auth_logs ADD COLUMN user_agent TEXT;
    END IF;

    -- Verificar columna metadata
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'auth_logs' AND column_name = 'metadata') THEN
        ALTER TABLE public.auth_logs ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 3. Asegurar índices
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON public.auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_action ON public.auth_logs(action);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON public.auth_logs(created_at);

-- 4. Habilitar RLS
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de seguridad (Permitir inserción pública para registrar login/logout, pero lectura restringida)

-- Permitir a cualquier usuario autenticado insertar sus propios logs
DROP POLICY IF EXISTS "Users can insert their own auth logs" ON public.auth_logs;
CREATE POLICY "Users can insert their own auth logs" ON public.auth_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Permitir a usuarios anónimos insertar logs (necesario para login fallido o inicial)
-- Nota: Esto es un compromiso de seguridad para permitir logging desde el cliente antes de tener sesión completa
DROP POLICY IF EXISTS "Anon can insert auth logs" ON public.auth_logs;
CREATE POLICY "Anon can insert auth logs" ON public.auth_logs
  FOR INSERT
  WITH CHECK (true);

-- Solo admins pueden ver los logs
DROP POLICY IF EXISTS "Admins can view auth logs" ON public.auth_logs;
CREATE POLICY "Admins can view auth logs" ON public.auth_logs
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
    OR
    (EXISTS (SELECT 1 FROM public.advisors WHERE email = (auth.jwt() ->> 'email')))
  );

-- Recargar caché de esquema (esto se hace automáticamente en Supabase, pero es bueno saberlo)
NOTIFY pgrst, 'reload schema';
