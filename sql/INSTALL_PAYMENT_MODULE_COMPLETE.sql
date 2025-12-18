-- =====================================================
-- MÓDULO DE GESTIÓN DE PAGOS - INSTALACIÓN COMPLETA
-- Ejecutar en Supabase SQL Editor
-- Fecha: Diciembre 17, 2025
-- =====================================================

-- NOTA IMPORTANTE: Este script está optimizado para la estructura actual
-- de tu base de datos donde:
-- - properties.id es BIGINT
-- - advisors.id es UUID (verificación de permisos con auth.uid())
-- - clients no tiene user_id (portal de clientes no implementado aún)

-- =====================================================
-- PASO 1: CREAR TABLA payment_schedules
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_schedules (
  -- Identificadores
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  property_id BIGINT REFERENCES properties(id) ON DELETE SET NULL,
  
  -- Información del pago
  payment_concept VARCHAR(100) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'COP' NOT NULL,
  
  -- Fechas
  due_date DATE NOT NULL,
  payment_date DATE,
  
  -- Estado del pago
  status VARCHAR(20) DEFAULT 'pending' NOT NULL 
    CHECK (status IN ('pending', 'paid', 'partial', 'overdue', 'cancelled')),
  
  -- Información adicional
  notes TEXT,
  payment_method VARCHAR(50),
  
  -- Relación con recibo (FK se agregará después)
  receipt_id UUID,
  
  -- Información de pago parcial
  paid_amount DECIMAL(12, 2) DEFAULT 0 CHECK (paid_amount >= 0),
  remaining_amount DECIMAL(12, 2) GENERATED ALWAYS AS (amount - paid_amount) STORED,
  
  -- Recurrencia
  is_recurring BOOLEAN DEFAULT false,
  recurrence_frequency VARCHAR(20),
  parent_schedule_id UUID REFERENCES payment_schedules(id) ON DELETE SET NULL,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES advisors(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES advisors(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX idx_payment_schedules_client_id ON payment_schedules(client_id);
CREATE INDEX idx_payment_schedules_property_id ON payment_schedules(property_id) WHERE property_id IS NOT NULL;
CREATE INDEX idx_payment_schedules_due_date ON payment_schedules(due_date DESC);
CREATE INDEX idx_payment_schedules_pending ON payment_schedules(status, due_date) WHERE status IN ('pending', 'partial', 'overdue');
CREATE INDEX idx_payment_schedules_overdue ON payment_schedules(client_id, due_date) WHERE status = 'overdue';
CREATE INDEX idx_payment_schedules_calendar ON payment_schedules(due_date, client_id, status);
CREATE INDEX idx_payment_schedules_recurring ON payment_schedules(parent_schedule_id) WHERE parent_schedule_id IS NOT NULL;

-- Trigger para updated_at
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

-- Función para marcar pagos vencidos
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

-- RLS
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on payment_schedules"
ON payment_schedules FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

CREATE POLICY "Advisors can view their clients payment_schedules"
ON payment_schedules FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = payment_schedules.client_id
    AND clients.assigned_advisor_id = auth.uid()
  )
);

CREATE POLICY "Advisors can update their clients payment_schedules"
ON payment_schedules FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = payment_schedules.client_id
    AND clients.assigned_advisor_id = auth.uid()
  )
);

CREATE POLICY "Advisors can insert payment_schedules for their clients"
ON payment_schedules FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = payment_schedules.client_id
    AND clients.assigned_advisor_id = auth.uid()
  )
);

-- =====================================================
-- PASO 2: CREAR TABLA payment_receipts
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_receipts (
  -- Identificadores
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES payment_schedules(id) ON DELETE SET NULL,
  
  -- Información del archivo
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  
  -- Información del pago
  payment_amount DECIMAL(12, 2) NOT NULL CHECK (payment_amount > 0),
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(100),
  
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

-- Índices
CREATE INDEX idx_payment_receipts_client_id ON payment_receipts(client_id);
CREATE INDEX idx_payment_receipts_schedule_id ON payment_receipts(schedule_id) WHERE schedule_id IS NOT NULL;
CREATE INDEX idx_payment_receipts_payment_date ON payment_receipts(payment_date DESC);
CREATE INDEX idx_payment_receipts_pending ON payment_receipts(status, uploaded_at) WHERE status = 'pending';
CREATE INDEX idx_payment_receipts_uploaded_at ON payment_receipts(uploaded_at DESC);
CREATE INDEX idx_payment_receipts_client_history ON payment_receipts(client_id, payment_date DESC, status);

-- Trigger para updated_at
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

-- Trigger para actualizar payment_schedule al verificar recibo
CREATE OR REPLACE FUNCTION update_schedule_on_receipt_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'verified' AND NEW.schedule_id IS NOT NULL AND OLD.status != 'verified' THEN
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
  
  IF NEW.status = 'rejected' AND NEW.schedule_id IS NOT NULL AND OLD.status = 'verified' THEN
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

-- RLS
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on payment_receipts"
ON payment_receipts FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

CREATE POLICY "Advisors can view their clients payment_receipts"
ON payment_receipts FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = payment_receipts.client_id
    AND clients.assigned_advisor_id = auth.uid()
  )
);

CREATE POLICY "Advisors can insert payment_receipts for their clients"
ON payment_receipts FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = payment_receipts.client_id
    AND clients.assigned_advisor_id = auth.uid()
  )
);

CREATE POLICY "Advisors can update their clients payment_receipts"
ON payment_receipts FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = payment_receipts.client_id
    AND clients.assigned_advisor_id = auth.uid()
  )
);

CREATE POLICY "Advisors can delete their clients payment_receipts"
ON payment_receipts FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = payment_receipts.client_id
    AND clients.assigned_advisor_id = auth.uid()
  )
);

-- =====================================================
-- PASO 3: AGREGAR FK receipt_id a payment_schedules
-- =====================================================

ALTER TABLE payment_schedules
ADD CONSTRAINT fk_payment_schedules_receipt
FOREIGN KEY (receipt_id) 
REFERENCES payment_receipts(id) 
ON DELETE SET NULL;

-- =====================================================
-- PASO 4: ACTUALIZAR payments (si existe)
-- =====================================================

-- NOTA: La tabla real se llama "payments" (no "client_payments")
DO $$ 
DECLARE
  has_due_date BOOLEAN;
BEGIN
  -- Verificar si existe la tabla payments
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payments') THEN
    
    -- Verificar si tiene columna due_date
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'payments' AND column_name = 'due_date'
    ) INTO has_due_date;
    
    -- Agregar columnas si no existen
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'paid_amount') THEN
      ALTER TABLE payments ADD COLUMN paid_amount DECIMAL(12, 2) DEFAULT 0 CHECK (paid_amount >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'remaining_amount') THEN
      ALTER TABLE payments ADD COLUMN remaining_amount DECIMAL(12, 2) GENERATED ALWAYS AS (amount - COALESCE(amount_paid, 0) - paid_amount) STORED;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'receipt_id') THEN
      ALTER TABLE payments ADD COLUMN receipt_id UUID REFERENCES payment_receipts(id) ON DELETE SET NULL;
    END IF;
    
    -- Crear índices solo si existe due_date
    IF has_due_date THEN
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status, due_date);
      CREATE INDEX IF NOT EXISTS idx_payments_overdue ON payments(client_id, due_date) WHERE status = 'overdue';
    END IF;
    
    CREATE INDEX IF NOT EXISTS idx_payments_receipt_id ON payments(receipt_id) WHERE receipt_id IS NOT NULL;
    
    RAISE NOTICE '✅ Tabla payments actualizada';
  END IF;
  
  -- Verificar si existe la tabla client_payments (alternativa)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'client_payments') THEN
    
    -- Agregar solo receipt_id si no existe
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'client_payments' AND column_name = 'receipt_id') THEN
      ALTER TABLE client_payments ADD COLUMN receipt_id UUID REFERENCES payment_receipts(id) ON DELETE SET NULL;
    END IF;
    
    CREATE INDEX IF NOT EXISTS idx_client_payments_receipt_id ON client_payments(receipt_id) WHERE receipt_id IS NOT NULL;
    
    RAISE NOTICE '✅ Tabla client_payments actualizada';
  END IF;
  
  -- Si ninguna existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('payments', 'client_payments')) THEN
    RAISE NOTICE 'ℹ️  No se encontró tabla payments ni client_payments (opcional)';
  END IF;
END $$;

-- =====================================================
-- ✅ INSTALACIÓN COMPLETADA
-- =====================================================

-- Resumen
SELECT 
  '✅ payment_schedules' as tabla,
  COUNT(*) as registros
FROM payment_schedules
UNION ALL
SELECT 
  '✅ payment_receipts',
  COUNT(*)
FROM payment_receipts;
