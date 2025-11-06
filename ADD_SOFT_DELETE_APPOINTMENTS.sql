-- SOLUCIÓN COMPLETA: Agregar soft delete a la tabla appointments
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar columna deleted_at a appointments
ALTER TABLE appointments 
ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;

-- 2. Crear índice para mejorar rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_appointments_deleted_at 
ON appointments(deleted_at) 
WHERE deleted_at IS NULL;

-- 3. Crear política RLS para permitir actualizaciones (soft delete)
CREATE POLICY "Allow update appointments" ON appointments
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- 4. Verificar que RLS esté habilitado
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 5. Verificar la estructura actualizada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'appointments' 
  AND table_schema = 'public'
ORDER BY column_name;