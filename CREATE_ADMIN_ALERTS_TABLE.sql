-- =====================================================
-- TABLA ADMIN_ALERTS - Sistema de Alertas para Administradores
-- =====================================================

-- Eliminar tabla si existe (CUIDADO: borra todos los datos)
DROP TABLE IF EXISTS admin_alerts CASCADE;

-- Crear tabla admin_alerts
CREATE TABLE admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'new_appointment',        -- Nueva cita agendada
    'appointment_cancelled',  -- Cita cancelada
    'new_client',            -- Nuevo cliente registrado
    'payment_received',      -- Pago recibido
    'payment_overdue',       -- Pago vencido
    'contract_expiring',     -- Contrato por vencer
    'new_inquiry',           -- Nueva consulta de servicio
    'property_inactive',     -- Propiedad inactiva
    'system_alert',          -- Alerta del sistema
    'task_assigned'          -- Tarea asignada
  )),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  related_appointment_id UUID,
  related_client_id UUID,
  related_property_id BIGINT,
  related_payment_id UUID,
  is_read BOOLEAN DEFAULT false NOT NULL,
  read_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Crear índices para optimizar consultas
CREATE INDEX idx_admin_alerts_user_id ON admin_alerts(user_id);
CREATE INDEX idx_admin_alerts_created_at ON admin_alerts(created_at DESC);
CREATE INDEX idx_admin_alerts_expires_at ON admin_alerts(expires_at);
CREATE INDEX idx_admin_alerts_is_read ON admin_alerts(is_read);
CREATE INDEX idx_admin_alerts_severity ON admin_alerts(severity);
CREATE INDEX idx_admin_alerts_user_unread ON admin_alerts(user_id, is_read) WHERE is_read = false;

-- Comentarios descriptivos
COMMENT ON TABLE admin_alerts IS 
  'Alertas y notificaciones para administradores del sistema';

COMMENT ON COLUMN admin_alerts.alert_type IS 
  'Tipo de alerta: new_appointment, appointment_cancelled, new_client, payment_received, payment_overdue, contract_expiring, new_inquiry, property_inactive, system_alert, task_assigned';

COMMENT ON COLUMN admin_alerts.severity IS 
  'Nivel de severidad: low (información), medium (importante), high (urgente)';

COMMENT ON COLUMN admin_alerts.expires_at IS 
  'Fecha de expiración de la alerta. NULL = no expira';

-- Deshabilitar RLS (el panel admin usa su propio sistema de auth)
ALTER TABLE admin_alerts DISABLE ROW LEVEL SECURITY;

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_admin_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_admin_alerts_updated_at
  BEFORE UPDATE ON admin_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_alerts_updated_at();

-- =====================================================
-- VERIFICAR CREACIÓN
-- =====================================================

SELECT 
  'admin_alerts' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'admin_alerts';

-- Mostrar estructura
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'admin_alerts'
ORDER BY ordinal_position;

-- =====================================================
-- RESULTADO ESPERADO:
-- ✅ Tabla admin_alerts creada con 15 columnas
-- ✅ 6 índices creados
-- ✅ RLS deshabilitado (panel admin usa auth propio)
-- ✅ 1 trigger para updated_at
-- =====================================================

-- Ver estado RLS
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'admin_alerts';

-- Debería mostrar: rls_enabled = false

-- =====================================================
-- ✅ TABLA LISTA PARA USAR
-- Ahora ejecuta CREAR_ALERTAS_ADMIN_PRUEBA.sql para crear alertas de prueba
-- =====================================================
