-- ================================================
-- TABLA: payment_receipts
-- Descripción: Almacena los recibos de pago cargados
-- Fecha: Diciembre 17, 2025
-- ================================================

-- Crear tabla payment_receipts
CREATE TABLE IF NOT EXISTS payment_receipts (
  -- Identificadores
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES payment_schedules(id) ON DELETE SET NULL,
  
  -- Información del archivo
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL, -- Ruta en Supabase Storage
  file_size INTEGER, -- Tamaño en bytes
  file_type VARCHAR(100), -- 'application/pdf', 'image/jpeg', etc.
  
  -- Información del pago
  payment_amount DECIMAL(12, 2) NOT NULL CHECK (payment_amount > 0),
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50), -- 'Transferencia', 'Efectivo', 'PSE', etc.
  payment_reference VARCHAR(100), -- Número de referencia/transacción
  
  -- Descripción
  description TEXT,
  notes TEXT,
  
  -- Estado del recibo
  status VARCHAR(20) DEFAULT 'pending' NOT NULL 
    CHECK (status IN ('pending', 'verified', 'rejected')),
  verification_notes TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES advisors(id) ON DELETE SET NULL,
  
  -- Auditoría
  uploaded_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  uploaded_by UUID REFERENCES advisors(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ================================================
-- ÍNDICES PARA RENDIMIENTO
-- ================================================

-- Índice para búsquedas por cliente
CREATE INDEX idx_payment_receipts_client_id 
ON payment_receipts(client_id);

-- Índice para búsquedas por schedule
CREATE INDEX idx_payment_receipts_schedule_id 
ON payment_receipts(schedule_id) 
WHERE schedule_id IS NOT NULL;

-- Índice para búsquedas por fecha de pago
CREATE INDEX idx_payment_receipts_payment_date 
ON payment_receipts(payment_date DESC);

-- Índice para recibos pendientes de verificación
CREATE INDEX idx_payment_receipts_pending 
ON payment_receipts(status, uploaded_at) 
WHERE status = 'pending';

-- Índice para búsquedas por fecha de carga
CREATE INDEX idx_payment_receipts_uploaded_at 
ON payment_receipts(uploaded_at DESC);

-- Índice compuesto para historial por cliente
CREATE INDEX idx_payment_receipts_client_history 
ON payment_receipts(client_id, payment_date DESC, status);

-- ================================================
-- TRIGGER PARA UPDATED_AT
-- ================================================

CREATE OR REPLACE FUNCTION update_payment_receipts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payment_receipts_updated_at
  BEFORE UPDATE ON payment_receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_receipts_updated_at();

-- ================================================
-- TRIGGER PARA ACTUALIZAR PAYMENT_SCHEDULE AL VERIFICAR
-- ================================================

CREATE OR REPLACE FUNCTION update_schedule_on_receipt_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el recibo fue verificado y tiene un schedule asociado
  IF NEW.status = 'verified' AND NEW.schedule_id IS NOT NULL AND OLD.status != 'verified' THEN
    -- Actualizar el payment_schedule
    UPDATE payment_schedules
    SET 
      status = CASE 
        WHEN (paid_amount + NEW.payment_amount) >= amount THEN 'paid'
        WHEN (paid_amount + NEW.payment_amount) > 0 THEN 'partial'
        ELSE 'pending'
      END,
      paid_amount = paid_amount + NEW.payment_amount,
      payment_date = CASE 
        WHEN payment_date IS NULL THEN NEW.payment_date 
        ELSE payment_date 
      END,
      payment_method = CASE 
        WHEN payment_method IS NULL THEN NEW.payment_method 
        ELSE payment_method 
      END,
      receipt_id = NEW.id,
      updated_at = now()
    WHERE id = NEW.schedule_id;
  END IF;
  
  -- Si el recibo fue rechazado, revertir cambios si aplicaban
  IF NEW.status = 'rejected' AND NEW.schedule_id IS NOT NULL AND OLD.status = 'verified' THEN
    -- Revertir el paid_amount
    UPDATE payment_schedules
    SET 
      paid_amount = GREATEST(0, paid_amount - NEW.payment_amount),
      status = CASE 
        WHEN (paid_amount - NEW.payment_amount) <= 0 THEN 'pending'
        WHEN (paid_amount - NEW.payment_amount) >= amount THEN 'paid'
        ELSE 'partial'
      END,
      updated_at = now()
    WHERE id = NEW.schedule_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_schedule_on_verification
  AFTER UPDATE OF status ON payment_receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_schedule_on_receipt_verification();

-- ================================================
-- FUNCIÓN PARA ELIMINAR ARCHIVO DE STORAGE
-- ================================================

CREATE OR REPLACE FUNCTION delete_receipt_file_from_storage()
RETURNS TRIGGER AS $$
BEGIN
  -- Nota: Esta función marca el archivo para eliminación
  -- La eliminación real debe hacerse desde la aplicación usando Supabase Storage API
  -- porque SQL no puede acceder directamente al Storage
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_delete_receipt_file
  BEFORE DELETE ON payment_receipts
  FOR EACH ROW
  EXECUTE FUNCTION delete_receipt_file_from_storage();

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Habilitar RLS
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;

-- Política: Los administradores pueden hacer todo
CREATE POLICY "Admins can do everything on payment_receipts"
ON payment_receipts
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- Política: Los asesores pueden ver recibos de sus clientes
CREATE POLICY "Advisors can view their clients payment_receipts"
ON payment_receipts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = payment_receipts.client_id
    AND clients.assigned_advisor_id = auth.uid()
  )
);

-- Política: Los asesores pueden crear recibos para sus clientes
CREATE POLICY "Advisors can insert payment_receipts for their clients"
ON payment_receipts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = payment_receipts.client_id
    AND clients.assigned_advisor_id = auth.uid()
  )
);

-- Política: Los asesores pueden actualizar recibos de sus clientes
CREATE POLICY "Advisors can update their clients payment_receipts"
ON payment_receipts
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = payment_receipts.client_id
    AND clients.assigned_advisor_id = auth.uid()
  )
);

-- Política: Los asesores pueden eliminar recibos de sus clientes
CREATE POLICY "Advisors can delete their clients payment_receipts"
ON payment_receipts
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = payment_receipts.client_id
    AND clients.assigned_advisor_id = auth.uid()
  )
);

-- Política: Los clientes pueden ver sus propios recibos
-- NOTA: Deshabilitada porque clients no tiene user_id
-- Si se implementa portal de clientes, agregar columna user_id a clients y descomentar:
/*
CREATE POLICY "Clients can view their own payment_receipts"
ON payment_receipts
FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT id FROM clients
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Clients can upload their own payment_receipts"
ON payment_receipts
FOR INSERT
TO authenticated
WITH CHECK (
  client_id IN (
    SELECT id FROM clients
    WHERE user_id = auth.uid()
  )
);
*/

-- ================================================
-- COMENTARIOS EN LA TABLA
-- ================================================

COMMENT ON TABLE payment_receipts IS 'Almacena los recibos de pago cargados por clientes o asesores';
COMMENT ON COLUMN payment_receipts.status IS 'pending: pendiente de verificación, verified: verificado, rejected: rechazado';
COMMENT ON COLUMN payment_receipts.file_path IS 'Ruta completa en Supabase Storage bucket';
COMMENT ON COLUMN payment_receipts.schedule_id IS 'Referencia al pago programado asociado (opcional)';
COMMENT ON COLUMN payment_receipts.verified_by IS 'Asesor que verificó el recibo';

-- ================================================
-- AGREGAR FK A PAYMENT_SCHEDULES (después de crear ambas tablas)
-- ================================================
-- Ejecutar este comando DESPUÉS de crear ambas tablas:
--
-- ALTER TABLE payment_schedules
-- ADD CONSTRAINT fk_payment_schedules_receipt
-- FOREIGN KEY (receipt_id) 
-- REFERENCES payment_receipts(id) 
-- ON DELETE SET NULL;
