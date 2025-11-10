-- Verificar si existe la columna property_appointment_id en appointments
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
  AND column_name = 'property_appointment_id';

-- Ver todas las columnas de appointments
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;
