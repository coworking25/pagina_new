-- =====================================================
-- CORRECCIÓN: get_client_dashboard_summary
-- =====================================================
-- Esta función reemplaza la anterior para devolver JSON
-- con todos los campos que necesita el ClientDashboard
-- =====================================================

CREATE OR REPLACE FUNCTION get_client_dashboard_summary(
  p_client_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_client_name TEXT;
  v_active_contracts INTEGER;
  v_pending_payments INTEGER;
  v_overdue_payments INTEGER;
  v_next_payment_date DATE;
  v_next_payment_amount NUMERIC;
  v_total_paid_this_month NUMERIC;
  v_total_paid_this_year NUMERIC;
  v_recent_payments JSON;
  v_upcoming_payments JSON;
BEGIN
  -- Obtener nombre completo del cliente
  SELECT full_name INTO v_client_name
  FROM clients
  WHERE id = p_client_id;

  -- Contratos activos
  SELECT COUNT(*)::INTEGER INTO v_active_contracts
  FROM contracts 
  WHERE client_id = p_client_id AND status = 'active';

  -- Pagos pendientes (de payment_schedules o client_payments)
  SELECT COUNT(*)::INTEGER INTO v_pending_payments
  FROM payment_schedules
  WHERE client_id = p_client_id 
    AND payment_status IN ('pending', 'partial');

  -- Pagos vencidos (de payment_schedules)
  SELECT COUNT(*)::INTEGER INTO v_overdue_payments
  FROM payment_schedules
  WHERE client_id = p_client_id 
    AND payment_status IN ('pending', 'partial', 'overdue')
    AND due_date < CURRENT_DATE;

  -- Próximo pago: fecha y monto
  SELECT due_date, amount_due 
  INTO v_next_payment_date, v_next_payment_amount
  FROM payment_schedules
  WHERE client_id = p_client_id 
    AND payment_status IN ('pending', 'partial')
  ORDER BY due_date ASC
  LIMIT 1;

  -- Total pagado este mes (desde client_payments)
  SELECT COALESCE(SUM(amount), 0) INTO v_total_paid_this_month
  FROM client_payments
  WHERE client_id = p_client_id 
    AND payment_status = 'completed'
    AND EXTRACT(YEAR FROM payment_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    AND EXTRACT(MONTH FROM payment_date) = EXTRACT(MONTH FROM CURRENT_DATE);

  -- Total pagado este año (desde client_payments)
  SELECT COALESCE(SUM(amount), 0) INTO v_total_paid_this_year
  FROM client_payments
  WHERE client_id = p_client_id 
    AND payment_status = 'completed'
    AND EXTRACT(YEAR FROM payment_date) = EXTRACT(YEAR FROM CURRENT_DATE);

  -- Pagos recientes (últimos 5 pagados desde client_payments)
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'id', id,
        'contract_id', contract_id,
        'property_id', property_id,
        'amount', amount,
        'amount_paid', amount,
        'payment_type', payment_type,
        'payment_date', payment_date,
        'due_date', due_date,
        'status', 'paid',
        'payment_method', payment_method,
        'reference_number', reference_number,
        'notes', notes
      )
    ),
    '[]'::json
  ) INTO v_recent_payments
  FROM (
    SELECT *
    FROM client_payments
    WHERE client_id = p_client_id 
      AND payment_status = 'completed'
    ORDER BY payment_date DESC
    LIMIT 5
  ) recent;

  -- Próximos pagos (próximos 5 pendientes desde payment_schedules)
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'id', id,
        'contract_id', contract_id,
        'property_id', property_id,
        'amount', amount_due,
        'amount_paid', COALESCE(amount_paid, 0),
        'payment_type', payment_type,
        'due_date', due_date,
        'status', CASE 
          WHEN due_date < CURRENT_DATE THEN 'overdue'
          WHEN payment_status = 'partial' THEN 'partial'
          ELSE 'pending'
        END,
        'notes', notes
      ) ORDER BY due_date ASC
    ),
    '[]'::json
  ) INTO v_upcoming_payments
  FROM payment_schedules
  WHERE client_id = p_client_id 
    AND payment_status IN ('pending', 'partial', 'overdue')
  LIMIT 5;

  -- Construir y devolver JSON
  RETURN json_build_object(
    'client_id', p_client_id,
    'full_name', COALESCE(v_client_name, 'Cliente'),
    'active_contracts_count', COALESCE(v_active_contracts, 0),
    'pending_payments_count', COALESCE(v_pending_payments, 0),
    'overdue_payments_count', COALESCE(v_overdue_payments, 0),
    'next_payment_due_date', v_next_payment_date,
    'next_payment_amount', COALESCE(v_next_payment_amount, 0),
    'total_paid_this_month', COALESCE(v_total_paid_this_month, 0),
    'total_paid_this_year', COALESCE(v_total_paid_this_year, 0),
    'recent_payments', v_recent_payments,
    'upcoming_payments', v_upcoming_payments
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION get_client_dashboard_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_client_dashboard_summary(UUID) TO anon;

-- =====================================================
-- TESTING
-- =====================================================

-- Probar con cliente de prueba:
-- SELECT get_client_dashboard_summary('11111111-1111-1111-1111-111111111111');
