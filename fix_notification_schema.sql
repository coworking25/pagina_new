-- Agregar columna appointment_id faltante a la tabla notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS appointment_id UUID;

-- Agregar índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_notifications_appointment_id ON notifications(appointment_id);

-- Actualizar reminderService para usar timing_minutes en lugar de timing
-- Este script corrige la lógica del reminderService