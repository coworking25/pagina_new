-- =====================================================
-- 🚀 SOLUCIÓN RÁPIDA - PORTAL DE CLIENTES
-- =====================================================
-- Ejecutar TODO este script de una vez si el portal no funciona

-- 1. Crear tabla si no existe
CREATE TABLE IF NOT EXISTS client_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  must_change_password BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  last_password_change TIMESTAMP WITH TIME ZONE,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  reset_token TEXT,
  reset_token_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices
CREATE INDEX IF NOT EXISTS idx_client_credentials_client_id ON client_credentials(client_id);
CREATE INDEX IF NOT EXISTS idx_client_credentials_email ON client_credentials(email);

-- 3. Habilitar RLS
ALTER TABLE client_credentials ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas antiguas
DROP POLICY IF EXISTS "Allow login access" ON client_credentials;
DROP POLICY IF EXISTS "Clients can view their own credentials" ON client_credentials;
DROP POLICY IF EXISTS "Clients can update their own credentials" ON client_credentials;
DROP POLICY IF EXISTS "Advisors can create credentials" ON client_credentials;
DROP POLICY IF EXISTS "Advisors can delete credentials" ON client_credentials;
DROP POLICY IF EXISTS "Admins have full access to credentials" ON client_credentials;

-- 5. Crear políticas simples (permisivas para empezar)
CREATE POLICY "Allow public read for login" 
ON client_credentials FOR SELECT 
TO anon, authenticated
USING (true);

CREATE POLICY "Allow authenticated update" 
ON client_credentials FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert" 
ON client_credentials FOR INSERT 
TO authenticated
WITH CHECK (true);

-- 6. Verificar que funcionó
SELECT 
  'Tabla creada' as paso_1,
  EXISTS(SELECT FROM pg_tables WHERE tablename = 'client_credentials') as exito;

SELECT 
  'Políticas configuradas' as paso_2,
  COUNT(*) as total_politicas
FROM pg_policies 
WHERE tablename = 'client_credentials';

SELECT 
  'Credenciales existentes' as paso_3,
  COUNT(*) as total_credenciales
FROM client_credentials;

-- =====================================================
-- ✅ AHORA PUEDES:
-- =====================================================
-- 1. Ir a /admin/clients
-- 2. Seleccionar un cliente
-- 3. Hacer clic en "Crear Credenciales"
-- 4. Probar el login en /login con "Cliente"
-- =====================================================
