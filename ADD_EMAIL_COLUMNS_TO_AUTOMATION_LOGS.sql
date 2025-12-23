-- =====================================================
-- AGREGAR COLUMNAS DE EMAIL A AUTOMATION_LOGS
-- Permite rastrear emails enviados por el sistema de automatización
-- =====================================================

-- Agregar columna para indicar si se envió email
ALTER TABLE automation_logs
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT NULL;

-- Agregar columna para guardar el ID del email de Resend
ALTER TABLE automation_logs
ADD COLUMN IF NOT EXISTS email_id VARCHAR(100) DEFAULT NULL;

-- Comentarios
COMMENT ON COLUMN automation_logs.email_sent IS 'Indica si se envió email: true=enviado, false=no enviado, null=no procesado';
COMMENT ON COLUMN automation_logs.email_id IS 'ID del email en Resend (message ID)';

-- Crear índice para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_automation_logs_email_sent 
ON automation_logs(email_sent, executed_at DESC)
WHERE email_sent IS NULL OR email_sent = true;

-- Verificar estructura
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'automation_logs'
  AND column_name IN ('email_sent', 'email_id')
ORDER BY ordinal_position;
