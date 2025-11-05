-- Verificar las columnas de la tabla appointments
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;

-- Ver el registro actual con todas sus columnas
SELECT * FROM appointments LIMIT 1;
