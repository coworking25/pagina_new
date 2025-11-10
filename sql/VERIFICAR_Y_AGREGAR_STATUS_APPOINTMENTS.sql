-- Script para verificar y agregar la columna status en appointments (tabla correcta)
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la columna status existe en appointments
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'appointments'
  AND column_name = 'status';

-- 2. Si no existe, agregar la columna status
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'appointments' 
          AND column_name = 'status'
    ) THEN
        ALTER TABLE appointments
        ADD COLUMN status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled'));
        
        RAISE NOTICE 'Columna status agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna status ya existe';
    END IF;
END $$;

-- 3. Verificar todas las columnas de appointments
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;

-- 4. Agregar columnas de timestamps si no existen
DO $$ 
BEGIN
    -- confirmed_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' AND column_name = 'confirmed_at'
    ) THEN
        ALTER TABLE appointments ADD COLUMN confirmed_at TIMESTAMPTZ;
        RAISE NOTICE 'Columna confirmed_at agregada';
    END IF;
    
    -- completed_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE appointments ADD COLUMN completed_at TIMESTAMPTZ;
        RAISE NOTICE 'Columna completed_at agregada';
    END IF;
    
    -- cancelled_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' AND column_name = 'cancelled_at'
    ) THEN
        ALTER TABLE appointments ADD COLUMN cancelled_at TIMESTAMPTZ;
        RAISE NOTICE 'Columna cancelled_at agregada';
    END IF;
    
    -- no_show_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' AND column_name = 'no_show_at'
    ) THEN
        ALTER TABLE appointments ADD COLUMN no_show_at TIMESTAMPTZ;
        RAISE NOTICE 'Columna no_show_at agregada';
    END IF;
    
    -- rescheduled_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' AND column_name = 'rescheduled_at'
    ) THEN
        ALTER TABLE appointments ADD COLUMN rescheduled_at TIMESTAMPTZ;
        RAISE NOTICE 'Columna rescheduled_at agregada';
    END IF;
END $$;

-- 5. Actualizar citas existentes que no tengan status
UPDATE appointments
SET status = 'pending'
WHERE status IS NULL;

-- 6. Verificar que no haya valores NULL en status
SELECT COUNT(*) as citas_sin_status
FROM appointments
WHERE status IS NULL;

-- 7. Crear índice en status si no existe
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- 8. Verificar estructura final
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'appointments'
  AND column_name IN ('status', 'confirmed_at', 'completed_at', 'cancelled_at', 'no_show_at', 'rescheduled_at')
ORDER BY column_name;
