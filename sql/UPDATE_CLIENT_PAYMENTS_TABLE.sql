-- ================================================
-- ACTUALIZACIÓN: client_payments
-- Descripción: Agregar columnas necesarias para la gestión de pagos
-- Fecha: Diciembre 17, 2025
-- ================================================

-- Verificar si la tabla existe
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'client_payments') THEN
    RAISE EXCEPTION 'La tabla client_payments no existe. Debe crearse primero.';
  END IF;
END $$;

-- ================================================
-- AGREGAR NUEVAS COLUMNAS
-- ================================================

-- Agregar columna para monto pagado (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'client_payments' AND column_name = 'paid_amount'
  ) THEN
    ALTER TABLE client_payments 
    ADD COLUMN paid_amount DECIMAL(12, 2) DEFAULT 0 CHECK (paid_amount >= 0);
  END IF;
END $$;

-- Agregar columna para monto pendiente calculado (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'client_payments' AND column_name = 'remaining_amount'
  ) THEN
    ALTER TABLE client_payments 
    ADD COLUMN remaining_amount DECIMAL(12, 2) GENERATED ALWAYS AS (amount - paid_amount) STORED;
  END IF;
END $$;

-- Agregar columna para fecha de pago real (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'client_payments' AND column_name = 'payment_date'
  ) THEN
    ALTER TABLE client_payments 
    ADD COLUMN payment_date DATE;
  END IF;
END $$;

-- Agregar columna para método de pago (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'client_payments' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE client_payments 
    ADD COLUMN payment_method VARCHAR(50);
  END IF;
END $$;

-- Agregar columna para referencia del recibo (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'client_payments' AND column_name = 'receipt_id'
  ) THEN
    ALTER TABLE client_payments 
    ADD COLUMN receipt_id UUID REFERENCES payment_receipts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Agregar columna para estado del pago (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'client_payments' AND column_name = 'status'
  ) THEN
    ALTER TABLE client_payments 
    ADD COLUMN status VARCHAR(20) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'paid', 'partial', 'overdue', 'cancelled'));
  END IF;
END $$;

-- Agregar columna para notas adicionales (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'client_payments' AND column_name = 'notes'
  ) THEN
    ALTER TABLE client_payments 
    ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Agregar columna para ID del asesor que creó (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'client_payments' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE client_payments 
    ADD COLUMN created_by UUID REFERENCES advisors(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Agregar columna para ID del asesor que actualizó (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'client_payments' AND column_name = 'updated_by'
  ) THEN
    ALTER TABLE client_payments 
    ADD COLUMN updated_by UUID REFERENCES advisors(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ================================================
-- ACTUALIZAR ÍNDICES
-- ================================================

-- Índice para búsquedas por estado
CREATE INDEX IF NOT EXISTS idx_client_payments_status 
ON client_payments(status, due_date);

-- Índice para pagos vencidos
CREATE INDEX IF NOT EXISTS idx_client_payments_overdue 
ON client_payments(client_id, due_date) 
WHERE status = 'overdue';

-- Índice para búsquedas por recibo
CREATE INDEX IF NOT EXISTS idx_client_payments_receipt_id 
ON client_payments(receipt_id) 
WHERE receipt_id IS NOT NULL;

-- ================================================
-- TRIGGER PARA ACTUALIZAR ESTADO A OVERDUE
-- ================================================

CREATE OR REPLACE FUNCTION update_overdue_client_payments()
RETURNS void AS $$
BEGIN
  UPDATE client_payments
  SET status = 'overdue'
  WHERE status = 'pending'
    AND due_date < CURRENT_DATE
    AND payment_date IS NULL;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- FUNCIÓN PARA SINCRONIZAR CON PAYMENT_SCHEDULES
-- ================================================

CREATE OR REPLACE FUNCTION sync_payment_to_schedule()
RETURNS TRIGGER AS $$
DECLARE
  schedule_exists BOOLEAN;
BEGIN
  -- Verificar si ya existe un schedule para este pago
  SELECT EXISTS(
    SELECT 1 FROM payment_schedules 
    WHERE client_id = NEW.client_id 
    AND due_date = NEW.due_date
    AND payment_concept = NEW.payment_concept
  ) INTO schedule_exists;
  
  -- Si no existe, crear uno nuevo
  IF NOT schedule_exists THEN
    INSERT INTO payment_schedules (
      client_id,
      property_id,
      payment_concept,
      amount,
      due_date,
      payment_date,
      status,
      notes,
      payment_method,
      paid_amount,
      created_by,
      updated_by
    ) VALUES (
      NEW.client_id,
      NULL, -- Se puede agregar property_id si client_payments lo tiene
      NEW.payment_concept,
      NEW.amount,
      NEW.due_date,
      NEW.payment_date,
      NEW.status,
      NEW.notes,
      NEW.payment_method,
      NEW.paid_amount,
      NEW.created_by,
      NEW.updated_by
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comentario: Descomentar si se desea sincronización automática
-- CREATE TRIGGER trg_sync_payment_to_schedule
--   AFTER INSERT ON client_payments
--   FOR EACH ROW
--   EXECUTE FUNCTION sync_payment_to_schedule();

-- ================================================
-- COMENTARIOS
-- ================================================

COMMENT ON COLUMN client_payments.paid_amount IS 'Monto que ha sido pagado hasta el momento';
COMMENT ON COLUMN client_payments.remaining_amount IS 'Monto pendiente por pagar (calculado automáticamente)';
COMMENT ON COLUMN client_payments.payment_date IS 'Fecha en que se realizó el pago (NULL si no se ha pagado)';
COMMENT ON COLUMN client_payments.receipt_id IS 'Referencia al recibo de pago asociado';
COMMENT ON COLUMN client_payments.status IS 'pending: pendiente, paid: pagado, partial: pago parcial, overdue: vencido, cancelled: cancelado';

-- ================================================
-- ACTUALIZAR DATOS EXISTENTES (MIGRACIÓN)
-- ================================================

-- Establecer paid_amount = amount para pagos marcados como pagados
UPDATE client_payments
SET paid_amount = amount,
    status = 'paid'
WHERE payment_date IS NOT NULL
  AND paid_amount = 0;

-- Marcar como vencidos los pagos pendientes con fecha pasada
UPDATE client_payments
SET status = 'overdue'
WHERE status = 'pending'
  AND due_date < CURRENT_DATE
  AND payment_date IS NULL;

-- ================================================
-- VERIFICACIÓN
-- ================================================

-- Mostrar resumen de la migración
DO $$ 
DECLARE
  pending_count INTEGER;
  paid_count INTEGER;
  overdue_count INTEGER;
  partial_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO pending_count FROM client_payments WHERE status = 'pending';
  SELECT COUNT(*) INTO paid_count FROM client_payments WHERE status = 'paid';
  SELECT COUNT(*) INTO overdue_count FROM client_payments WHERE status = 'overdue';
  SELECT COUNT(*) INTO partial_count FROM client_payments WHERE status = 'partial';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RESUMEN DE MIGRACIÓN - client_payments';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Pagos pendientes: %', pending_count;
  RAISE NOTICE 'Pagos completados: %', paid_count;
  RAISE NOTICE 'Pagos vencidos: %', overdue_count;
  RAISE NOTICE 'Pagos parciales: %', partial_count;
  RAISE NOTICE '========================================';
END $$;
