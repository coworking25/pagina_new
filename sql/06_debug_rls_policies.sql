-- VERIFICAR POLÍTICAS DE SEGURIDAD

-- 1. Verificar si RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'service_inquiries';

-- 2. Ver todas las políticas de la tabla
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'service_inquiries';

-- 3. Probar inserción directa (sin RLS temporalmente)
-- SOLO PARA TESTING - NO USAR EN PRODUCCIÓN
ALTER TABLE service_inquiries DISABLE ROW LEVEL SECURITY;

-- Insertar registro de prueba
INSERT INTO service_inquiries (
    client_name, client_phone, service_type, urgency, details, source
) VALUES (
    'Test RLS Disabled', '+57 300 000 0000', 'arrendamientos', 'normal', 'Test sin RLS', 'manual_test'
);

-- Verificar inserción
SELECT * FROM service_inquiries WHERE source = 'manual_test';

-- REACTIVAR RLS (IMPORTANTE!)
ALTER TABLE service_inquiries ENABLE ROW LEVEL SECURITY;

-- 4. Política más permisiva para testing
DROP POLICY IF EXISTS "Anyone can insert service inquiries" ON service_inquiries;

CREATE POLICY "Public insert policy" ON service_inquiries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public select policy" ON service_inquiries
    FOR SELECT USING (true);
