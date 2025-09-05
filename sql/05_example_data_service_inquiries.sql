-- EJEMPLOS DE DATOS PARA LA TABLA service_inquiries

-- Ejemplo 1: Consulta de Arrendamiento
INSERT INTO service_inquiries (
    client_name,
    client_email,
    client_phone,
    service_type,
    urgency,
    budget,
    details,
    selected_questions,
    status,
    source
) VALUES (
    'María González',
    'maria.gonzalez@email.com',
    '+57 300 123 4567',
    'arrendamientos',
    'normal',
    '$2,000,000 - $3,000,000',
    'Busco apartamento de 2 habitaciones en zona norte de la ciudad, preferiblemente cerca del metro.',
    '["¿Qué tipo de propiedad buscas?", "¿En qué zona te interesa vivir?", "¿Cuál es tu presupuesto mensual?", "¿Cuándo necesitas mudarte?"]',
    'pending',
    'website'
);

-- Ejemplo 2: Consulta de Venta
INSERT INTO service_inquiries (
    client_name,
    client_email,
    client_phone,
    service_type,
    urgency,
    budget,
    details,
    selected_questions,
    status,
    source
) VALUES (
    'Carlos Rodríguez',
    'carlos.rodriguez@email.com',
    '+57 301 987 6543',
    'ventas',
    'urgent',
    '$150,000,000 - $200,000,000',
    'Quiero vender mi casa de 3 pisos en el barrio La Castellana lo más pronto posible.',
    '["¿Quieres comprar o vender una propiedad?", "¿Qué tipo de propiedad te interesa?", "¿Cuál es tu presupuesto o precio esperado?", "¿Cuándo planeas realizar la operación?"]',
    'pending',
    'website'
);

-- Ejemplo 3: Consulta de Avalúo
INSERT INTO service_inquiries (
    client_name,
    client_email,
    client_phone,
    service_type,
    urgency,
    budget,
    details,
    selected_questions,
    status,
    source
) VALUES (
    'Ana Martínez',
    'ana.martinez@email.com',
    '+57 302 456 7890',
    'avaluos',
    'urgent',
    '$300,000 - $500,000',
    'Necesito avalúo comercial de mi apartamento para solicitar crédito hipotecario en el banco.',
    '["¿Para qué necesitas el avalúo?", "¿Qué tipo de propiedad es?", "¿Hay urgencia en la entrega del avalúo?", "¿Necesitas el avalúo para una entidad específica?"]',
    'in_progress',
    'website'
);

-- Ejemplo 4: Consulta de Remodelación
INSERT INTO service_inquiries (
    client_name,
    client_email,
    client_phone,
    service_type,
    urgency,
    budget,
    details,
    selected_questions,
    status,
    source
) VALUES (
    'Luis Fernández',
    'luis.fernandez@email.com',
    '+57 305 789 0123',
    'remodelacion',
    'flexible',
    '$15,000,000 - $25,000,000',
    'Quiero remodelar completamente la cocina y el baño principal de mi casa.',
    '["¿Qué espacios quieres remodelar?", "¿Cuál es tu presupuesto aproximado?", "¿Cuándo te gustaría iniciar la remodelación?", "¿Necesitas incluir plomería o electricidad?"]',
    'completed',
    'website'
);

-- Ejemplo 5: Consulta de Asesoría Contable
INSERT INTO service_inquiries (
    client_name,
    client_email,
    client_phone,
    service_type,
    urgency,
    budget,
    details,
    selected_questions,
    status,
    source
) VALUES (
    'Patricia Ruiz',
    'patricia.ruiz@email.com',
    '+57 304 567 8901',
    'asesorias-contables',
    'normal',
    '$500,000 - $1,000,000',
    'Tengo varias propiedades en arriendo y necesito ayuda con la declaración de renta.',
    '["¿Qué tipo de asesoría contable necesitas?", "¿Tienes propiedades en arriendo?", "¿Necesitas ayuda con la declaración de renta?", "¿Manejas inversiones en finca raíz?"]',
    'pending',
    'website'
);

-- Ejemplo 6: Consulta de Construcción
INSERT INTO service_inquiries (
    client_name,
    client_email,
    client_phone,
    service_type,
    urgency,
    budget,
    details,
    selected_questions,
    status,
    source
) VALUES (
    'Roberto Silva',
    'roberto.silva@email.com',
    '+57 306 234 5678',
    'construccion',
    'normal',
    '$200,000,000 - $300,000,000',
    'Tengo un lote de 200m2 y quiero construir una casa de 2 pisos para mi familia.',
    '["¿Qué tipo de construcción planeas?", "¿Ya tienes el lote o terreno?", "¿Cuántos metros cuadrados quieres construir?", "¿Cuál es tu presupuesto total para la construcción?"]',
    'in_progress',
    'website'
);

-- Consultar todos los registros para verificar
SELECT 
    client_name,
    service_type,
    urgency,
    status,
    created_at,
    budget
FROM service_inquiries 
ORDER BY created_at DESC;
