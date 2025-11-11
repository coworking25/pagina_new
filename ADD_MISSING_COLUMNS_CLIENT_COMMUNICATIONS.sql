-- ============================================
-- AGREGAR COLUMNAS FALTANTES A CLIENT_COMMUNICATIONS
-- ============================================

-- Agregar columna sender_type (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'client_communications' AND column_name = 'sender_type'
  ) THEN
    ALTER TABLE client_communications 
    ADD COLUMN sender_type TEXT NOT NULL DEFAULT 'admin' 
    CHECK (sender_type IN ('admin', 'client', 'system'));
  END IF;
END $$;

-- Agregar columna sender_id (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'client_communications' AND column_name = 'sender_id'
  ) THEN
    ALTER TABLE client_communications 
    ADD COLUMN sender_id UUID;
  END IF;
END $$;

-- Agregar columna subject (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'client_communications' AND column_name = 'subject'
  ) THEN
    ALTER TABLE client_communications 
    ADD COLUMN subject TEXT NOT NULL DEFAULT 'Sin asunto';
  END IF;
END $$;

-- Agregar columna priority (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'client_communications' AND column_name = 'priority'
  ) THEN
    ALTER TABLE client_communications 
    ADD COLUMN priority TEXT DEFAULT 'normal' 
    CHECK (priority IN ('low', 'normal', 'high'));
  END IF;
END $$;

-- Agregar columna status (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'client_communications' AND column_name = 'status'
  ) THEN
    ALTER TABLE client_communications 
    ADD COLUMN status TEXT DEFAULT 'unread' 
    CHECK (status IN ('unread', 'read', 'archived'));
  END IF;
END $$;

-- Agregar columna read_at (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'client_communications' AND column_name = 'read_at'
  ) THEN
    ALTER TABLE client_communications 
    ADD COLUMN read_at TIMESTAMPTZ;
  END IF;
END $$;

-- Agregar columna category (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'client_communications' AND column_name = 'category'
  ) THEN
    ALTER TABLE client_communications 
    ADD COLUMN category TEXT DEFAULT 'general' 
    CHECK (category IN ('general', 'payment', 'contract', 'maintenance', 'document', 'other'));
  END IF;
END $$;

-- Renombrar columna 'message_text' a 'message' si existe
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'client_communications' AND column_name = 'message_text'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'client_communications' AND column_name = 'message'
  ) THEN
    ALTER TABLE client_communications 
    RENAME COLUMN message_text TO message;
  END IF;
END $$;

-- Crear índices adicionales (si no existen)
CREATE INDEX IF NOT EXISTS idx_client_communications_status 
  ON client_communications(status);

CREATE INDEX IF NOT EXISTS idx_client_communications_sender_type 
  ON client_communications(sender_type);

CREATE INDEX IF NOT EXISTS idx_client_communications_category 
  ON client_communications(category);

-- Verificar columnas agregadas
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'client_communications'
ORDER BY ordinal_position;

-- ============================================
-- RESULTADO ESPERADO:
-- ✅ Columnas agregadas: sender_type, sender_id, subject, priority, status, read_at, category
-- ✅ Índices adicionales creados
-- ============================================
