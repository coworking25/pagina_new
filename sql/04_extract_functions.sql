-- =====================================================
-- FASE 1.4: FUNCIONES SQL PARA EXTRACTOS Y REPORTES
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Fecha: 15 Octubre 2025

-- =====================================================
-- 1. FUNCIÓN: Generar Extracto Mensual de Pagos
-- =====================================================

CREATE OR REPLACE FUNCTION generate_monthly_extract(
  p_client_id UUID,
  p_contract_id UUID,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS TABLE(
  payment_id UUID,
  payment_date DATE,
  payment_type VARCHAR,
  description TEXT,
  amount NUMERIC,
  status VARCHAR,
  payment_method VARCHAR,
  transaction_reference VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.payment_date,
    p.payment_type,
    CASE 
      WHEN p.payment_type = 'rent' THEN 'Arriendo ' || TO_CHAR(p.period_start, 'Month YYYY')
      WHEN p.payment_type = 'administration' THEN 'Administración ' || TO_CHAR(p.period_start, 'Month YYYY')
      WHEN p.payment_type = 'utilities' THEN 'Servicios Públicos'
      WHEN p.payment_type = 'deposit' THEN 'Depósito'
      ELSE p.notes
    END as description,
    p.amount,
    p.status,
    p.payment_method,
    p.transaction_reference
  FROM payments p
  WHERE p.client_id = p_client_id
    AND p.contract_id = p_contract_id
    AND EXTRACT(YEAR FROM p.due_date) = p_year
    AND EXTRACT(MONTH FROM p.due_date) = p_month
  ORDER BY p.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. FUNCIÓN: Generar Resumen Anual de Pagos
-- =====================================================

CREATE OR REPLACE FUNCTION generate_annual_summary(
  p_client_id UUID,
  p_contract_id UUID,
  p_year INTEGER
)
RETURNS TABLE(
  month INTEGER,
  month_name TEXT,
  total_due NUMERIC,
  total_paid NUMERIC,
  total_pending NUMERIC,
  payment_count INTEGER,
  paid_on_time_count INTEGER,
  late_payments_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(MONTH FROM p.due_date)::INTEGER as month,
    TO_CHAR(p.due_date, 'Month') as month_name,
    SUM(p.amount) as total_due,
    SUM(CASE WHEN p.status = 'paid' THEN p.amount_paid ELSE 0 END) as total_paid,
    SUM(CASE WHEN p.status IN ('pending', 'overdue') THEN p.amount ELSE 0 END) as total_pending,
    COUNT(*)::INTEGER as payment_count,
    COUNT(CASE WHEN p.status = 'paid' AND p.payment_date <= p.due_date THEN 1 END)::INTEGER as paid_on_time_count,
    COUNT(CASE WHEN p.status = 'paid' AND p.payment_date > p.due_date THEN 1 END)::INTEGER as late_payments_count
  FROM payments p
  WHERE p.client_id = p_client_id
    AND p.contract_id = p_contract_id
    AND EXTRACT(YEAR FROM p.due_date) = p_year
  GROUP BY EXTRACT(MONTH FROM p.due_date), TO_CHAR(p.due_date, 'Month')
  ORDER BY month ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. FUNCIÓN: Obtener Estado de Cuenta Actual
-- =====================================================

CREATE OR REPLACE FUNCTION get_account_status(
  p_client_id UUID,
  p_contract_id UUID
)
RETURNS TABLE(
  total_contract_value NUMERIC,
  total_paid NUMERIC,
  total_pending NUMERIC,
  total_overdue NUMERIC,
  next_payment_date DATE,
  next_payment_amount NUMERIC,
  last_payment_date DATE,
  last_payment_amount NUMERIC,
  payment_history_months INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Total del contrato (suma de todos los pagos programados)
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE contract_id = p_contract_id),
    
    -- Total pagado
    (SELECT COALESCE(SUM(amount_paid), 0) FROM payments WHERE contract_id = p_contract_id AND status = 'paid'),
    
    -- Total pendiente
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE contract_id = p_contract_id AND status = 'pending'),
    
    -- Total vencido
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE contract_id = p_contract_id AND status = 'overdue'),
    
    -- Próximo pago: fecha
    (SELECT MIN(due_date) FROM payments WHERE contract_id = p_contract_id AND status IN ('pending', 'overdue')),
    
    -- Próximo pago: monto
    (SELECT amount FROM payments WHERE contract_id = p_contract_id AND status IN ('pending', 'overdue') ORDER BY due_date LIMIT 1),
    
    -- Último pago: fecha
    (SELECT MAX(payment_date) FROM payments WHERE contract_id = p_contract_id AND status = 'paid'),
    
    -- Último pago: monto
    (SELECT amount_paid FROM payments WHERE contract_id = p_contract_id AND status = 'paid' ORDER BY payment_date DESC LIMIT 1),
    
    -- Meses con historial de pagos
    (SELECT COUNT(DISTINCT EXTRACT(YEAR FROM payment_date) || '-' || EXTRACT(MONTH FROM payment_date)) 
     FROM payments WHERE contract_id = p_contract_id AND status = 'paid')::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. FUNCIÓN: Obtener Resumen de Cliente para Dashboard
-- =====================================================

CREATE OR REPLACE FUNCTION get_client_dashboard_summary(
  p_client_id UUID
)
RETURNS TABLE(
  active_contracts INTEGER,
  total_properties INTEGER,
  pending_payments INTEGER,
  pending_amount NUMERIC,
  overdue_payments INTEGER,
  overdue_amount NUMERIC,
  next_payment_date DATE,
  next_payment_amount NUMERIC,
  unread_alerts INTEGER,
  recent_communications INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Contratos activos
    (SELECT COUNT(*)::INTEGER FROM contracts WHERE client_id = p_client_id AND status = 'active'),
    
    -- Total de propiedades
    (SELECT COUNT(*)::INTEGER FROM client_property_relations WHERE client_id = p_client_id AND status = 'active'),
    
    -- Pagos pendientes
    (SELECT COUNT(*)::INTEGER FROM payments WHERE client_id = p_client_id AND status = 'pending'),
    
    -- Monto pendiente
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE client_id = p_client_id AND status = 'pending'),
    
    -- Pagos vencidos
    (SELECT COUNT(*)::INTEGER FROM payments WHERE client_id = p_client_id AND status = 'overdue'),
    
    -- Monto vencido
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE client_id = p_client_id AND status = 'overdue'),
    
    -- Próximo pago: fecha
    (SELECT MIN(due_date) FROM payments WHERE client_id = p_client_id AND status IN ('pending', 'overdue')),
    
    -- Próximo pago: monto
    (SELECT amount FROM payments WHERE client_id = p_client_id AND status IN ('pending', 'overdue') ORDER BY due_date LIMIT 1),
    
    -- Alertas no leídas
    (SELECT COUNT(*)::INTEGER FROM client_alerts WHERE client_id = p_client_id AND status = 'active'),
    
    -- Comunicaciones recientes (últimos 30 días)
    (SELECT COUNT(*)::INTEGER FROM client_communications 
     WHERE client_id = p_client_id 
       AND communication_date >= NOW() - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. FUNCIÓN: Calcular Días de Atraso en Pagos
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_payment_delay_days(
  p_payment_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_due_date DATE;
  v_payment_date DATE;
  v_status VARCHAR;
  v_delay_days INTEGER;
BEGIN
  SELECT due_date, payment_date, status 
  INTO v_due_date, v_payment_date, v_status
  FROM payments 
  WHERE id = p_payment_id;
  
  IF v_status = 'paid' THEN
    -- Si ya está pagado, calcular días entre vencimiento y fecha de pago
    v_delay_days := EXTRACT(DAY FROM v_payment_date - v_due_date)::INTEGER;
  ELSIF v_status IN ('pending', 'overdue') THEN
    -- Si está pendiente, calcular días desde vencimiento hasta hoy
    v_delay_days := EXTRACT(DAY FROM CURRENT_DATE - v_due_date)::INTEGER;
  ELSE
    v_delay_days := 0;
  END IF;
  
  -- Si el resultado es negativo, significa que pagó antes o aún no vence
  RETURN GREATEST(v_delay_days, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. FUNCIÓN: Generar PDF Data (JSON para frontend)
-- =====================================================

CREATE OR REPLACE FUNCTION get_extract_pdf_data(
  p_client_id UUID,
  p_contract_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'client', (
      SELECT json_build_object(
        'name', full_name,
        'document', document_type || ' ' || document_number,
        'phone', phone,
        'email', email
      )
      FROM clients WHERE id = p_client_id
    ),
    'contract', (
      SELECT json_build_object(
        'contract_number', contract_number,
        'start_date', start_date,
        'end_date', end_date,
        'monthly_rent', monthly_rent,
        'deposit_amount', deposit_amount
      )
      FROM contracts WHERE id = p_contract_id
    ),
    'payments', (
      SELECT json_agg(
        json_build_object(
          'date', payment_date,
          'type', payment_type,
          'amount', amount,
          'status', status,
          'method', payment_method,
          'reference', transaction_reference
        )
        ORDER BY payment_date
      )
      FROM payments 
      WHERE contract_id = p_contract_id 
        AND payment_date BETWEEN p_start_date AND p_end_date
    ),
    'summary', (
      SELECT json_build_object(
        'total_due', COALESCE(SUM(amount), 0),
        'total_paid', COALESCE(SUM(CASE WHEN status = 'paid' THEN amount_paid ELSE 0 END), 0),
        'total_pending', COALESCE(SUM(CASE WHEN status != 'paid' THEN amount ELSE 0 END), 0)
      )
      FROM payments 
      WHERE contract_id = p_contract_id 
        AND payment_date BETWEEN p_start_date AND p_end_date
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Listar todas las funciones creadas
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'generate_monthly_extract',
    'generate_annual_summary',
    'get_account_status',
    'get_client_dashboard_summary',
    'calculate_payment_delay_days',
    'get_extract_pdf_data'
  );

-- =====================================================
-- EJEMPLOS DE USO
-- =====================================================

-- Ejemplo 1: Extracto mensual
-- SELECT * FROM generate_monthly_extract('client-uuid', 'contract-uuid', 2025, 10);

-- Ejemplo 2: Resumen anual
-- SELECT * FROM generate_annual_summary('client-uuid', 'contract-uuid', 2025);

-- Ejemplo 3: Estado de cuenta
-- SELECT * FROM get_account_status('client-uuid', 'contract-uuid');

-- Ejemplo 4: Dashboard del cliente
-- SELECT * FROM get_client_dashboard_summary('client-uuid');

-- Ejemplo 5: Días de atraso
-- SELECT calculate_payment_delay_days('payment-uuid');

-- Ejemplo 6: Datos para PDF
-- SELECT get_extract_pdf_data('client-uuid', 'contract-uuid', '2025-01-01', '2025-12-31');

-- ✅ Script completado
-- Siguiente paso: 05_storage_buckets.sql
