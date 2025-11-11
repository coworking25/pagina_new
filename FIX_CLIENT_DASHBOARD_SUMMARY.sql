-- =====================================================
-- 🔧 FIX: FUNCIÓN get_client_dashboard_summary
-- =====================================================
-- Esta función REEMPLAZA la versión antigua que no devolvía
-- todos los campos requeridos por el TypeScript
-- =====================================================

-- ELIMINAR función antigua
DROP FUNCTION IF EXISTS get_client_dashboard_summary(UUID);

-- CREAR nueva función completa
CREATE OR REPLACE FUNCTION get_client_dashboard_summary(
  p_client_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    -- Información del cliente
    'client_id', p_client_id,
    'full_name', (SELECT full_name FROM clients WHERE id = p_client_id),
    
    -- Estadísticas de contratos
    'active_contracts_count', (
      SELECT COUNT(*)::INTEGER 
      FROM contracts 
      WHERE (client_id = p_client_id OR landlord_id = p_client_id)
        AND status = 'active'
    ),
    
    -- Estadísticas de pagos
    'pending_payments_count', (
      SELECT COUNT(*)::INTEGER 
      FROM payments 
      WHERE (client_id = p_client_id OR beneficiary_id = p_client_id)
        AND status = 'pending'
    ),
    
    'overdue_payments_count', (
      SELECT COUNT(*)::INTEGER 
      FROM payments 
      WHERE (client_id = p_client_id OR beneficiary_id = p_client_id)
        AND status = 'overdue'
    ),
    
    -- Próximo pago
    'next_payment_due_date', (
      SELECT MIN(due_date) 
      FROM payments 
      WHERE (client_id = p_client_id OR beneficiary_id = p_client_id)
        AND status IN ('pending', 'overdue')
    ),
    
    'next_payment_amount', (
      SELECT COALESCE(amount, 0)
      FROM payments 
      WHERE (client_id = p_client_id OR beneficiary_id = p_client_id)
        AND status IN ('pending', 'overdue')
      ORDER BY due_date 
      LIMIT 1
    ),
    
    -- Total pagado este mes
    'total_paid_this_month', (
      SELECT COALESCE(SUM(amount_paid), 0)
      FROM payments
      WHERE (client_id = p_client_id OR beneficiary_id = p_client_id)
        AND status = 'paid'
        AND EXTRACT(MONTH FROM payment_date) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM payment_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    ),
    
    -- Total pagado este año
    'total_paid_this_year', (
      SELECT COALESCE(SUM(amount_paid), 0)
      FROM payments
      WHERE (client_id = p_client_id OR beneficiary_id = p_client_id)
        AND status = 'paid'
        AND EXTRACT(YEAR FROM payment_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    ),
    
    -- Pagos recientes (últimos 5 pagados)
    'recent_payments', (
      SELECT COALESCE(
        json_agg(
          json_build_object(
            'id', p.id,
            'payment_type', p.payment_type,
            'amount', p.amount,
            'amount_paid', p.amount_paid,
            'payment_date', p.payment_date,
            'due_date', p.due_date,
            'status', p.status,
            'contract_id', p.contract_id,
            'transaction_reference', p.transaction_reference
          )
          ORDER BY p.payment_date DESC
        ),
        '[]'::json
      )
      FROM (
        SELECT * 
        FROM payments
        WHERE (client_id = p_client_id OR beneficiary_id = p_client_id)
          AND status = 'paid'
        ORDER BY payment_date DESC
        LIMIT 5
      ) p
    ),
    
    -- Próximos pagos (próximos 5 pendientes/vencidos)
    'upcoming_payments', (
      SELECT COALESCE(
        json_agg(
          json_build_object(
            'id', p.id,
            'payment_type', p.payment_type,
            'amount', p.amount,
            'due_date', p.due_date,
            'status', p.status,
            'contract_id', p.contract_id,
            'late_fee_applied', p.late_fee_applied
          )
          ORDER BY p.due_date ASC
        ),
        '[]'::json
      )
      FROM (
        SELECT * 
        FROM payments
        WHERE (client_id = p_client_id OR beneficiary_id = p_client_id)
          AND status IN ('pending', 'overdue')
        ORDER BY due_date ASC
        LIMIT 5
      ) p
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTARIOS SOBRE LA FUNCIÓN
-- =====================================================
COMMENT ON FUNCTION get_client_dashboard_summary(UUID) IS 
'Devuelve resumen completo del dashboard del cliente en formato JSON.
Incluye: info del cliente, estadísticas de contratos, estadísticas de pagos,
próximo pago, totales del mes/año, y arrays de pagos recientes y próximos.';

-- =====================================================
-- PERMISOS
-- =====================================================
-- Permitir ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION get_client_dashboard_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_client_dashboard_summary(UUID) TO anon;

-- =====================================================
-- PRUEBA DE LA FUNCIÓN
-- =====================================================

-- Para probar, reemplaza 'CLIENT_ID_AQUI' con un UUID real de la tabla clients
-- SELECT get_client_dashboard_summary('CLIENT_ID_AQUI'::UUID);

-- Ejemplo de resultado esperado:
/*
{
  "client_id": "e05ac24a-0bf1-4b09-8e10-0ae9c1b676f0",
  "full_name": "Juan Pérez",
  "active_contracts_count": 2,
  "pending_payments_count": 3,
  "overdue_payments_count": 1,
  "next_payment_due_date": "2025-11-15",
  "next_payment_amount": 1500000,
  "total_paid_this_month": 3000000,
  "total_paid_this_year": 18000000,
  "recent_payments": [
    {
      "id": "...",
      "payment_type": "rent",
      "amount": 1500000,
      "amount_paid": 1500000,
      "payment_date": "2025-11-05",
      "due_date": "2025-11-05",
      "status": "paid",
      "contract_id": "...",
      "transaction_reference": "REF123"
    }
  ],
  "upcoming_payments": [
    {
      "id": "...",
      "payment_type": "rent",
      "amount": 1500000,
      "due_date": "2025-11-15",
      "status": "pending",
      "contract_id": "...",
      "late_fee_applied": 0
    }
  ]
}
*/

-- =====================================================
-- ✅ SCRIPT COMPLETADO
-- =====================================================
-- Ahora la función devuelve TODOS los campos requeridos
-- por la interfaz ClientDashboardSummary en TypeScript.
-- 
-- SIGUIENTE PASO:
-- 1. Ejecutar este script en Supabase SQL Editor
-- 2. Probar la función con un client_id real
-- 3. Verificar que el dashboard cargue correctamente
-- =====================================================
