-- =====================================================
-- VERIFICAR DATOS DE PAGOS EN PRODUCCIÓN
-- =====================================================

-- 1. Ver todos los pagos del cliente Carlos
SELECT 
  id,
  client_id,
  payment_concept,
  amount,
  due_date,
  status,
  property_id,
  created_at
FROM payment_schedules
WHERE client_id = '11111111-1111-1111-1111-111111111111'
ORDER BY due_date;

-- 2. Verificar formato de fechas
SELECT 
  id,
  payment_concept,
  due_date,
  DATE(due_date) as fecha_limpia,
  EXTRACT(YEAR FROM due_date) as año,
  EXTRACT(MONTH FROM due_date) as mes,
  EXTRACT(DAY FROM due_date) as dia,
  status
FROM payment_schedules
WHERE client_id = '11111111-1111-1111-1111-111111111111';

-- 3. Contar pagos por mes
SELECT 
  EXTRACT(YEAR FROM due_date) as año,
  EXTRACT(MONTH FROM due_date) as mes,
  COUNT(*) as total_pagos,
  SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as pagados,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendientes,
  SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as vencidos
FROM payment_schedules
WHERE client_id = '11111111-1111-1111-1111-111111111111'
GROUP BY año, mes
ORDER BY año, mes;

-- 4. Ver pagos de diciembre 2025 específicamente
SELECT 
  id,
  payment_concept,
  amount,
  due_date,
  status,
  TO_CHAR(due_date, 'YYYY-MM-DD') as fecha_formato
FROM payment_schedules
WHERE client_id = '11111111-1111-1111-1111-111111111111'
  AND EXTRACT(YEAR FROM due_date) = 2025
  AND EXTRACT(MONTH FROM due_date) = 12;

-- 5. Si no hay pagos, crear pagos de prueba
-- Ejecuta esto SOLO si no hay pagos
INSERT INTO payment_schedules (
  client_id,
  payment_concept,
  amount,
  due_date,
  status,
  notes
) VALUES 
  -- Pagos de Diciembre 2025
  (
    '11111111-1111-1111-1111-111111111111',
    'Renta Diciembre 2025',
    8500000,
    '2025-12-05',
    'pending',
    'Pago mensual de renta'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Cuota Mantenimiento Dic',
    500000,
    '2025-12-15',
    'overdue',
    'Mantenimiento edificio'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Servicios Públicos',
    300000,
    '2025-12-20',
    'pending',
    'Agua, luz, gas'
  ),
  -- Pagos de Enero 2026
  (
    '11111111-1111-1111-1111-111111111111',
    'Renta Enero 2026',
    8500000,
    '2026-01-05',
    'pending',
    'Pago mensual de renta'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Cuota Mantenimiento Ene',
    500000,
    '2026-01-15',
    'pending',
    'Mantenimiento edificio'
  ),
  -- Pagos de Febrero 2026
  (
    '11111111-1111-1111-1111-111111111111',
    'Renta Febrero 2026',
    8500000,
    '2026-02-05',
    'pending',
    'Pago mensual de renta'
  )
RETURNING id, payment_concept, due_date, status;
