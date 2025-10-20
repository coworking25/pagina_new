-- ============================================================
-- SCRIPT: DATOS DE PRUEBA PARA PORTAL DE PROPIETARIO
-- Cliente: Juan Diego Restrepo Bayer (diegorpo9608@gmail.com)
-- Propósito: Crear datos realistas para demostrar portal de landlord
-- ============================================================

-- Paso 1: Actualizar tipo de cliente de 'tenant' a 'landlord'
-- ============================================================
UPDATE clients
SET 
  client_type = 'landlord',
  monthly_income = 15000000, -- $15M COP ingreso mensual
  occupation = 'Empresario',
  company_name = 'Inversiones Restrepo SAS',
  notes = 'Cliente propietario con 3 propiedades en arriendo. Portal demo.',
  updated_at = now()
WHERE document_number = '1036647890';

-- Verificar actualización
SELECT id, full_name, client_type, document_number 
FROM clients 
WHERE document_number = '1036647890';


-- Paso 2: Crear 3 propiedades del cliente
-- ============================================================
-- PROPIEDAD 1: Apartamento Poblado
INSERT INTO properties (
  id,
  title,
  property_type,
  transaction_type,
  price,
  area,
  rooms,
  bathrooms,
  address,
  neighborhood,
  city,
  description,
  property_code,
  status,
  amenities,
  created_at
) VALUES (
  'aaaaaaaa-0001-0001-0001-111111111111',
  'Apartamento Premium Poblado',
  'apartamento',
  'arriendo',
  2800000, -- $2.8M COP/mes
  85,
  3,
  2,
  'Calle 10 # 43A-25, Apto 801',
  'El Poblado',
  'Medellín',
  'Moderno apartamento de 3 habitaciones en El Poblado. Completamente amoblado, piso alto con vista panorámica. Edificio con portería 24/7, gimnasio, salón social y parqueadero cubierto.',
  'PROP-2024-001',
  'disponible',
  '["Parqueadero", "Gimnasio", "Portería 24/7", "Salón Social", "Amoblado"]',
  '2023-01-15'::timestamp
) ON CONFLICT (id) DO NOTHING;

-- PROPIEDAD 2: Casa Laureles
INSERT INTO properties (
  id,
  title,
  property_type,
  transaction_type,
  price,
  area,
  rooms,
  bathrooms,
  address,
  neighborhood,
  city,
  description,
  property_code,
  status,
  amenities,
  created_at
) VALUES (
  'bbbbbbbb-0002-0002-0002-222222222222',
  'Casa Familiar Laureles',
  'casa',
  'arriendo',
  3500000, -- $3.5M COP/mes
  150,
  4,
  3,
  'Cra 75 # 32-18',
  'Laureles',
  'Medellín',
  'Amplia casa de 4 habitaciones en el tradicional barrio Laureles. Incluye patio, zona de lavandería, garaje para 2 vehículos. Cerca a colegios, centros comerciales y parques.',
  'PROP-2024-002',
  'disponible',
  '["Garaje", "Patio", "Zona de Lavandería", "Cocina Integral"]',
  '2023-03-10'::timestamp
) ON CONFLICT (id) DO NOTHING;

-- PROPIEDAD 3: Apartaestudio Envigado
INSERT INTO properties (
  id,
  title,
  property_type,
  transaction_type,
  price,
  area,
  rooms,
  bathrooms,
  address,
  neighborhood,
  city,
  description,
  property_code,
  status,
  amenities,
  created_at
) VALUES (
  'cccccccc-0003-0003-0003-333333333333',
  'Apartaestudio Moderno Envigado',
  'apartamento',
  'arriendo',
  1800000, -- $1.8M COP/mes
  45,
  1,
  1,
  'Calle 37 Sur # 43-25, Torre B Apto 503',
  'Zona Centro',
  'Envigado',
  'Acogedor apartaestudio ideal para persona sola o pareja. Cocina americana, baño completo, excelente iluminación natural. Edificio nuevo con ascensor y zona de parqueadero.',
  'PROP-2024-003',
  'disponible',
  '["Ascensor", "Parqueadero", "Cocina Americana", "Iluminación Natural"]',
  '2023-06-20'::timestamp
) ON CONFLICT (id) DO NOTHING;


-- Paso 3: Vincular propiedades al cliente (relación de propiedad)
-- ============================================================
-- Nota: Asumiendo que existe tabla client_property_relations
-- Si no existe, se pueden usar los contratos para establecer la relación

-- VERIFICAR: Si existe la tabla client_property_relations
-- INSERT INTO client_property_relations (client_id, property_id, relation_type, created_at)
-- SELECT id, 'aaaaaaaa-0001-0001-0001-111111111111', 'owner', now()
-- FROM clients WHERE document_number = '1036647890';


-- Paso 4: Crear 3 inquilinos (tenants) ficticios
-- ============================================================

-- INQUILINO 1: Para apartamento Poblado
INSERT INTO clients (
  id,
  full_name,
  document_type,
  document_number,
  phone,
  email,
  address,
  city,
  client_type,
  status,
  monthly_income,
  occupation,
  company_name,
  source,
  notes,
  created_at
) VALUES (
  'tenant01-0000-0000-0000-000000000001',
  'María Camila Gómez Pérez',
  'cedula',
  '1234567890',
  '3001234567',
  'maria.gomez@email.com',
  'Calle 10 # 43A-25, Apto 801',
  'Medellín',
  'tenant',
  'active',
  8000000,
  'Gerente de Marketing',
  'Digital Marketing SAS',
  'manual',
  'Inquilina confiable, paga puntual. Arrendando desde enero 2024.',
  '2024-01-01'::timestamp
) ON CONFLICT (document_type, document_number) DO NOTHING;

-- INQUILINO 2: Para casa Laureles
INSERT INTO clients (
  id,
  full_name,
  document_type,
  document_number,
  phone,
  email,
  address,
  city,
  client_type,
  status,
  monthly_income,
  occupation,
  company_name,
  source,
  notes,
  created_at
) VALUES (
  'tenant02-0000-0000-0000-000000000002',
  'Carlos Andrés Martínez López',
  'cedula',
  '9876543210',
  '3109876543',
  'carlos.martinez@email.com',
  'Cra 75 # 32-18',
  'Medellín',
  'tenant',
  'active',
  12000000,
  'Ingeniero de Software',
  'Tech Solutions Ltda',
  'manual',
  'Familia con 2 niños. Excelentes referencias. Contrato renovado en 2024.',
  '2023-08-01'::timestamp
) ON CONFLICT (document_type, document_number) DO NOTHING;

-- INQUILINO 3: Para apartaestudio Envigado
INSERT INTO clients (
  id,
  full_name,
  document_type,
  document_number,
  phone,
  email,
  address,
  city,
  client_type,
  status,
  monthly_income,
  occupation,
  company_name,
  source,
  notes,
  created_at
) VALUES (
  'tenant03-0000-0000-0000-000000000003',
  'Laura Valentina Rodríguez Castro',
  'cedula',
  '5555555555',
  '3155555555',
  'laura.rodriguez@email.com',
  'Calle 37 Sur # 43-25, Torre B Apto 503',
  'Envigado',
  'tenant',
  'active',
  4500000,
  'Diseñadora Gráfica',
  'Freelance',
  'manual',
  'Joven profesional. Primer contrato de arriendo. Ocasionalmente paga con 2-3 días de retraso.',
  '2024-03-01'::timestamp
) ON CONFLICT (document_type, document_number) DO NOTHING;


-- Paso 5: Crear contratos de arrendamiento
-- ============================================================

-- CONTRATO 1: María Camila en Apartamento Poblado
INSERT INTO contracts (
  id,
  client_id,
  property_id,
  landlord_id,
  contract_type,
  contract_number,
  status,
  start_date,
  end_date,
  signature_date,
  monthly_rent,
  deposit_amount,
  administration_fee,
  contract_duration_months,
  renewal_type,
  payment_day,
  late_fee_percentage,
  notes,
  created_at
) VALUES (
  'contract1-0000-0000-0000-000000000001',
  'tenant01-0000-0000-0000-000000000001',
  'aaaaaaaa-0001-0001-0001-111111111111',
  (SELECT id FROM clients WHERE document_number = '1036647890'),
  'rental',
  'CONT-2024-001',
  'active',
  '2024-01-01',
  '2024-12-31',
  '2023-12-15',
  2800000,
  2800000,
  350000,
  12,
  'automatic',
  5,
  0.05,
  'Contrato estándar. Depósito en garantía. Pagos puntuales.',
  '2023-12-15'::timestamp
) ON CONFLICT (contract_number) DO NOTHING;

-- CONTRATO 2: Carlos Andrés en Casa Laureles
INSERT INTO contracts (
  id,
  client_id,
  property_id,
  landlord_id,
  contract_type,
  contract_number,
  status,
  start_date,
  end_date,
  signature_date,
  monthly_rent,
  deposit_amount,
  administration_fee,
  contract_duration_months,
  renewal_type,
  payment_day,
  late_fee_percentage,
  notes,
  created_at
) VALUES (
  'contract2-0000-0000-0000-000000000002',
  'tenant02-0000-0000-0000-000000000002',
  'bbbbbbbb-0002-0002-0002-222222222222',
  (SELECT id FROM clients WHERE document_number = '1036647890'),
  'rental',
  'CONT-2023-045',
  'active',
  '2023-08-01',
  '2025-07-31',
  '2023-07-20',
  3500000,
  7000000,
  0,
  24,
  'manual',
  10,
  0.05,
  'Contrato familiar a largo plazo. Depósito doble por familia. Sin administración (casa independiente).',
  '2023-07-20'::timestamp
) ON CONFLICT (contract_number) DO NOTHING;

-- CONTRATO 3: Laura Valentina en Apartaestudio Envigado
INSERT INTO contracts (
  id,
  client_id,
  property_id,
  landlord_id,
  contract_type,
  contract_number,
  status,
  start_date,
  end_date,
  signature_date,
  monthly_rent,
  deposit_amount,
  administration_fee,
  contract_duration_months,
  renewal_type,
  payment_day,
  late_fee_percentage,
  notes,
  created_at
) VALUES (
  'contract3-0000-0000-0000-000000000003',
  'tenant03-0000-0000-0000-000000000003',
  'cccccccc-0003-0003-0003-333333333333',
  (SELECT id FROM clients WHERE document_number = '1036647890'),
  'rental',
  'CONT-2024-015',
  'active',
  '2024-03-01',
  '2025-02-28',
  '2024-02-25',
  1800000,
  1800000,
  180000,
  12,
  'automatic',
  5,
  0.05,
  'Primer contrato de la inquilina. Codeudor verificado.',
  '2024-02-25'::timestamp
) ON CONFLICT (contract_number) DO NOTHING;


-- Paso 6: Crear historial de pagos (12 meses)
-- ============================================================
-- Estrategia: 
-- - Apartamento Poblado (María): 12 meses de pagos TODOS PUNTUALES
-- - Casa Laureles (Carlos): 12 meses de pagos, algunos con 1-2 días de retraso
-- - Apartaestudio Envigado (Laura): 10 meses pagados, 1 con mora, 1 pendiente

-- FUNCIÓN HELPER: Generar pagos mensuales
DO $$
DECLARE
  landlord_id uuid;
  contract1_id uuid := 'contract1-0000-0000-0000-000000000001';
  contract2_id uuid := 'contract2-0000-0000-0000-000000000002';
  contract3_id uuid := 'contract3-0000-0000-0000-000000000003';
  tenant1_id uuid := 'tenant01-0000-0000-0000-000000000001';
  tenant2_id uuid := 'tenant02-0000-0000-0000-000000000002';
  tenant3_id uuid := 'tenant03-0000-0000-0000-000000000003';
  mes integer;
  anio integer := 2024;
  mes_actual integer := EXTRACT(MONTH FROM CURRENT_DATE)::integer;
BEGIN
  -- Obtener ID del landlord
  SELECT id INTO landlord_id FROM clients WHERE document_number = '1036647890';

  -- ============================================================
  -- CONTRATO 1: María Camila - Apartamento Poblado
  -- 12 meses de pagos PUNTUALES (enero a diciembre 2024)
  -- ============================================================
  FOR mes IN 1..12 LOOP
    INSERT INTO payments (
      id,
      contract_id,
      client_id,
      payment_type,
      amount,
      due_date,
      payment_date,
      status,
      payment_method,
      period_start,
      period_end,
      late_fee_amount,
      reference_number,
      notes,
      created_at
    ) VALUES (
      gen_random_uuid(),
      contract1_id,
      tenant1_id,
      'rent',
      2800000,
      make_date(anio, mes, 5), -- Vence día 5
      CASE 
        WHEN mes < mes_actual THEN make_date(anio, mes, 4) -- Pagado día 4 (antes del vencimiento)
        WHEN mes = mes_actual THEN CURRENT_DATE -- Mes actual pagado hoy
        ELSE NULL -- Meses futuros sin pagar
      END,
      CASE 
        WHEN mes <= mes_actual THEN 'paid'
        ELSE 'pending'
      END,
      CASE WHEN mes <= mes_actual THEN 'transfer' ELSE NULL END,
      make_date(anio, mes, 1),
      make_date(anio, mes, 1) + interval '1 month' - interval '1 day',
      0, -- Sin mora
      CASE WHEN mes <= mes_actual THEN 'REF-POB-2024-' || LPAD(mes::text, 2, '0') ELSE NULL END,
      'Pago puntual',
      make_date(anio, mes, 1)::timestamp
    ) ON CONFLICT (id) DO NOTHING;

    -- Pago de administración mensual
    IF mes <= mes_actual THEN
      INSERT INTO payments (
        id,
        contract_id,
        client_id,
        payment_type,
        amount,
        due_date,
        payment_date,
        status,
        payment_method,
        period_start,
        period_end,
        late_fee_amount,
        reference_number,
        notes,
        created_at
      ) VALUES (
        gen_random_uuid(),
        contract1_id,
        tenant1_id,
        'administration',
        350000,
        make_date(anio, mes, 5),
        make_date(anio, mes, 4),
        'paid',
        'transfer',
        make_date(anio, mes, 1),
        make_date(anio, mes, 1) + interval '1 month' - interval '1 day',
        0,
        'REF-POB-ADM-2024-' || LPAD(mes::text, 2, '0'),
        'Administración pagada',
        make_date(anio, mes, 1)::timestamp
      ) ON CONFLICT (id) DO NOTHING;
    END IF;
  END LOOP;

  -- ============================================================
  -- CONTRATO 2: Carlos Andrés - Casa Laureles
  -- 12 meses de pagos (algunos con retraso de 1-2 días)
  -- ============================================================
  FOR mes IN 1..12 LOOP
    INSERT INTO payments (
      id,
      contract_id,
      client_id,
      payment_type,
      amount,
      due_date,
      payment_date,
      status,
      payment_method,
      period_start,
      period_end,
      late_fee_amount,
      reference_number,
      notes,
      created_at
    ) VALUES (
      gen_random_uuid(),
      contract2_id,
      tenant2_id,
      'rent',
      3500000,
      make_date(anio, mes, 10), -- Vence día 10
      CASE 
        WHEN mes < mes_actual THEN 
          -- Algunos meses con 1-2 días de retraso (marzo, junio, septiembre)
          CASE 
            WHEN mes IN (3, 6, 9) THEN make_date(anio, mes, 12) -- 2 días tarde
            ELSE make_date(anio, mes, 10) -- A tiempo
          END
        WHEN mes = mes_actual THEN CURRENT_DATE
        ELSE NULL
      END,
      CASE 
        WHEN mes <= mes_actual THEN 'paid'
        ELSE 'pending'
      END,
      CASE WHEN mes <= mes_actual THEN 'transfer' ELSE NULL END,
      make_date(anio, mes, 1),
      make_date(anio, mes, 1) + interval '1 month' - interval '1 day',
      CASE 
        WHEN mes IN (3, 6, 9) AND mes < mes_actual THEN 175000 -- 5% de mora
        ELSE 0
      END,
      CASE WHEN mes <= mes_actual THEN 'REF-LAU-2024-' || LPAD(mes::text, 2, '0') ELSE NULL END,
      CASE 
        WHEN mes IN (3, 6, 9) AND mes < mes_actual THEN 'Pago con 2 días de retraso. Mora aplicada.'
        ELSE 'Pago a tiempo'
      END,
      make_date(anio, mes, 1)::timestamp
    ) ON CONFLICT (id) DO NOTHING;
  END LOOP;

  -- ============================================================
  -- CONTRATO 3: Laura Valentina - Apartaestudio Envigado
  -- 10 meses desde marzo 2024
  -- Mayo: pago con 15 días de mora
  -- Mes actual: PENDIENTE (para demostrar pagos vencidos)
  -- ============================================================
  FOR mes IN 3..12 LOOP -- Comienza en marzo
    DECLARE
      payment_status text;
      payment_date_val date;
      late_fee numeric := 0;
      payment_notes text;
    BEGIN
      -- Mayo (mes 5): Pago atrasado
      IF mes = 5 THEN
        payment_status := 'paid';
        payment_date_val := make_date(anio, mes, 20); -- 15 días tarde
        late_fee := 90000; -- 5% mora
        payment_notes := 'Pago con 15 días de retraso. Inquilina notificada.';
      
      -- Mes actual: PENDIENTE (vencido)
      ELSIF mes = mes_actual THEN
        payment_status := 'overdue';
        payment_date_val := NULL;
        late_fee := 0;
        payment_notes := 'VENCIDO - Pendiente de pago';
      
      -- Meses futuros: pendientes
      ELSIF mes > mes_actual THEN
        payment_status := 'pending';
        payment_date_val := NULL;
        late_fee := 0;
        payment_notes := 'Pendiente';
      
      -- Meses pasados: pagados normalmente (excepto mayo)
      ELSE
        payment_status := 'paid';
        payment_date_val := make_date(anio, mes, 5);
        late_fee := 0;
        payment_notes := 'Pago a tiempo';
      END IF;

      INSERT INTO payments (
        id,
        contract_id,
        client_id,
        payment_type,
        amount,
        due_date,
        payment_date,
        status,
        payment_method,
        period_start,
        period_end,
        late_fee_amount,
        reference_number,
        notes,
        created_at
      ) VALUES (
        gen_random_uuid(),
        contract3_id,
        tenant3_id,
        'rent',
        1800000,
        make_date(anio, mes, 5),
        payment_date_val,
        payment_status,
        CASE WHEN payment_status = 'paid' THEN 'transfer' ELSE NULL END,
        make_date(anio, mes, 1),
        make_date(anio, mes, 1) + interval '1 month' - interval '1 day',
        late_fee,
        CASE WHEN payment_status = 'paid' THEN 'REF-ENV-2024-' || LPAD(mes::text, 2, '0') ELSE NULL END,
        payment_notes,
        make_date(anio, mes, 1)::timestamp
      ) ON CONFLICT (id) DO NOTHING;

      -- Pago de administración (solo para meses pagados)
      IF payment_status = 'paid' THEN
        INSERT INTO payments (
          id,
          contract_id,
          client_id,
          payment_type,
          amount,
          due_date,
          payment_date,
          status,
          payment_method,
          period_start,
          period_end,
          late_fee_amount,
          reference_number,
          notes,
          created_at
        ) VALUES (
          gen_random_uuid(),
          contract3_id,
          tenant3_id,
          'administration',
          180000,
          make_date(anio, mes, 5),
          payment_date_val,
          'paid',
          'transfer',
          make_date(anio, mes, 1),
          make_date(anio, mes, 1) + interval '1 month' - interval '1 day',
          0,
          'REF-ENV-ADM-2024-' || LPAD(mes::text, 2, '0'),
          'Administración pagada',
          make_date(anio, mes, 1)::timestamp
        ) ON CONFLICT (id) DO NOTHING;
      END IF;
    END;
  END LOOP;

  -- Depósitos iniciales (pagos únicos al inicio del contrato)
  -- Depósito Contrato 1
  INSERT INTO payments (
    id,
    contract_id,
    client_id,
    payment_type,
    amount,
    due_date,
    payment_date,
    status,
    payment_method,
    reference_number,
    notes,
    created_at
  ) VALUES (
    gen_random_uuid(),
    contract1_id,
    tenant1_id,
    'deposit',
    2800000,
    '2023-12-20',
    '2023-12-18',
    'paid',
    'transfer',
    'REF-POB-DEP-001',
    'Depósito en garantía',
    '2023-12-18'::timestamp
  ) ON CONFLICT (id) DO NOTHING;

  -- Depósito Contrato 2
  INSERT INTO payments (
    id,
    contract_id,
    client_id,
    payment_type,
    amount,
    due_date,
    payment_date,
    status,
    payment_method,
    reference_number,
    notes,
    created_at
  ) VALUES (
    gen_random_uuid(),
    contract2_id,
    tenant2_id,
    'deposit',
    7000000,
    '2023-07-25',
    '2023-07-22',
    'paid',
    'transfer',
    'REF-LAU-DEP-001',
    'Depósito doble por familia',
    '2023-07-22'::timestamp
  ) ON CONFLICT (id) DO NOTHING;

  -- Depósito Contrato 3
  INSERT INTO payments (
    id,
    contract_id,
    client_id,
    payment_type,
    amount,
    due_date,
    payment_date,
    status,
    payment_method,
    reference_number,
    notes,
    created_at
  ) VALUES (
    gen_random_uuid(),
    contract3_id,
    tenant3_id,
    'deposit',
    1800000,
    '2024-02-28',
    '2024-02-26',
    'paid',
    'transfer',
    'REF-ENV-DEP-001',
    'Depósito con codeudor',
    '2024-02-26'::timestamp
  ) ON CONFLICT (id) DO NOTHING;

END $$;


-- ============================================================
-- VERIFICACIONES Y REPORTES
-- ============================================================

-- 1. Verificar cliente actualizado
SELECT 
  full_name,
  client_type,
  document_number,
  occupation,
  company_name
FROM clients 
WHERE document_number = '1036647890';

-- 2. Verificar propiedades creadas
SELECT 
  property_code,
  title,
  property_type,
  neighborhood,
  price as "canon_mensual",
  status
FROM properties 
WHERE id IN (
  'aaaaaaaa-0001-0001-0001-111111111111',
  'bbbbbbbb-0002-0002-0002-222222222222',
  'cccccccc-0003-0003-0003-333333333333'
)
ORDER BY price DESC;

-- 3. Verificar inquilinos creados
SELECT 
  full_name,
  document_number,
  client_type,
  occupation,
  status
FROM clients 
WHERE client_type = 'tenant'
  AND document_number IN ('1234567890', '9876543210', '5555555555');

-- 4. Verificar contratos creados
SELECT 
  c.contract_number,
  cl.full_name as inquilino,
  p.title as propiedad,
  c.monthly_rent,
  c.start_date,
  c.end_date,
  c.status
FROM contracts c
JOIN clients cl ON c.client_id = cl.id
JOIN properties p ON c.property_id = p.id
WHERE c.landlord_id = (SELECT id FROM clients WHERE document_number = '1036647890')
ORDER BY c.start_date;

-- 5. Resumen de pagos por contrato
SELECT 
  c.contract_number,
  COUNT(p.id) as total_pagos,
  COUNT(CASE WHEN p.status = 'paid' THEN 1 END) as pagos_realizados,
  COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pagos_pendientes,
  COUNT(CASE WHEN p.status = 'overdue' THEN 1 END) as pagos_vencidos,
  SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END) as total_recibido,
  SUM(CASE WHEN p.status = 'paid' THEN p.late_fee_amount ELSE 0 END) as total_mora
FROM contracts c
LEFT JOIN payments p ON c.id = p.contract_id
WHERE c.landlord_id = (SELECT id FROM clients WHERE document_number = '1036647890')
GROUP BY c.contract_number
ORDER BY c.contract_number;

-- 6. Últimos 10 pagos recibidos
SELECT 
  p.payment_date,
  c.contract_number,
  cl.full_name as inquilino,
  p.payment_type,
  p.amount,
  p.late_fee_amount,
  p.status,
  p.reference_number
FROM payments p
JOIN contracts c ON p.contract_id = c.id
JOIN clients cl ON p.client_id = cl.id
WHERE c.landlord_id = (SELECT id FROM clients WHERE document_number = '1036647890')
  AND p.status = 'paid'
ORDER BY p.payment_date DESC
LIMIT 10;

-- 7. Resumen financiero del propietario
SELECT 
  COUNT(DISTINCT c.id) as total_contratos_activos,
  SUM(c.monthly_rent) as ingreso_mensual_esperado,
  COUNT(DISTINCT p.id) as total_propiedades,
  (
    SELECT SUM(pay.amount) 
    FROM payments pay 
    JOIN contracts ct ON pay.contract_id = ct.id
    WHERE ct.landlord_id = (SELECT id FROM clients WHERE document_number = '1036647890')
      AND pay.status = 'paid'
      AND pay.payment_type = 'rent'
      AND EXTRACT(YEAR FROM pay.payment_date) = 2024
  ) as total_recibido_2024
FROM contracts c
JOIN properties p ON c.property_id = p.id
WHERE c.landlord_id = (SELECT id FROM clients WHERE document_number = '1036647890')
  AND c.status = 'active';

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
