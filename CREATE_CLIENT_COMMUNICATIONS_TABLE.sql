-- ============================================
-- CREAR TABLA CLIENT_COMMUNICATIONS
-- Sistema de mensajería para portal de clientes
-- ============================================

-- Crear tabla client_communications
CREATE TABLE IF NOT EXISTS client_communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'client', 'system')),
  sender_id UUID, -- ID del admin o NULL si es system
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'normal', 'high')) DEFAULT 'normal',
  status TEXT CHECK (status IN ('unread', 'read', 'archived')) DEFAULT 'unread',
  read_at TIMESTAMPTZ,
  category TEXT CHECK (category IN ('general', 'payment', 'contract', 'maintenance', 'document', 'other')) DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_client_communications_client_id 
  ON client_communications(client_id);

CREATE INDEX IF NOT EXISTS idx_client_communications_status 
  ON client_communications(status);

CREATE INDEX IF NOT EXISTS idx_client_communications_created_at 
  ON client_communications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_client_communications_sender_type 
  ON client_communications(sender_type);

-- Comentarios descriptivos
COMMENT ON TABLE client_communications IS 
  'Sistema de mensajería entre administradores y clientes';

COMMENT ON COLUMN client_communications.sender_type IS 
  'Tipo de remitente: admin (administrador), client (cliente), system (sistema automático)';

COMMENT ON COLUMN client_communications.priority IS 
  'Prioridad del mensaje: low, normal, high';

COMMENT ON COLUMN client_communications.status IS 
  'Estado del mensaje: unread (no leído), read (leído), archived (archivado)';

COMMENT ON COLUMN client_communications.category IS 
  'Categoría del mensaje: general, payment, contract, maintenance, document, other';

-- Habilitar RLS (Row Level Security)
ALTER TABLE client_communications ENABLE ROW LEVEL SECURITY;

-- Política: Los clientes solo pueden ver sus propios mensajes
CREATE POLICY "client_communications_select_client" ON client_communications
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

-- Política: Los clientes pueden actualizar el estado de sus mensajes (marcar como leído)
CREATE POLICY "client_communications_update_client" ON client_communications
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

-- Política: Los clientes pueden enviar mensajes (respuestas)
CREATE POLICY "client_communications_insert_client" ON client_communications
  FOR INSERT 
  WITH CHECK (
    sender_type = 'client' AND
    client_id IN (
      SELECT id FROM clients 
      WHERE id = auth.uid()
      OR id = (
        SELECT client_id FROM client_credentials 
        WHERE id = auth.uid()
      )
    )
  );

-- Política: Los admins pueden ver todos los mensajes
CREATE POLICY "client_communications_select_admin" ON client_communications
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Política: Los admins pueden insertar mensajes
CREATE POLICY "client_communications_insert_admin" ON client_communications
  FOR INSERT 
  WITH CHECK (
    sender_type = 'admin' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Política: Los admins pueden actualizar mensajes
CREATE POLICY "client_communications_update_admin" ON client_communications
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_client_communications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_client_communications_updated_at
  BEFORE UPDATE ON client_communications
  FOR EACH ROW
  EXECUTE FUNCTION update_client_communications_updated_at();

-- Verificar creación
SELECT 
  'client_communications' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'client_communications';

-- Mostrar estructura
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
-- ✅ Tabla client_communications creada con 12 columnas
-- ✅ 4 índices creados
-- ✅ 6 políticas RLS configuradas
-- ✅ 1 trigger para updated_at
-- ============================================
