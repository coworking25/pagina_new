-- =====================================================
-- SCRIPT PARA EJECUTAR EN SUPABASE SQL EDITOR
-- Copia y pega todo este contenido en el SQL Editor de Supabase
-- =====================================================

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
            COALESCE(a.name, 'Sin asignar') as advisor_name,
            COUNT(*) as count
        FROM clients c
        LEFT JOIN advisors a ON c.assigned_advisor_id = a.id
        GROUP BY a.name
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
            COALESCE(a.name, 'Sin asignar') as advisor_name,
            COUNT(*) as count
        FROM property_appointments pa
        LEFT JOIN advisors a ON pa.advisor_id = a.id
        GROUP BY a.name
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
            COALESCE(a.name, 'Sin asignar') as advisor_name,
            COUNT(*) as count
        FROM client_communications cc
        LEFT JOIN advisors a ON cc.advisor_id = a.id
        GROUP BY a.name
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
-- REPORTE DE DOCUMENTOS
-- =====================================================

CREATE OR REPLACE FUNCTION get_documents_report(days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_documents BIGINT;
    documents_by_type_data JSON;
    documents_by_status_data JSON;
    recent_uploads BIGINT;
    expiring_documents BIGINT;
BEGIN
    -- Total de documentos
    SELECT COUNT(*) INTO total_documents FROM client_documents;

    -- Documentos subidos recientemente
    SELECT COUNT(*) INTO recent_uploads
    FROM client_documents
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

    -- Documentos próximos a vencer (si tienen fecha de expiración)
    SELECT COUNT(*) INTO expiring_documents
    FROM client_documents
    WHERE expiration_date IS NOT NULL
    AND expiration_date <= CURRENT_DATE + INTERVAL '30 days'
    AND expiration_date >= CURRENT_DATE;

    -- Documentos por tipo
    SELECT json_agg(json_build_object('type', document_type, 'count', count))
    INTO documents_by_type_data
    FROM (
        SELECT document_type, COUNT(*) as count
        FROM client_documents
        GROUP BY document_type
        ORDER BY count DESC
    ) t;

    -- Documentos por estado
    SELECT json_agg(json_build_object('status', status, 'count', count))
    INTO documents_by_status_data
    FROM (
        SELECT status, COUNT(*) as count
        FROM client_documents
        GROUP BY status
        ORDER BY count DESC
    ) t;

    -- Construir resultado
    result := json_build_object(
        'totalDocuments', total_documents,
        'documentsByType', documents_by_type_data,
        'documentsByStatus', documents_by_status_data,
        'recentUploads', recent_uploads,
        'expiringDocuments', expiring_documents
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- REPORTE DE ALERTAS
-- =====================================================

CREATE OR REPLACE FUNCTION get_alerts_report(days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_alerts BIGINT;
    active_alerts BIGINT;
    critical_alerts BIGINT;
    alerts_by_type_data JSON;
    alerts_by_priority_data JSON;
    recent_alerts BIGINT;
BEGIN
    -- Total de alertas
    SELECT COUNT(*) INTO total_alerts FROM client_alerts;

    -- Alertas activas
    SELECT COUNT(*) INTO active_alerts
    FROM client_alerts
    WHERE status = 'active';

    -- Alertas críticas
    SELECT COUNT(*) INTO critical_alerts
    FROM client_alerts
    WHERE priority = 'high' AND status = 'active';

    -- Alertas recientes
    SELECT COUNT(*) INTO recent_alerts
    FROM client_alerts
    WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';

    -- Alertas por tipo
    SELECT json_agg(json_build_object('type', alert_type, 'count', count))
    INTO alerts_by_type_data
    FROM (
        SELECT alert_type, COUNT(*) as count
        FROM client_alerts
        GROUP BY alert_type
        ORDER BY count DESC
    ) t;

    -- Alertas por prioridad
    SELECT json_agg(json_build_object('priority', priority, 'count', count))
    INTO alerts_by_priority_data
    FROM (
        SELECT priority, COUNT(*) as count
        FROM client_alerts
        GROUP BY priority
        ORDER BY count DESC
    ) t;

    -- Construir resultado
    result := json_build_object(
        'totalAlerts', total_alerts,
        'activeAlerts', active_alerts,
        'criticalAlerts', critical_alerts,
        'alertsByType', alerts_by_type_data,
        'alertsByPriority', alerts_by_priority_data,
        'recentAlerts', recent_alerts
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- REPORTE DE ASESORES
-- =====================================================

CREATE OR REPLACE FUNCTION get_advisors_report(days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_advisors BIGINT;
    active_advisors BIGINT;
    total_clients_assigned BIGINT;
    average_clients_per_advisor DECIMAL;
    advisors_performance_data JSON;
    advisors_by_specialty_data JSON;
BEGIN
    -- Total de asesores
    SELECT COUNT(*) INTO total_advisors FROM advisors;

    -- Asesores activos
    SELECT COUNT(*) INTO active_advisors
    FROM advisors
    WHERE is_active = true;

    -- Total de clientes asignados
    SELECT COUNT(*) INTO total_clients_assigned
    FROM clients
    WHERE assigned_advisor_id IS NOT NULL;

    -- Promedio de clientes por asesor
    average_clients_per_advisor := CASE
        WHEN active_advisors > 0 THEN total_clients_assigned::DECIMAL / active_advisors::DECIMAL
        ELSE 0
    END;

    -- Rendimiento de asesores (clientes asignados)
    SELECT json_agg(json_build_object(
        'advisor', name,
        'clients_count', clients_count,
        'contracts_closed', contracts_closed,
        'total_revenue', total_revenue
    ))
    INTO advisors_performance_data
    FROM (
        SELECT
            a.name,
            COUNT(c.id) as clients_count,
            COUNT(ctr.id) as contracts_closed,
            COALESCE(SUM(p.amount), 0) as total_revenue
        FROM advisors a
        LEFT JOIN clients c ON a.id = c.assigned_advisor_id
        LEFT JOIN contracts ctr ON c.id = ctr.client_id AND ctr.status = 'active'
        LEFT JOIN payments p ON ctr.id = p.contract_id AND p.status = 'paid'
        GROUP BY a.id, a.name
        ORDER BY clients_count DESC
    ) t;

    -- Asesores por especialidad
    SELECT json_agg(json_build_object('specialty', specialty, 'count', count))
    INTO advisors_by_specialty_data
    FROM (
        SELECT specialty, COUNT(*) as count
        FROM advisors
        WHERE specialty IS NOT NULL
        GROUP BY specialty
        ORDER BY count DESC
    ) t;

    -- Construir resultado
    result := json_build_object(
        'totalAdvisors', total_advisors,
        'activeAdvisors', active_advisors,
        'totalClientsAssigned', total_clients_assigned,
        'averageClientsPerAdvisor', average_clients_per_advisor,
        'advisorsPerformance', advisors_performance_data,
        'advisorsBySpecialty', advisors_by_specialty_data
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DASHBOARD COMPLETO ACTUALIZADO
-- =====================================================

-- =====================================================
-- DASHBOARD COMPLETO ACTUALIZADO
-- =====================================================

-- =====================================================
-- FUNCIÓN PARA ANALYTICS DE PROPIEDADES
-- =====================================================

CREATE OR REPLACE FUNCTION get_dashboard_analytics(days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_likes BIGINT;
    total_views BIGINT;
    total_contacts BIGINT;
    unique_visitors BIGINT;
    top_properties_data JSON;
BEGIN
    -- Total de likes
    SELECT COUNT(*) INTO total_likes FROM property_likes;

    -- Total de vistas
    SELECT COUNT(*) INTO total_views FROM property_views;

    -- Total de contactos
    SELECT COUNT(*) INTO total_contacts FROM property_contacts;

    -- Visitantes únicos (basado en sesiones)
    SELECT COUNT(DISTINCT session_id) INTO unique_visitors
    FROM (
        SELECT session_id FROM property_likes
        UNION
        SELECT session_id FROM property_views
        UNION
        SELECT session_id FROM property_contacts
    ) unique_sessions;

    -- Top 10 propiedades más populares
    SELECT json_agg(json_build_object(
        'property_id', p.id,
        'title', p.title,
        'code', p.code,
        'total_likes', COALESCE(likes_count.likes, 0),
        'total_views', COALESCE(views_count.views, 0),
        'total_contacts', COALESCE(contacts_count.contacts, 0),
        'popularity_score', (
            COALESCE(likes_count.likes, 0) * 3 +
            COALESCE(views_count.views, 0) * 1 +
            COALESCE(contacts_count.contacts, 0) * 5
        )
    ))
    INTO top_properties_data
    FROM properties p
    LEFT JOIN (
        SELECT property_id, COUNT(*) as likes
        FROM property_likes
        GROUP BY property_id
    ) likes_count ON p.id = likes_count.property_id
    LEFT JOIN (
        SELECT property_id, COUNT(*) as views
        FROM property_views
        GROUP BY property_id
    ) views_count ON p.id = views_count.property_id
    LEFT JOIN (
        SELECT property_id, COUNT(*) as contacts
        FROM property_contacts
        GROUP BY property_id
    ) contacts_count ON p.id = contacts_count.property_id
    GROUP BY p.id, p.title, p.code, likes_count.likes, views_count.views, contacts_count.contacts
    ORDER BY (
        COALESCE(likes_count.likes, 0) * 3 +
        COALESCE(views_count.views, 0) * 1 +
        COALESCE(contacts_count.contacts, 0) * 5
    ) DESC
    LIMIT 10;

    -- Construir resultado
    result := json_build_object(
        'totalLikes', total_likes,
        'totalViews', total_views,
        'totalContacts', total_contacts,
        'uniqueVisitors', unique_visitors,
        'topProperties', top_properties_data
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
    documents_report_data JSON;
    alerts_report_data JSON;
    advisors_report_data JSON;
BEGIN
    -- Obtener datos de propiedades (usando función existente)
    SELECT get_dashboard_analytics(days_back) INTO property_analytics;

    -- Obtener reportes expandidos
    SELECT get_client_report(days_back) INTO client_report_data;
    SELECT get_appointment_report(days_back) INTO appointment_report_data;
    SELECT get_financial_report(days_back) INTO financial_report_data;
    SELECT get_contract_report() INTO contract_report_data;
    SELECT get_communication_report(days_back) INTO communication_report_data;
    SELECT get_documents_report(days_back) INTO documents_report_data;
    SELECT get_alerts_report(days_back) INTO alerts_report_data;
    SELECT get_advisors_report(days_back) INTO advisors_report_data;

    -- Construir resultado completo
    result := json_build_object(
        'propertyAnalytics', property_analytics,
        'clientReport', client_report_data,
        'appointmentReport', appointment_report_data,
        'financialReport', financial_report_data,
        'contractReport', contract_report_data,
        'communicationReport', communication_report_data,
        'documentsReport', documents_report_data,
        'alertsReport', alerts_report_data,
        'advisorsReport', advisors_report_data
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PERMISOS PARA FUNCIONES NUEVAS
-- =====================================================

-- Otorgar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION get_dashboard_analytics(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_client_report(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_appointment_report(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_financial_report(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_contract_report() TO authenticated;
GRANT EXECUTE ON FUNCTION get_communication_report(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_documents_report(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_alerts_report(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_advisors_report(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_complete_dashboard_data(INTEGER) TO authenticated;

-- Otorgar permisos a service_role para operaciones del sistema
GRANT EXECUTE ON FUNCTION get_dashboard_analytics(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_client_report(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_appointment_report(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_financial_report(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_contract_report() TO service_role;
GRANT EXECUTE ON FUNCTION get_communication_report(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_documents_report(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_alerts_report(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_advisors_report(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_complete_dashboard_data(INTEGER) TO service_role;

-- =====================================================
-- COMENTARIOS DE DOCUMENTACIÓN PARA FUNCIONES NUEVAS
-- =====================================================

COMMENT ON FUNCTION get_dashboard_analytics(INTEGER) IS 'Obtiene analytics completos de propiedades (likes, views, contacts, top properties)';
COMMENT ON FUNCTION get_documents_report(INTEGER) IS 'Obtiene reporte completo de documentos de clientes';
COMMENT ON FUNCTION get_alerts_report(INTEGER) IS 'Obtiene reporte completo de alertas del sistema';
COMMENT ON FUNCTION get_advisors_report(INTEGER) IS 'Obtiene reporte completo de rendimiento de asesores';