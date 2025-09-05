-- ACTUALIZAR TABLA PARA PREGUNTAS CON RESPUESTAS

-- Agregar nueva columna para preguntas y respuestas estructuradas
ALTER TABLE service_inquiries 
ADD COLUMN questions_and_answers JSONB DEFAULT '[]';

-- La estructura será:
-- [
--   {
--     "question": "¿Qué espacios quieres remodelar?",
--     "answer": "Cocina y baño principal"
--   },
--   {
--     "question": "¿Cuál es tu presupuesto aproximado?", 
--     "answer": "Entre 15 y 20 millones"
--   }
-- ]

-- Comentario para documentación
COMMENT ON COLUMN service_inquiries.questions_and_answers IS 'Array JSON con objetos que contienen pregunta y respuesta del cliente';

-- Ejemplo de inserción con el nuevo formato
INSERT INTO service_inquiries (
    client_name,
    client_phone,
    service_type,
    urgency,
    details,
    selected_questions,  -- Mantenemos por compatibilidad
    questions_and_answers, -- Nueva columna
    source
) VALUES (
    'Test Preguntas con Respuestas',
    '+57 300 555 0000',
    'remodelacion',
    'normal',
    'Quiero remodelar mi casa',
    '["¿Qué espacios quieres remodelar?", "¿Cuál es tu presupuesto aproximado?"]'::jsonb,
    '[
        {
            "question": "¿Qué espacios quieres remodelar?",
            "answer": "Cocina completa y baño principal"
        },
        {
            "question": "¿Cuál es tu presupuesto aproximado?",
            "answer": "Entre 15 y 20 millones de pesos"
        }
    ]'::jsonb,
    'test_new_format'
);

-- Verificar la inserción
SELECT 
    client_name,
    service_type,
    questions_and_answers
FROM service_inquiries 
WHERE source = 'test_new_format';
