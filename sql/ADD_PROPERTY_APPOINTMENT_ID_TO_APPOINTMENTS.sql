-- Agregar columna property_appointment_id a la tabla appointments si no existe
-- Esta columna vincula appointments (calendario) con property_appointments (sistema de citas)

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'appointments' 
          AND column_name = 'property_appointment_id'
    ) THEN
        -- Agregar la columna
        ALTER TABLE appointments 
        ADD COLUMN property_appointment_id UUID REFERENCES property_appointments(id) ON DELETE SET NULL;
        
        -- Crear índice para mejorar rendimiento
        CREATE INDEX idx_appointments_property_appointment_id 
        ON appointments(property_appointment_id);
        
        RAISE NOTICE 'Columna property_appointment_id agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna property_appointment_id ya existe';
    END IF;
END $$;

-- Verificar que se agregó correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
  AND column_name = 'property_appointment_id';
