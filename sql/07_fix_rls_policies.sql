-- ARREGLAR POLÍTICAS RLS PARA SERVICE_INQUIRIES

-- 1. Eliminar políticas actuales
DROP POLICY IF EXISTS "Anyone can insert service inquiries" ON service_inquiries;
DROP POLICY IF EXISTS "Authenticated users can view service inquiries" ON service_inquiries;
DROP POLICY IF EXISTS "Authenticated users can update service inquiries" ON service_inquiries;
DROP POLICY IF EXISTS "Public insert policy" ON service_inquiries;
DROP POLICY IF EXISTS "Public select policy" ON service_inquiries;

-- 2. Crear políticas más específicas y funcionales

-- Permitir inserción pública (para formularios web)
CREATE POLICY "enable_insert_for_all" ON service_inquiries
    FOR INSERT WITH CHECK (true);

-- Permitir lectura pública (para testing, luego se puede restringir)
CREATE POLICY "enable_select_for_all" ON service_inquiries
    FOR SELECT USING (true);

-- Permitir actualización solo para usuarios autenticados
CREATE POLICY "enable_update_for_authenticated" ON service_inquiries
    FOR UPDATE USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Permitir eliminación solo para usuarios autenticados
CREATE POLICY "enable_delete_for_authenticated" ON service_inquiries
    FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Verificar que RLS esté habilitado
ALTER TABLE service_inquiries ENABLE ROW LEVEL SECURITY;

-- 4. Verificar políticas creadas
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
WHERE tablename = 'service_inquiries'
ORDER BY cmd;

-- 5. Test de inserción rápida
INSERT INTO service_inquiries (
    client_name, 
    client_phone, 
    service_type, 
    urgency, 
    details, 
    source,
    selected_questions
) VALUES (
    'Test Política Nueva', 
    '+57 301 111 1111', 
    'ventas', 
    'normal', 
    'Test con políticas nuevas', 
    'policy_test',
    '["Test question 1", "Test question 2"]'::jsonb
);

-- 6. Verificar inserción
SELECT * FROM service_inquiries WHERE source = 'policy_test';
