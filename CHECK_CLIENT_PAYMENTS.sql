-- ============================================
-- VERIFICAR PAGOS DEL CLIENTE DE PRUEBA
-- Cliente: Juan Pérez (f183c02b-4a97-4ad3-9e45-2bb9500f3024)
-- ============================================

-- 1. Verificar contratos del cliente
SELECT 
  id,
  contract_number,
  property_id,
  client_id,
  status,
  start_date,
  end_date
FROM contracts
WHERE client_id = 'f183c02b-4a97-4ad3-9e45-2bb9500f3024';

-- 2. Verificar pagos asociados a esos contratos
SELECT 
  p.id,
  p.contract_id,
  p.payment_type,
  p.amount,
  p.amount_paid,
  p.status,
  p.due_date,
  p.payment_date,
  c.contract_number,
  c.client_id
FROM payments p
JOIN contracts c ON c.id = p.contract_id
WHERE c.client_id = 'f183c02b-4a97-4ad3-9e45-2bb9500f3024'
ORDER BY p.due_date DESC
LIMIT 20;

-- 3. Contar pagos por estado
SELECT 
  p.status,
  COUNT(*) as total
FROM payments p
JOIN contracts c ON c.id = p.contract_id
WHERE c.client_id = 'f183c02b-4a97-4ad3-9e45-2bb9500f3024'
GROUP BY p.status;
