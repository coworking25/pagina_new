-- ================================================
-- AGREGAR FOREIGN KEY: receipt_id en payment_schedules
-- Descripción: Se ejecuta DESPUÉS de crear ambas tablas
-- Fecha: Diciembre 17, 2025
-- ================================================

-- Este script resuelve la referencia circular entre:
-- payment_schedules.receipt_id → payment_receipts.id
-- payment_receipts.schedule_id → payment_schedules.id

-- ================================================
-- AGREGAR CONSTRAINT
-- ================================================

ALTER TABLE payment_schedules
ADD CONSTRAINT fk_payment_schedules_receipt
FOREIGN KEY (receipt_id) 
REFERENCES payment_receipts(id) 
ON DELETE SET NULL;

-- ================================================
-- VERIFICACIÓN
-- ================================================

-- Verificar que el constraint se creó correctamente
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'payment_schedules'
  AND tc.constraint_name = 'fk_payment_schedules_receipt';

-- Resultado esperado:
-- constraint_name                  | table_name         | column_name | foreign_table_name | foreign_column_name
-- ---------------------------------|--------------------|-------------|--------------------|-----------------
-- fk_payment_schedules_receipt     | payment_schedules  | receipt_id  | payment_receipts   | id

-- ================================================
-- COMENTARIO
-- ================================================

COMMENT ON CONSTRAINT fk_payment_schedules_receipt ON payment_schedules 
IS 'Referencia al recibo de pago que comprueba el pago programado';
