-- ============================================
-- CREAR TABLA CLIENT_ALERTS
-- Sistema de alertas para portal de clientes
-- ============================================

-- Eliminar tabla si existe (CUIDADO: esto borra todos los datos)
-- DROP TABLE IF EXISTS client_alerts CASCADE;

-- Crear tabla client_alerts
CREATE TABLE IF NOT EXISTS client_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'payment_reminder', 
    'payment_overdue', 
    'document_expiring',
    'contract_expiring', 
    'general', 
    'urgent'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false NOT NULL,
  read_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_client_alerts_client_id 
  ON client_alerts(client_id);

CREATE INDEX IF NOT EXISTS idx_client_alerts_created_at 
  ON client_alerts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_client_alerts_expires_at 
  ON client_alerts(expires_at);

CREATE INDEX IF NOT EXISTS idx_client_alerts_is_read 
  ON client_alerts(is_read);

-- Comentarios descriptivos
COMMENT ON TABLE client_alerts IS 
  'Alertas y notificaciones para clientes del portal';

COMMENT ON COLUMN client_alerts.alert_type IS 
  'Tipo de alerta: payment_reminder, payment_overdue, document_expiring, contract_expiring, general, urgent';

COMMENT ON COLUMN client_alerts.severity IS 
  'Nivel de severidad: low (información), medium (importante), high (urgente)';

COMMENT ON COLUMN client_alerts.expires_at IS 
  'Fecha de expiración de la alerta. NULL = no expira';

-- Habilitar RLS (Row Level Security)
ALTER TABLE client_alerts ENABLE ROW LEVEL SECURITY;

-- Política: Los clientes solo pueden ver sus propias alertas
CREATE POLICY "client_alerts_select" ON client_alerts
  FOR SELECT 
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE id = auth.uid() 
      OR id = (
        SELECT client_id FROM client_credentials 
        WHERE id = auth.uid()
      )
    )
  );

-- Política: Los clientes pueden actualizar sus propias alertas (marcar como leída)
CREATE POLICY "client_alerts_update" ON client_alerts
  FOR UPDATE 
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE id = auth.uid()
      OR id = (
        SELECT client_id FROM client_credentials 
        WHERE id = auth.uid()
      )
    )
  );

-- Política: Solo admins pueden insertar alertas
CREATE POLICY "client_alerts_insert_admin" ON client_alerts
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Política: Solo admins pueden eliminar alertas
CREATE POLICY "client_alerts_delete_admin" ON client_alerts
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_client_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_client_alerts_updated_at
  BEFORE UPDATE ON client_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_client_alerts_updated_at();

-- Verificar creación
SELECT 
  'client_alerts' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'client_alerts';

-- Mostrar estructura
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
-- ✅ Tabla client_alerts creada con 12 columnas
-- ✅ 4 índices creados
-- ✅ 4 políticas RLS configuradas
-- ✅ 1 trigger para updated_at
-- ============================================
