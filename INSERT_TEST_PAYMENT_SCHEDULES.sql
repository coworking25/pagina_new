-- =====================================================
-- SCRIPT: INSERTAR DATOS DE PRUEBA PAYMENT_SCHEDULES
-- Fecha: 2026-01-14
-- Propósito: Crear pagos de prueba para calendario
-- =====================================================

-- 1. Verificar que existe el cliente
SELECT id, full_name, email 
FROM clients 
WHERE id = '331a25ea-5f6c-4aa1-84d6-86d744c0c38e';

-- 2. Verificar propiedades disponibles
SELECT id, code, title 
FROM properties 
LIMIT 5;

-- 3. Insertar pagos de prueba para ENERO 2026
INSERT INTO payment_schedules (
  client_id,
  property_id,
  payment_concept,
  amount,
  currency,
  due_date,
  payment_date,
  status,
  paid_amount,
  payment_method,
  notes
) VALUES
-- Pago vencido (no pagado)
(
  '331a25ea-5f6c-4aa1-84d6-86d744c0c38e',
  NULL,
  'Renta Enero 2026',
  1500000,
  'COP',
  '2026-01-05',
  NULL,
  'overdue',
  0,
  NULL,
  'Pago de renta mensual - VENCIDO'
),
-- Pago pendiente (próximo)
(
  '331a25ea-5f6c-4aa1-84d6-86d744c0c38e',
  NULL,
  'Administración Enero 2026',
  200000,
  'COP',
  '2026-01-15',
  NULL,
  'pending',
  0,
  NULL,
  'Cuota de administración'
),
-- Pago pagado (a tiempo)
(
  '331a25ea-5f6c-4aa1-84d6-86d744c0c38e',
  NULL,
  'Servicios Diciembre 2025',
  150000,
  'COP',
  '2025-12-10',
  '2025-12-10',
  'paid',
  150000,
  'transferencia',
  'Pago de servicios - Pagado a tiempo'
),
-- Pago pagado (con retraso)
(
  '331a25ea-5f6c-4aa1-84d6-86d744c0c38e',
  NULL,
  'Mantenimiento Diciembre 2025',
  100000,
  'COP',
  '2025-12-20',
  '2025-12-25',
  'paid',
  100000,
  'efectivo',
  'Pago de mantenimiento - Pagado con 5 días de retraso'
),
-- Pago pagado (anticipado)
(
  '331a25ea-5f6c-4aa1-84d6-86d744c0c38e',
  NULL,
  'Renta Febrero 2026',
  1500000,
  'COP',
  '2026-02-05',
  '2026-01-28',
  'paid',
  1500000,
  'transferencia',
  'Pago de renta - Pagado anticipadamente'
);

-- 4. INSERTAR MÁS PAGOS PARA FEBRERO 2026
INSERT INTO payment_schedules (
  client_id,
  payment_concept,
  amount,
  currency,
  due_date,
  status,
  paid_amount,
  notes
) VALUES
(
  '331a25ea-5f6c-4aa1-84d6-86d744c0c38e',
  'Administración Febrero 2026',
  200000,
  'COP',
  '2026-02-15',
  'pending',
  0,
  'Cuota de administración mensual'
),
(
  '331a25ea-5f6c-4aa1-84d6-86d744c0c38e',
  'Servicios Enero 2026',
  150000,
  'COP',
  '2026-01-25',
  'pending',
  0,
  'Pago de servicios públicos'
);

-- 5. Verificar pagos insertados
SELECT 
  id,
  payment_concept,
  amount,
  due_date,
  payment_date,
  status,
  CASE 
    WHEN payment_date IS NOT NULL AND status = 'paid' THEN
      EXTRACT(DAY FROM (payment_date::date - due_date::date))
    WHEN status = 'overdue' THEN
      EXTRACT(DAY FROM (CURRENT_DATE - due_date::date))
    ELSE 0
  END as days_diff,
  created_at
FROM payment_schedules
WHERE client_id = '331a25ea-5f6c-4aa1-84d6-86d744c0c38e'
ORDER BY due_date DESC
LIMIT 10;

-- 6. Actualizar estados automáticamente
UPDATE payment_schedules
SET status = 'overdue'
WHERE client_id = '331a25ea-5f6c-4aa1-84d6-86d744c0c38e'
  AND status = 'pending'
  AND due_date < CURRENT_DATE;

-- 7. Resumen por mes
SELECT 
  TO_CHAR(due_date, 'YYYY-MM') as mes,
  COUNT(*) as total_pagos,
  SUM(amount) as total_monto,
  SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as pagados,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendientes,
  SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as vencidos
FROM payment_schedules
WHERE client_id = '331a25ea-5f6c-4aa1-84d6-86d744c0c38e'
GROUP BY TO_CHAR(due_date, 'YYYY-MM')
ORDER BY mes DESC;

-- 8. Mensaje final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ========================================';
    RAISE NOTICE '✅ DATOS DE PRUEBA INSERTADOS';
    RAISE NOTICE '✅ ========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Se insertaron pagos de prueba para:';
    RAISE NOTICE '  • Enero 2026 (varios pagos)';
    RAISE NOTICE '  • Febrero 2026 (varios pagos)';
    RAISE NOTICE '  • Diciembre 2025 (pagos históricos)';
    RAISE NOTICE '';
    RAISE NOTICE 'Estados incluidos:';
    RAISE NOTICE '  ✓ Pagado a tiempo';
    RAISE NOTICE '  ✓ Pagado con retraso';
    RAISE NOTICE '  ✓ Pagado anticipadamente';
    RAISE NOTICE '  ✓ Pendiente';
    RAISE NOTICE '  ✓ Vencido';
    RAISE NOTICE '';
END $$;
