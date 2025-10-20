-- =====================================================
-- FASE 1.1: TABLA DE CREDENCIALES PARA PORTAL DE CLIENTES
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Fecha: 15 Octubre 2025

-- 1. CREAR TABLA client_credentials
-- Esta tabla almacena las credenciales de acceso al portal para cada cliente

CREATE TABLE IF NOT EXISTS client_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referencia al cliente
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
  
  -- Credenciales
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  
  -- Estado de la cuenta
  is_active BOOLEAN DEFAULT TRUE,
  must_change_password BOOLEAN DEFAULT TRUE,
  
  -- Seguridad
  last_login TIMESTAMP WITH TIME ZONE,
  last_password_change TIMESTAMP WITH TIME ZONE,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  
  -- Tokens de recuperación
  reset_token TEXT,
  reset_token_expires TIMESTAMP WITH TIME ZONE,
  
  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES advisors(id),
  
  -- Constraints
  CONSTRAINT client_credentials_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 2. CREAR ÍNDICES para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_client_credentials_client_id ON client_credentials(client_id);
CREATE INDEX IF NOT EXISTS idx_client_credentials_email ON client_credentials(email);
CREATE INDEX IF NOT EXISTS idx_client_credentials_reset_token ON client_credentials(reset_token);

-- 3. CREAR FUNCIÓN para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_client_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. CREAR TRIGGER para updated_at
DROP TRIGGER IF EXISTS trigger_update_client_credentials_updated_at ON client_credentials;
CREATE TRIGGER trigger_update_client_credentials_updated_at
    BEFORE UPDATE ON client_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_client_credentials_updated_at();

-- 5. COMENTARIOS en la tabla
COMMENT ON TABLE client_credentials IS 'Credenciales de acceso al portal de clientes';
COMMENT ON COLUMN client_credentials.client_id IS 'ID del cliente asociado';
COMMENT ON COLUMN client_credentials.email IS 'Email de login (puede ser diferente al email del cliente)';
COMMENT ON COLUMN client_credentials.password_hash IS 'Hash bcrypt de la contraseña';
COMMENT ON COLUMN client_credentials.is_active IS 'Cuenta activa o desactivada';
COMMENT ON COLUMN client_credentials.must_change_password IS 'Forzar cambio de contraseña en próximo login';
COMMENT ON COLUMN client_credentials.failed_login_attempts IS 'Contador de intentos fallidos';
COMMENT ON COLUMN client_credentials.locked_until IS 'Fecha hasta la cual la cuenta está bloqueada';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Verificar que la tabla se creó correctamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'client_credentials'
ORDER BY ordinal_position;

-- ✅ Script completado
-- Siguiente paso: 02_extend_payments_table.sql
