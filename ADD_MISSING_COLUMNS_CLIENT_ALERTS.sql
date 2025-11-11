-- ============================================
-- AGREGAR COLUMNAS FALTANTES A CLIENT_ALERTS
-- ============================================

-- Agregar columna severity (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'client_alerts' AND column_name = 'severity'
  ) THEN
    ALTER TABLE client_alerts 
    ADD COLUMN severity TEXT NOT NULL DEFAULT 'medium' 
    CHECK (severity IN ('low', 'medium', 'high'));
    
    COMMENT ON COLUMN client_alerts.severity IS 
      'Nivel de severidad: low (información), medium (importante), high (urgente)';
  END IF;
END $$;

-- Agregar columna expires_at (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'client_alerts' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE client_alerts 
    ADD COLUMN expires_at TIMESTAMPTZ;
    
    COMMENT ON COLUMN client_alerts.expires_at IS 
      'Fecha de expiración de la alerta. NULL = no expira';
  END IF;
END $$;

-- Agregar columna read_at (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'client_alerts' AND column_name = 'read_at'
  ) THEN
    ALTER TABLE client_alerts 
    ADD COLUMN read_at TIMESTAMPTZ;
  END IF;
END $$;

-- Crear índice para expires_at (si no existe)
CREATE INDEX IF NOT EXISTS idx_client_alerts_expires_at 
  ON client_alerts(expires_at);

-- Verificar columnas agregadas
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'client_alerts'
ORDER BY ordinal_position;

-- ============================================
-- RESULTADO ESPERADO:
-- ✅ Columna severity agregada
-- ✅ Columna expires_at agregada
-- ✅ Columna read_at agregada
-- ✅ Índice para expires_at creado
-- ============================================
