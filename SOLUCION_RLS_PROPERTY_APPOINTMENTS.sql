-- Script para arreglar las políticas RLS de property_appointments
-- Ejecutar en Supabase SQL Editor

-- 1. Ver políticas actuales
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'property_appointments';

-- 2. Eliminar políticas existentes si causan conflictos (opcional)
-- DROP POLICY IF EXISTS "existing_policy_name" ON property_appointments;

-- 3. Crear política para SELECT (lectura)
CREATE POLICY "Allow read property_appointments" ON property_appointments
FOR SELECT 
USING (true);

-- 4. Crear política para INSERT (crear citas)
CREATE POLICY "Allow insert property_appointments" ON property_appointments
FOR INSERT 
WITH CHECK (true);

-- 5. Crear política para UPDATE (editar y eliminar citas)
CREATE POLICY "Allow update property_appointments" ON property_appointments
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- 6. Crear política para DELETE (eliminación física - opcional)
CREATE POLICY "Allow delete property_appointments" ON property_appointments
FOR DELETE 
USING (true);

-- 7. Asegurarse de que RLS está habilitado
ALTER TABLE property_appointments ENABLE ROW LEVEL SECURITY;

-- 8. Verificar las nuevas políticas
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'property_appointments';