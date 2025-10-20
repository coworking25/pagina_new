-- =====================================================
-- FASE 1.2: EXTENDER TABLA PAYMENTS
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Fecha: 15 Octubre 2025

-- Agregar campos para rastrear flujo de pagos entre:
-- 1. Cliente → Empresa (arrendatario paga arriendo)
-- 2. Empresa → Propietario (empresa paga al dueño)
-- 3. Cliente → Servicios (cliente paga servicios)

-- 1. AGREGAR NUEVAS COLUMNAS a payments
ALTER TABLE payments 
  ADD COLUMN IF NOT EXISTS recipient_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS payment_direction VARCHAR(20),
  ADD COLUMN IF NOT EXISTS beneficiary_id UUID REFERENCES clients(id),
  ADD COLUMN IF NOT EXISTS payment_category VARCHAR(50),
  ADD COLUMN IF NOT EXISTS receipt_url TEXT,
  ADD COLUMN IF NOT EXISTS paid_by_admin UUID REFERENCES advisors(id);

-- 2. AGREGAR COMENTARIOS
COMMENT ON COLUMN payments.recipient_type IS 'Tipo de receptor: tenant_to_company, company_to_landlord, tenant_to_services';
COMMENT ON COLUMN payments.payment_direction IS 'Dirección del pago: incoming (recibido), outgoing (pagado)';
COMMENT ON COLUMN payments.beneficiary_id IS 'ID del cliente beneficiario (propietario que recibe pago)';
COMMENT ON COLUMN payments.payment_category IS 'Categoría: arriendo, servicios, comisión, mantenimiento';
COMMENT ON COLUMN payments.receipt_url IS 'URL del recibo/comprobante de pago en storage';
COMMENT ON COLUMN payments.paid_by_admin IS 'Administrador que procesó el pago';

-- 3. AGREGAR CONSTRAINTS
ALTER TABLE payments
  ADD CONSTRAINT payments_recipient_type_check 
  CHECK (recipient_type IN (
    'tenant_to_company',      -- Cliente paga a la empresa
    'company_to_landlord',    -- Empresa paga a propietario
    'tenant_to_services',     -- Cliente paga servicios
    'landlord_to_company',    -- Propietario paga comisión
    'company_to_tenant'       -- Empresa devuelve depósito
  ));

ALTER TABLE payments
  ADD CONSTRAINT payments_direction_check 
  CHECK (payment_direction IN ('incoming', 'outgoing'));

ALTER TABLE payments
  ADD CONSTRAINT payments_category_check 
  CHECK (payment_category IN (
    'rent',              -- Arriendo
    'deposit',           -- Depósito
    'administration',    -- Administración
    'utilities',         -- Servicios públicos
    'commission',        -- Comisión
    'maintenance',       -- Mantenimiento
    'late_fee',          -- Mora
    'insurance',         -- Seguro
    'other'              -- Otro
  ));

-- 4. CREAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_payments_recipient_type ON payments(recipient_type);
CREATE INDEX IF NOT EXISTS idx_payments_direction ON payments(payment_direction);
CREATE INDEX IF NOT EXISTS idx_payments_beneficiary ON payments(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_payments_category ON payments(payment_category);

-- 5. ACTUALIZAR REGISTROS EXISTENTES (si hay)
-- Marcar pagos existentes como "incoming" por defecto
UPDATE payments 
SET payment_direction = 'incoming',
    recipient_type = 'tenant_to_company'
WHERE payment_direction IS NULL;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'payments'
  AND column_name IN ('recipient_type', 'payment_direction', 'beneficiary_id', 'payment_category')
ORDER BY ordinal_position;

-- ✅ Script completado
-- Siguiente paso: 03_row_level_security.sql
