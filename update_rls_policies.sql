-- Actualizar políticas RLS para permitir acceso de administradores a advisor_availability y availability_exceptions

-- Políticas para advisor_availability (agregar políticas de admin)
DROP POLICY IF EXISTS "Admins can view all advisor availability" ON advisor_availability;
DROP POLICY IF EXISTS "Admins can manage all advisor availability" ON advisor_availability;

CREATE POLICY "Admins can view all advisor availability" ON advisor_availability
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all advisor availability" ON advisor_availability
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para availability_exceptions (agregar políticas de admin)
DROP POLICY IF EXISTS "Admins can view all advisor exceptions" ON availability_exceptions;
DROP POLICY IF EXISTS "Admins can manage all advisor exceptions" ON availability_exceptions;

CREATE POLICY "Admins can view all advisor exceptions" ON availability_exceptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all advisor exceptions" ON availability_exceptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );