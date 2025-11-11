-- ============================================
-- VER DETALLES DE LOS PAGOS DEL CLIENTE
-- Cliente: Juan Pérez (f183c02b-4a97-4ad3-9e45-2bb9500f3024)
-- ============================================

SELECT 
  p.id,
  p.contract_id,
  p.payment_type,
  p.amount,
  p.amount_paid,
  p.status,
  p.due_date,
  p.payment_date,
  p.payment_method,
  p.transaction_reference,
  p.late_fee_applied,
  p.notes,
  c.contract_number
FROM payments p
JOIN contracts c ON c.id = p.contract_id
WHERE c.client_id = 'f183c02b-4a97-4ad3-9e45-2bb9500f3024'
ORDER BY p.due_date DESC;
