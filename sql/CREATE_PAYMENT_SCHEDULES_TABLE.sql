-- ================================================
-- TABLA: payment_schedules
-- Descripción: Almacena los pagos programados/calendario
-- Fecha: Diciembre 17, 2025
-- ================================================

-- Crear tabla payment_schedules
CREATE TABLE IF NOT EXISTS payment_schedules (
  -- Identificadores
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  property_id BIGINT REFERENCES properties(id) ON DELETE SET NULL,
  
  -- Información del pago
  payment_concept VARCHAR(100) NOT NULL, -- 'Arriendo', 'Cuota', 'Administración', 'Servicios', 'Otro'
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'COP' NOT NULL,
  
  -- Fechas
  due_date DATE NOT NULL,
  payment_date DATE, -- NULL = no pagado aún
  
  -- Estado del pago
  status VARCHAR(20) DEFAULT 'pending' NOT NULL 
    CHECK (status IN ('pending', 'paid', 'partial', 'overdue', 'cancelled')),
  
  -- Información adicional
  notes TEXT,
  payment_method VARCHAR(50), -- 'Transferencia', 'Efectivo', 'PSE', 'Tarjeta', etc.
  
  -- Relación con recibo (FK se agregará después de crear payment_receipts)
  receipt_id UUID,
  
  -- Información de pago parcial
  paid_amount DECIMAL(12, 2) DEFAULT 0 CHECK (paid_amount >= 0),
  remaining_amount DECIMAL(12, 2) GENERATED ALWAYS AS (amount - paid_amount) STORED,
  
  -- Recurrencia
  is_recurring BOOLEAN DEFAULT false,
  recurrence_frequency VARCHAR(20), -- 'monthly', 'quarterly', 'yearly'
  parent_schedule_id UUID REFERENCES payment_schedules(id) ON DELETE SET NULL,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES advisors(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES advisors(id) ON DELETE SET NULL
);

-- ================================================
-- ÍNDICES PARA RENDIMIENTO
-- ================================================

-- Índice para búsquedas por cliente
CREATE INDEX idx_payment_schedules_client_id 
ON payment_schedules(client_id);

-- Índice para búsquedas por propiedad
CREATE INDEX idx_payment_schedules_property_id 
ON payment_schedules(property_id) 
WHERE property_id IS NOT NULL;

-- Índice para búsquedas por fecha de vencimiento
CREATE INDEX idx_payment_schedules_due_date 
ON payment_schedules(due_date DESC);

-- Índice para pagos pendientes
CREATE INDEX idx_payment_schedules_pending 
ON payment_schedules(status, due_date) 
WHERE status IN ('pending', 'partial', 'overdue');

-- Índice para pagos vencidos
CREATE INDEX idx_payment_schedules_overdue 
ON payment_schedules(client_id, due_date) 
WHERE status = 'overdue';

-- Índice compuesto para calendario mensual
CREATE INDEX idx_payment_schedules_calendar 
ON payment_schedules(due_date, client_id, status);

-- Índice para pagos recurrentes
CREATE INDEX idx_payment_schedules_recurring 
ON payment_schedules(parent_schedule_id) 
WHERE parent_schedule_id IS NOT NULL;

-- ================================================
-- TRIGGER PARA UPDATED_AT
-- ================================================

CREATE OR REPLACE FUNCTION update_payment_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payment_schedules_updated_at
  BEFORE UPDATE ON payment_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_schedules_updated_at();

-- ================================================
-- TRIGGER PARA ACTUALIZAR ESTADO A OVERDUE
-- ================================================

CREATE OR REPLACE FUNCTION update_overdue_payment_schedules()
RETURNS void AS $$
BEGIN
  UPDATE payment_schedules
  SET status = 'overdue'
  WHERE status = 'pending'
    AND due_date < CURRENT_DATE
    AND payment_date IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Comentario: Esta función debe ejecutarse diariamente mediante un cron job
-- En Supabase, usar: SELECT cron.schedule('update-overdue-payments', '0 1 * * *', 'SELECT update_overdue_payment_schedules()');

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Habilitar RLS
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;

-- Política: Los administradores pueden hacer todo
CREATE POLICY "Admins can do everything on payment_schedules"
ON payment_schedules
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- Política: Los asesores solo pueden ver sus propios clientes
CREATE POLICY "Advisors can view their clients payment_schedules"
ON payment_schedules
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = payment_schedules.client_id
    AND clients.assigned_advisor_id = auth.uid()
  )
);

-- Política: Los asesores pueden actualizar pagos de sus clientes
CREATE POLICY "Advisors can update their clients payment_schedules"
ON payment_schedules
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = payment_schedules.client_id
    AND clients.assigned_advisor_id = auth.uid()
  )
);

-- Política: Los asesores pueden crear pagos para sus clientes
CREATE POLICY "Advisors can insert payment_schedules for their clients"
ON payment_schedules
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = payment_schedules.client_id
    AND clients.assigned_advisor_id = auth.uid()
  )
);

-- Política: Los clientes pueden ver sus propios pagos programados
-- NOTA: Deshabilitada porque clients no tiene user_id
-- Si se implementa portal de clientes, agregar columna user_id a clients y descomentar:
/*
CREATE POLICY "Clients can view their own payment_schedules"
ON payment_schedules
FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT id FROM clients
    WHERE user_id = auth.uid()
  )
);
*/

-- ================================================
-- COMENTARIOS EN LA TABLA
-- ================================================

COMMENT ON TABLE payment_schedules IS 'Almacena los pagos programados y su estado en el calendario';
COMMENT ON COLUMN payment_schedules.status IS 'pending: pendiente, paid: pagado, partial: pago parcial, overdue: vencido, cancelled: cancelado';
COMMENT ON COLUMN payment_schedules.payment_concept IS 'Concepto del pago: Arriendo, Cuota, Administración, Servicios, Otro';
COMMENT ON COLUMN payment_schedules.remaining_amount IS 'Columna calculada automáticamente (amount - paid_amount)';
COMMENT ON COLUMN payment_schedules.is_recurring IS 'Indica si el pago se genera automáticamente de forma recurrente';
COMMENT ON COLUMN payment_schedules.parent_schedule_id IS 'Referencia al pago original si este fue generado automáticamente';
