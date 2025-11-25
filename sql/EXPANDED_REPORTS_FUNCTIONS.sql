-- =====================================================
-- FUNCIONES RPC PARA REPORTES EXPANDIDOS
-- Funciones para obtener datos de clientes, citas, pagos, etc.
-- =====================================================

-- =====================================================
-- REPORTE DE CLIENTES
-- =====================================================

CREATE OR REPLACE FUNCTION get_client_report(days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_clients BIGINT;
    new_clients_this_month BIGINT;
    active_contracts BIGINT;
    clients_with_overdue BIGINT;
    clients_by_type_data JSON;
    clients_by_status_data JSON;
    clients_by_advisor_data JSON;
BEGIN
    -- Total de clientes
    SELECT COUNT(*) INTO total_clients FROM clients;

    -- Nuevos clientes este mes
    SELECT COUNT(*) INTO new_clients_this_month
    FROM clients
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

    -- Contratos activos
    SELECT COUNT(*) INTO active_contracts
    FROM contracts
    WHERE status = 'active';

    -- Clientes con pagos vencidos
    SELECT COUNT(DISTINCT c.id) INTO clients_with_overdue
    FROM clients c
    JOIN payments p ON c.id = p.client_id
    WHERE p.status = 'overdue';

    -- Clientes por tipo
    SELECT json_agg(json_build_object('type', client_type, 'count', count))
    INTO clients_by_type_data
    FROM (
        SELECT client_type, COUNT(*) as count
        FROM clients
        WHERE client_type IS NOT NULL
        GROUP BY client_type
        ORDER BY count DESC
    ) t;

    -- Clientes por estado
    SELECT json_agg(json_build_object('status', status, 'count', count))
    INTO clients_by_status_data
    FROM (
        SELECT status, COUNT(*) as count
        FROM clients
        GROUP BY status
        ORDER BY count DESC
    ) t;

    -- Clientes por asesor
    SELECT json_agg(json_build_object('advisor', COALESCE(advisor_name, 'Sin asignar'), 'count', count))
    INTO clients_by_advisor_data
    FROM (
        SELECT
            COALESCE(a.full_name, 'Sin asignar') as advisor_name,
            COUNT(*) as count
        FROM clients c
        LEFT JOIN advisors a ON c.assigned_advisor_id = a.id
        GROUP BY a.full_name
        ORDER BY count DESC
    ) t;

    -- Construir resultado
    result := json_build_object(
        'totalClients', total_clients,
        'clientsByType', clients_by_type_data,
        'clientsByStatus', clients_by_status_data,
        'clientsByAdvisor', clients_by_advisor_data,
        'newClientsThisMonth', new_clients_this_month,
        'activeContracts', active_contracts,
        'clientsWithOverduePayments', clients_with_overdue
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- REPORTE DE CITAS
-- =====================================================

CREATE OR REPLACE FUNCTION get_appointment_report(days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_appointments BIGINT;
    confirmed_completed BIGINT;
    conversion_rate DECIMAL;
    average_rating DECIMAL;
    upcoming_appointments BIGINT;
    appointments_by_status_data JSON;
    appointments_by_type_data JSON;
    appointments_by_advisor_data JSON;
BEGIN
    -- Total de citas
    SELECT COUNT(*) INTO total_appointments FROM property_appointments;

    -- Citas confirmadas + completadas para tasa de conversión
    SELECT COUNT(*) INTO confirmed_completed
    FROM property_appointments
    WHERE status IN ('confirmed', 'completed');

    -- Tasa de conversión
    conversion_rate := CASE
        WHEN total_appointments > 0 THEN (confirmed_completed::DECIMAL / total_appointments::DECIMAL) * 100
        ELSE 0
    END;

    -- Rating promedio
    SELECT COALESCE(AVG(feedback_rating), 0) INTO average_rating
    FROM property_appointments
    WHERE feedback_rating IS NOT NULL;

    -- Citas próximas (próximos 7 días)
    SELECT COUNT(*) INTO upcoming_appointments
    FROM property_appointments
    WHERE appointment_date >= CURRENT_DATE
    AND appointment_date <= CURRENT_DATE + INTERVAL '7 days'
    AND status IN ('pending', 'confirmed');

    -- Citas por estado
    SELECT json_agg(json_build_object('status', status, 'count', count))
    INTO appointments_by_status_data
    FROM (
        SELECT status, COUNT(*) as count
        FROM property_appointments
        GROUP BY status
        ORDER BY count DESC
    ) t;

    -- Citas por tipo
    SELECT json_agg(json_build_object('type', appointment_type, 'count', count))
    INTO appointments_by_type_data
    FROM (
        SELECT appointment_type, COUNT(*) as count
        FROM property_appointments
        GROUP BY appointment_type
        ORDER BY count DESC
    ) t;

    -- Citas por asesor
    SELECT json_agg(json_build_object('advisor', COALESCE(advisor_name, 'Sin asignar'), 'count', count))
    INTO appointments_by_advisor_data
    FROM (
        SELECT
            COALESCE(a.full_name, 'Sin asignar') as advisor_name,
            COUNT(*) as count
        FROM property_appointments pa
        LEFT JOIN advisors a ON pa.advisor_id = a.id
        GROUP BY a.full_name
        ORDER BY count DESC
    ) t;

    -- Construir resultado
    result := json_build_object(
        'totalAppointments', total_appointments,
        'appointmentsByStatus', appointments_by_status_data,
        'appointmentsByType', appointments_by_type_data,
        'appointmentsByAdvisor', appointments_by_advisor_data,
        'conversionRate', conversion_rate,
        'averageRating', average_rating,
        'upcomingAppointments', upcoming_appointments
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- REPORTE FINANCIERO
-- =====================================================

CREATE OR REPLACE FUNCTION get_financial_report(days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_revenue DECIMAL(15,2);
    pending_payments DECIMAL(15,2);
    overdue_payments DECIMAL(15,2);
    average_payment_amount DECIMAL(15,2);
    payments_by_type_data JSON;
    monthly_revenue_data JSON;
BEGIN
    -- Ingresos totales (pagos completados)
    SELECT COALESCE(SUM(amount), 0) INTO total_revenue
    FROM payments
    WHERE status = 'paid';

    -- Pagos pendientes
    SELECT COALESCE(SUM(amount), 0) INTO pending_payments
    FROM payments
    WHERE status = 'pending';

    -- Pagos vencidos
    SELECT COALESCE(SUM(amount), 0) INTO overdue_payments
    FROM payments
    WHERE status = 'overdue';

    -- Monto promedio de pagos
    SELECT COALESCE(AVG(amount), 0) INTO average_payment_amount
    FROM payments
    WHERE status = 'paid';

    -- Pagos por tipo
    SELECT json_agg(json_build_object('type', payment_type, 'amount', total_amount, 'count', count))
    INTO payments_by_type_data
    FROM (
        SELECT
            payment_type,
            SUM(amount) as total_amount,
            COUNT(*) as count
        FROM payments
        WHERE status = 'paid'
        GROUP BY payment_type
        ORDER BY total_amount DESC
    ) t;

    -- Ingresos mensuales (últimos 6 meses)
    SELECT json_agg(json_build_object('month', month_name, 'amount', total_amount))
    INTO monthly_revenue_data
    FROM (
        SELECT
            TO_CHAR(DATE_TRUNC('month', payment_date), 'Mon YYYY') as month_name,
            SUM(amount) as total_amount
        FROM payments
        WHERE status = 'paid'
        AND payment_date >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', payment_date)
        ORDER BY DATE_TRUNC('month', payment_date)
    ) t;

    -- Construir resultado
    result := json_build_object(
        'totalRevenue', total_revenue,
        'pendingPayments', pending_payments,
        'overduePayments', overdue_payments,
        'paymentsByType', payments_by_type_data,
        'monthlyRevenue', monthly_revenue_data,
        'averagePaymentAmount', average_payment_amount
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- REPORTE DE CONTRATOS
-- =====================================================

CREATE OR REPLACE FUNCTION get_contract_report()
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_contracts BIGINT;
    active_contracts BIGINT;
    expiring_contracts BIGINT;
    average_contract_value DECIMAL(15,2);
    average_contract_duration DECIMAL(5,2);
    contracts_by_type_data JSON;
BEGIN
    -- Total de contratos
    SELECT COUNT(*) INTO total_contracts FROM contracts;

    -- Contratos activos
    SELECT COUNT(*) INTO active_contracts
    FROM contracts
    WHERE status = 'active';

    -- Contratos próximos a vencer (30 días)
    SELECT COUNT(*) INTO expiring_contracts
    FROM contracts
    WHERE status = 'active'
    AND end_date <= CURRENT_DATE + INTERVAL '30 days'
    AND end_date IS NOT NULL;

    -- Valor promedio de contratos
    SELECT COALESCE(AVG(COALESCE(monthly_rent, sale_price, 0)), 0) INTO average_contract_value
    FROM contracts;

    -- Duración promedio de contratos
    SELECT COALESCE(AVG(contract_duration_months), 0) INTO average_contract_duration
    FROM contracts
    WHERE contract_duration_months IS NOT NULL;

    -- Contratos por tipo
    SELECT json_agg(json_build_object('type', contract_type, 'count', count))
    INTO contracts_by_type_data
    FROM (
        SELECT contract_type, COUNT(*) as count
        FROM contracts
        GROUP BY contract_type
        ORDER BY count DESC
    ) t;

    -- Construir resultado
    result := json_build_object(
        'totalContracts', total_contracts,
        'activeContracts', active_contracts,
        'contractsByType', contracts_by_type_data,
        'expiringContracts', expiring_contracts,
        'averageContractValue', average_contract_value,
        'averageContractDuration', average_contract_duration
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- REPORTE DE COMUNICACIONES
-- =====================================================

CREATE OR REPLACE FUNCTION get_communication_report(days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_communications BIGINT;
    pending_follow_ups BIGINT;
    completed_communications BIGINT;
    response_rate DECIMAL;
    communications_by_type_data JSON;
    communications_by_advisor_data JSON;
BEGIN
    -- Total de comunicaciones
    SELECT COUNT(*) INTO total_communications FROM client_communications;

    -- Seguimientos pendientes
    SELECT COUNT(*) INTO pending_follow_ups
    FROM client_communications
    WHERE follow_up_required = true
    AND (follow_up_date IS NULL OR follow_up_date > CURRENT_DATE);

    -- Comunicaciones completadas
    SELECT COUNT(*) INTO completed_communications
    FROM client_communications
    WHERE status = 'completed';

    -- Tasa de respuesta
    response_rate := CASE
        WHEN total_communications > 0 THEN (completed_communications::DECIMAL / total_communications::DECIMAL) * 100
        ELSE 0
    END;

    -- Comunicaciones por tipo
    SELECT json_agg(json_build_object('type', communication_type, 'count', count))
    INTO communications_by_type_data
    FROM (
        SELECT communication_type, COUNT(*) as count
        FROM client_communications
        GROUP BY communication_type
        ORDER BY count DESC
    ) t;

    -- Comunicaciones por asesor
    SELECT json_agg(json_build_object('advisor', COALESCE(advisor_name, 'Sin asignar'), 'count', count))
    INTO communications_by_advisor_data
    FROM (
        SELECT
            COALESCE(a.full_name, 'Sin asignar') as advisor_name,
            COUNT(*) as count
        FROM client_communications cc
        LEFT JOIN advisors a ON cc.advisor_id = a.id
        GROUP BY a.full_name
        ORDER BY count DESC
    ) t;

    -- Construir resultado
    result := json_build_object(
        'totalCommunications', total_communications,
        'communicationsByType', communications_by_type_data,
        'communicationsByAdvisor', communications_by_advisor_data,
        'pendingFollowUps', pending_follow_ups,
        'responseRate', response_rate
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DASHBOARD COMPLETO
-- =====================================================

CREATE OR REPLACE FUNCTION get_complete_dashboard_data(days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
    property_analytics JSON;
    client_report_data JSON;
    appointment_report_data JSON;
    financial_report_data JSON;
    contract_report_data JSON;
    communication_report_data JSON;
BEGIN
    -- Obtener datos de propiedades (usando función existente)
    SELECT get_dashboard_analytics(days_back) INTO property_analytics;

    -- Obtener reportes expandidos
    SELECT get_client_report(days_back) INTO client_report_data;
    SELECT get_appointment_report(days_back) INTO appointment_report_data;
    SELECT get_financial_report(days_back) INTO financial_report_data;
    SELECT get_contract_report() INTO contract_report_data;
    SELECT get_communication_report(days_back) INTO communication_report_data;

    -- Construir resultado completo
    result := json_build_object(
        'propertyAnalytics', property_analytics,
        'clientReport', client_report_data,
        'appointmentReport', appointment_report_data,
        'financialReport', financial_report_data,
        'contractReport', contract_report_data,
        'communicationReport', communication_report_data
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PERMISOS PARA FUNCIONES RPC
-- =====================================================

-- Otorgar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION get_client_report(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_appointment_report(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_financial_report(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_contract_report() TO authenticated;
GRANT EXECUTE ON FUNCTION get_communication_report(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_complete_dashboard_data(INTEGER) TO authenticated;

-- Otorgar permisos a service_role para operaciones del sistema
GRANT EXECUTE ON FUNCTION get_client_report(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_appointment_report(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_financial_report(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_contract_report() TO service_role;
GRANT EXECUTE ON FUNCTION get_communication_report(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_complete_dashboard_data(INTEGER) TO service_role;

-- =====================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- =====================================================

COMMENT ON FUNCTION get_client_report(INTEGER) IS 'Obtiene reporte completo de clientes con estadísticas detalladas';
COMMENT ON FUNCTION get_appointment_report(INTEGER) IS 'Obtiene reporte completo de citas con métricas de conversión';
COMMENT ON FUNCTION get_financial_report(INTEGER) IS 'Obtiene reporte financiero con ingresos, pagos y análisis mensual';
COMMENT ON FUNCTION get_contract_report() IS 'Obtiene reporte de contratos con análisis de vigencia y tipos';
COMMENT ON FUNCTION get_communication_report(INTEGER) IS 'Obtiene reporte de comunicaciones con tasa de respuesta';
COMMENT ON FUNCTION get_complete_dashboard_data(INTEGER) IS 'Obtiene todos los reportes del dashboard en una sola llamada';

COMMIT;