-- ============================================
-- MIGRACIÓN: SISTEMA DE GESTIÓN DE PAGOS Y ADMINISTRACIÓN
-- Versión: 1.0
-- Fecha: 2025-11-12
-- ============================================

-- ============================================
-- PARTE 1: AGREGAR CAMPOS A TABLA CONTRACTS
-- ============================================

-- Configuración de administración
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS 
    admin_included_in_rent BOOLEAN DEFAULT false;
    
COMMENT ON COLUMN contracts.admin_included_in_rent IS 
    '¿La administración está incluida en el valor de monthly_rent? 
     true: El inquilino paga un solo monto (arriendo + admin)
     false: El inquilino paga arriendo y admin por separado';

ALTER TABLE contracts ADD COLUMN IF NOT EXISTS 
    admin_paid_by VARCHAR(20) CHECK (admin_paid_by IN ('tenant', 'landlord', 'split'));
    
COMMENT ON COLUMN contracts.admin_paid_by IS 
    'tenant: El inquilino paga la administración
     landlord: El propietario paga (se descuenta del arriendo)
     split: Se divide entre inquilino y propietario';

ALTER TABLE contracts ADD COLUMN IF NOT EXISTS 
    admin_payment_method VARCHAR(20) CHECK (admin_payment_method IN ('direct', 'deducted'));
    
COMMENT ON COLUMN contracts.admin_payment_method IS 
    'direct: El inquilino paga directo a la administración del edificio
     deducted: La agencia recibe el dinero y paga a la administración';

ALTER TABLE contracts ADD COLUMN IF NOT EXISTS 
    admin_landlord_percentage DECIMAL(5,2) DEFAULT 0;
    
COMMENT ON COLUMN contracts.admin_landlord_percentage IS 
    'Si admin_paid_by = split, indica el % que paga el propietario (0-100)
     Ejemplo: 40 significa que el propietario paga 40% y el inquilino 60%';

-- Configuración de comisión de la agencia
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS 
    agency_commission_percentage DECIMAL(5,2) DEFAULT 0;
    
COMMENT ON COLUMN contracts.agency_commission_percentage IS 
    'Porcentaje de comisión que cobra la agencia sobre el arriendo
     Ejemplo: 10.00 = 10% del monthly_rent';

ALTER TABLE contracts ADD COLUMN IF NOT EXISTS 
    agency_commission_fixed DECIMAL(15,2) DEFAULT 0;
    
COMMENT ON COLUMN contracts.agency_commission_fixed IS 
    'Comisión fija en pesos que cobra la agencia
     Se usa en lugar de agency_commission_percentage si es > 0';

-- ============================================
-- PARTE 2: AGREGAR CAMPOS A TABLA PAYMENTS
-- ============================================

-- Campos para desglose de pagos
ALTER TABLE payments ADD COLUMN IF NOT EXISTS 
    gross_amount DECIMAL(15,2);
    
COMMENT ON COLUMN payments.gross_amount IS 
    'Monto bruto recibido del inquilino antes de descuentos
     Ejemplo: Si recibimos $1,150,000 del inquilino, este es el gross_amount';

ALTER TABLE payments ADD COLUMN IF NOT EXISTS 
    admin_deduction DECIMAL(15,2) DEFAULT 0;
    
COMMENT ON COLUMN payments.admin_deduction IS 
    'Monto descontado por concepto de administración
     Se resta del gross_amount antes de pagar al propietario';

ALTER TABLE payments ADD COLUMN IF NOT EXISTS 
    agency_commission DECIMAL(15,2) DEFAULT 0;
    
COMMENT ON COLUMN payments.agency_commission IS 
    'Comisión cobrada por la agencia
     Se resta del gross_amount antes de pagar al propietario';

ALTER TABLE payments ADD COLUMN IF NOT EXISTS 
    net_amount DECIMAL(15,2);
    
COMMENT ON COLUMN payments.net_amount IS 
    'Monto neto que recibe el propietario
     net_amount = gross_amount - admin_deduction - agency_commission';

ALTER TABLE payments ADD COLUMN IF NOT EXISTS 
    payment_direction VARCHAR(20) CHECK (payment_direction IN ('incoming', 'outgoing'));
    
COMMENT ON COLUMN payments.payment_direction IS 
    'incoming: Dinero recibido (inquilino → agencia)
     outgoing: Dinero enviado (agencia → propietario/admin)';

ALTER TABLE payments ADD COLUMN IF NOT EXISTS 
    related_payment_id UUID REFERENCES payments(id);
    
COMMENT ON COLUMN payments.related_payment_id IS 
    'Vincula el pago recibido con el pago enviado
     Ejemplo: pago incoming del inquilino se vincula con pago outgoing al propietario';

ALTER TABLE payments ADD COLUMN IF NOT EXISTS 
    recipient_type VARCHAR(20) CHECK (recipient_type IN ('landlord', 'admin', 'agency', 'utility_company', 'other'));
    
COMMENT ON COLUMN payments.recipient_type IS 
    'Indica a quién se le paga o de quién se recibe:
     landlord: Propietario
     admin: Administración del edificio
     agency: La agencia (nosotros)
     utility_company: Empresa de servicios públicos
     other: Otro destinatario';

-- ============================================
-- PARTE 3: ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

CREATE INDEX IF NOT EXISTS idx_payments_direction 
    ON payments(payment_direction);

CREATE INDEX IF NOT EXISTS idx_payments_recipient 
    ON payments(recipient_type);

CREATE INDEX IF NOT EXISTS idx_payments_related 
    ON payments(related_payment_id);

CREATE INDEX IF NOT EXISTS idx_contracts_admin_config 
    ON contracts(admin_paid_by, admin_payment_method);

-- ============================================
-- PARTE 4: FUNCIÓN PARA CALCULAR DESGLOSES
-- ============================================

CREATE OR REPLACE FUNCTION calculate_payment_breakdown(
    p_contract_id UUID,
    p_gross_amount DECIMAL(15,2)
)
RETURNS TABLE (
    gross_amount DECIMAL(15,2),
    admin_deduction DECIMAL(15,2),
    agency_commission DECIMAL(15,2),
    net_amount DECIMAL(15,2),
    admin_tenant_pays DECIMAL(15,2),
    admin_landlord_pays DECIMAL(15,2)
) AS $$
DECLARE
    v_contract RECORD;
    v_gross DECIMAL(15,2);
    v_admin_deduction DECIMAL(15,2) := 0;
    v_agency_commission DECIMAL(15,2) := 0;
    v_net DECIMAL(15,2);
    v_admin_tenant DECIMAL(15,2) := 0;
    v_admin_landlord DECIMAL(15,2) := 0;
BEGIN
    -- Obtener información del contrato
    SELECT * INTO v_contract
    FROM contracts
    WHERE id = p_contract_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Contrato no encontrado';
    END IF;
    
    v_gross := p_gross_amount;
    
    -- 1. Calcular administración según configuración
    IF v_contract.admin_paid_by = 'tenant' THEN
        -- El inquilino paga la administración
        IF v_contract.admin_included_in_rent THEN
            -- Está incluida en el arriendo, no se descuenta al propietario
            v_admin_tenant := v_contract.administration_fee;
        ELSE
            -- Se cobra por separado al inquilino
            v_admin_tenant := v_contract.administration_fee;
        END IF;
        
    ELSIF v_contract.admin_paid_by = 'landlord' THEN
        -- El propietario paga, se descuenta del arriendo
        v_admin_deduction := v_contract.administration_fee;
        v_admin_landlord := v_contract.administration_fee;
        
    ELSIF v_contract.admin_paid_by = 'split' THEN
        -- División porcentual
        v_admin_landlord := (v_contract.administration_fee * v_contract.admin_landlord_percentage) / 100;
        v_admin_tenant := v_contract.administration_fee - v_admin_landlord;
        
        IF NOT v_contract.admin_included_in_rent THEN
            v_gross := v_gross + v_admin_tenant;
        END IF;
        
        v_admin_deduction := v_admin_landlord;
    END IF;
    
    -- 2. Calcular comisión de la agencia
    IF v_contract.agency_commission_percentage > 0 THEN
        v_agency_commission := (v_contract.monthly_rent * v_contract.agency_commission_percentage) / 100;
    ELSIF v_contract.agency_commission_fixed > 0 THEN
        v_agency_commission := v_contract.agency_commission_fixed;
    END IF;
    
    -- 3. Calcular monto neto para el propietario
    v_net := v_contract.monthly_rent - v_admin_deduction - v_agency_commission;
    
    -- Retornar resultados
    RETURN QUERY SELECT 
        v_gross,
        v_admin_deduction,
        v_agency_commission,
        v_net,
        v_admin_tenant,
        v_admin_landlord;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_payment_breakdown IS 
    'Calcula el desglose completo de un pago basado en la configuración del contrato
     Retorna: gross_amount, admin_deduction, agency_commission, net_amount, 
              admin_tenant_pays, admin_landlord_pays';

-- ============================================
-- PARTE 5: FUNCIÓN PARA REGISTRAR PAGO COMPLETO
-- ============================================

CREATE OR REPLACE FUNCTION register_tenant_payment(
    p_contract_id UUID,
    p_gross_amount DECIMAL(15,2),
    p_payment_date DATE,
    p_payment_method VARCHAR(50),
    p_transaction_reference VARCHAR(255),
    p_period_start DATE,
    p_period_end DATE
)
RETURNS UUID AS $$
DECLARE
    v_contract RECORD;
    v_breakdown RECORD;
    v_incoming_payment_id UUID;
    v_outgoing_payment_id UUID;
    v_admin_payment_id UUID;
BEGIN
    -- Obtener contrato
    SELECT * INTO v_contract FROM contracts WHERE id = p_contract_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Contrato no encontrado';
    END IF;
    
    -- Calcular desglose
    SELECT * INTO v_breakdown FROM calculate_payment_breakdown(p_contract_id, p_gross_amount);
    
    -- 1. Registrar pago recibido del inquilino (incoming)
    INSERT INTO payments (
        contract_id,
        client_id,
        payment_type,
        payment_direction,
        amount,
        gross_amount,
        admin_deduction,
        agency_commission,
        net_amount,
        status,
        due_date,
        payment_date,
        payment_method,
        transaction_reference,
        period_start,
        period_end,
        recipient_type,
        notes
    ) VALUES (
        p_contract_id,
        v_contract.client_id,
        'rent',
        'incoming',
        v_breakdown.gross_amount,
        v_breakdown.gross_amount,
        v_breakdown.admin_deduction,
        v_breakdown.agency_commission,
        v_breakdown.net_amount,
        'paid',
        p_payment_date,
        p_payment_date,
        p_payment_method,
        p_transaction_reference,
        p_period_start,
        p_period_end,
        'agency',
        'Pago recibido del inquilino'
    ) RETURNING id INTO v_incoming_payment_id;
    
    -- 2. Registrar pago a realizar al propietario (outgoing - pendiente)
    INSERT INTO payments (
        contract_id,
        client_id,
        payment_type,
        payment_direction,
        amount,
        net_amount,
        status,
        due_date,
        period_start,
        period_end,
        recipient_type,
        related_payment_id,
        notes
    ) VALUES (
        p_contract_id,
        v_contract.landlord_id,
        'rent',
        'outgoing',
        v_breakdown.net_amount,
        v_breakdown.net_amount,
        'pending',
        p_payment_date + INTERVAL '2 days',
        p_period_start,
        p_period_end,
        'landlord',
        v_incoming_payment_id,
        FORMAT('Arriendo a pagar al propietario. Bruto: $%s - Admin: $%s - Comisión: $%s = Neto: $%s',
               v_breakdown.gross_amount,
               v_breakdown.admin_deduction,
               v_breakdown.agency_commission,
               v_breakdown.net_amount)
    ) RETURNING id INTO v_outgoing_payment_id;
    
    -- 3. Si hay administración a pagar (deducted method)
    IF v_breakdown.admin_deduction > 0 AND v_contract.admin_payment_method = 'deducted' THEN
        INSERT INTO payments (
            contract_id,
            client_id,
            payment_type,
            payment_direction,
            amount,
            status,
            due_date,
            period_start,
            period_end,
            recipient_type,
            related_payment_id,
            notes
        ) VALUES (
            p_contract_id,
            v_contract.landlord_id,
            'administration',
            'outgoing',
            v_breakdown.admin_deduction,
            'pending',
            p_payment_date + INTERVAL '5 days',
            p_period_start,
            p_period_end,
            'admin',
            v_incoming_payment_id,
            'Administración a pagar (descontada del arriendo del propietario)'
        ) RETURNING id INTO v_admin_payment_id;
    END IF;
    
    -- 4. Crear alerta para el admin para que pague al propietario
    INSERT INTO client_alerts (
        client_id,
        contract_id,
        payment_id,
        alert_type,
        title,
        description,
        priority,
        due_date,
        auto_generated
    ) VALUES (
        v_contract.landlord_id,
        p_contract_id,
        v_outgoing_payment_id,
        'payment_due',
        'Pago pendiente al propietario',
        FORMAT('Pagar $%s al propietario por arriendo de %s a %s',
               v_breakdown.net_amount,
               TO_CHAR(p_period_start, 'DD/MM/YYYY'),
               TO_CHAR(p_period_end, 'DD/MM/YYYY')),
        'high',
        p_payment_date + INTERVAL '2 days',
        true
    );
    
    RETURN v_incoming_payment_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION register_tenant_payment IS 
    'Registra un pago recibido del inquilino y crea automáticamente:
     1. Pago incoming (recibido)
     2. Pago outgoing al propietario (pendiente)
     3. Pago administración si aplica (pendiente)
     4. Alertas correspondientes
     Retorna el ID del pago incoming';

-- ============================================
-- PARTE 6: VISTA PARA REPORTES DE PAGOS
-- ============================================

CREATE OR REPLACE VIEW payment_breakdown_report AS
SELECT 
    p.id as payment_id,
    p.payment_date,
    c.contract_number,
    c.id as contract_id,
    cl_tenant.full_name as tenant_name,
    cl_landlord.full_name as landlord_name,
    prop.title as property_title,
    prop.code as property_code,
    
    -- Información del pago
    p.payment_type,
    p.payment_direction,
    p.recipient_type,
    
    -- Montos
    p.gross_amount,
    p.admin_deduction,
    p.agency_commission,
    p.net_amount,
    p.amount,
    
    -- Estado
    p.status,
    p.period_start,
    p.period_end,
    
    -- Configuración de administración
    c.administration_fee,
    c.admin_included_in_rent,
    c.admin_paid_by,
    c.admin_payment_method,
    c.admin_landlord_percentage,
    
    -- Comisiones
    c.agency_commission_percentage,
    c.agency_commission_fixed
    
FROM payments p
JOIN contracts c ON p.contract_id = c.id
JOIN clients cl_tenant ON c.client_id = cl_tenant.id
LEFT JOIN clients cl_landlord ON c.landlord_id = cl_landlord.id
LEFT JOIN properties prop ON c.property_id::text = prop.id::text
WHERE p.payment_type IN ('rent', 'administration')
ORDER BY p.payment_date DESC;

COMMENT ON VIEW payment_breakdown_report IS 
    'Vista completa para reportes de pagos con todos los desgloses y configuraciones';

-- ============================================
-- PARTE 7: ACTUALIZAR DATOS EXISTENTES
-- ============================================

-- Actualizar contratos existentes con valores por defecto
UPDATE contracts
SET 
    admin_included_in_rent = false,
    admin_paid_by = 'landlord',
    admin_payment_method = 'deducted',
    admin_landlord_percentage = 0,
    agency_commission_percentage = 0,
    agency_commission_fixed = 0
WHERE 
    admin_included_in_rent IS NULL 
    OR admin_paid_by IS NULL;

-- Primero, eliminar el constraint antiguo si existe
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_recipient_type_check;

-- Recrear el constraint con los valores correctos
ALTER TABLE payments ADD CONSTRAINT payments_recipient_type_check 
    CHECK (recipient_type IN ('landlord', 'admin', 'agency', 'utility_company', 'other'));

-- Actualizar pagos existentes
UPDATE payments
SET 
    gross_amount = COALESCE(amount, 0),
    admin_deduction = 0,
    agency_commission = 0,
    net_amount = COALESCE(amount, 0),
    payment_direction = CASE 
        WHEN payment_type IN ('rent', 'deposit') THEN 'incoming'
        ELSE 'outgoing'
    END,
    recipient_type = CASE 
        WHEN payment_type = 'administration' THEN 'admin'
        WHEN payment_type IN ('rent', 'deposit') THEN 'agency'
        ELSE 'other'
    END
WHERE 
    gross_amount IS NULL 
    OR payment_direction IS NULL;

-- ============================================
-- PARTE 8: GRANTS Y PERMISOS
-- ============================================

-- Dar permisos a usuarios autenticados
GRANT EXECUTE ON FUNCTION calculate_payment_breakdown TO authenticated;
GRANT EXECUTE ON FUNCTION register_tenant_payment TO authenticated;
GRANT SELECT ON payment_breakdown_report TO authenticated;

-- ============================================
-- VERIFICACIÓN DE MIGRACIÓN
-- ============================================

DO $$
DECLARE
    v_contracts_columns INTEGER;
    v_payments_columns INTEGER;
BEGIN
    -- Verificar columnas en contracts
    SELECT COUNT(*) INTO v_contracts_columns
    FROM information_schema.columns
    WHERE table_name = 'contracts'
    AND column_name IN (
        'admin_included_in_rent',
        'admin_paid_by',
        'admin_payment_method',
        'admin_landlord_percentage',
        'agency_commission_percentage',
        'agency_commission_fixed'
    );
    
    -- Verificar columnas en payments
    SELECT COUNT(*) INTO v_payments_columns
    FROM information_schema.columns
    WHERE table_name = 'payments'
    AND column_name IN (
        'gross_amount',
        'admin_deduction',
        'agency_commission',
        'net_amount',
        'payment_direction',
        'related_payment_id',
        'recipient_type'
    );
    
    -- Mostrar resultados
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'VERIFICACIÓN DE MIGRACIÓN';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Columnas agregadas a contracts: % de 6', v_contracts_columns;
    RAISE NOTICE 'Columnas agregadas a payments: % de 7', v_payments_columns;
    
    IF v_contracts_columns = 6 AND v_payments_columns = 7 THEN
        RAISE NOTICE '✅ Migración completada exitosamente';
    ELSE
        RAISE WARNING '⚠️ Algunas columnas no fueron creadas correctamente';
    END IF;
    RAISE NOTICE '===========================================';
END $$;

-- ============================================
-- FIN DE LA MIGRACIÓN
-- ============================================

COMMIT;
