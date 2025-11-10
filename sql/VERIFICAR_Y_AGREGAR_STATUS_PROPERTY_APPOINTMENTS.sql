-- Script para verificar y agregar la columna status en property_appointments si no existe
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la columna status existe
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'property_appointments'
  AND column_name = 'status';

-- 2. Si no existe, agregar la columna status
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'property_appointments' 
          AND column_name = 'status'
    ) THEN
        ALTER TABLE property_appointments
        ADD COLUMN status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled'));
        
        RAISE NOTICE 'Columna status agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna status ya existe';
    END IF;
END $$;

-- 3. Verificar todas las columnas de property_appointments
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'property_appointments'
ORDER BY ordinal_position;

-- 4. Actualizar citas existentes que no tengan status
UPDATE property_appointments
SET status = 'pending'
WHERE status IS NULL;

-- 5. Verificar que no haya valores NULL en status
SELECT COUNT(*) as citas_sin_status
FROM property_appointments
WHERE status IS NULL;

-- 6. Crear índice en status si no existe
CREATE INDEX IF NOT EXISTS idx_property_appointments_status ON property_appointments(status);

-- 7. Verificar las políticas RLS actuales
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'property_appointments'
ORDER BY cmd, policyname;
