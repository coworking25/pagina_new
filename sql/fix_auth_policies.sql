-- Script completo para solucionar los errores de autenticación
-- Ejecutar en Supabase SQL Editor

-- 1. Deshabilitar RLS temporalmente para configurar el sistema
ALTER TABLE IF EXISTS system_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS access_logs DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes que pueden estar causando problemas
DROP POLICY IF EXISTS "Users can only read own data" ON system_users;
DROP POLICY IF EXISTS "Allow public login verification" ON system_users;
DROP POLICY IF EXISTS "Allow public read for login" ON system_users;
DROP POLICY IF EXISTS "Users can only access own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can only read own logs" ON access_logs;
DROP POLICY IF EXISTS "Allow insert access logs" ON access_logs;
DROP POLICY IF EXISTS "Allow read access logs" ON access_logs;
DROP POLICY IF EXISTS "Allow session management" ON user_sessions;

-- 3. Crear tablas si no existen
CREATE TABLE IF NOT EXISTS system_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    phone VARCHAR(50),
    avatar_url TEXT,
    last_login_at TIMESTAMPTZ,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    preferences JSONB DEFAULT '{}',
    permissions JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES system_users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES system_users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- Crear o reemplazar función para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger si ya existe para evitar error de duplicado
DROP TRIGGER IF EXISTS update_system_users_updated_at ON system_users;

-- Crear trigger de forma segura
CREATE TRIGGER update_system_users_updated_at 
    BEFORE UPDATE ON system_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Insertar/actualizar usuario admin
INSERT INTO system_users (email, password_hash, full_name, role, status) 
VALUES (
    'admincoworkin@inmobiliaria.com',
    '21033384',
    'Administrador Principal',
    'admin',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();

-- 5. Configurar políticas más permisivas para la aplicación
-- Permitir acceso público a system_users para login
CREATE POLICY "Allow public read for login" ON system_users
    FOR SELECT USING (true);

-- Permitir inserción y actualización en user_sessions
CREATE POLICY "Allow session management" ON user_sessions
    FOR ALL USING (true);

-- Permitir inserción en access_logs
CREATE POLICY "Allow access logging" ON access_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read access logs" ON access_logs
    FOR SELECT USING (true);

-- 6. Habilitar RLS con políticas permisivas
ALTER TABLE system_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- 7. Verificar que todo está configurado correctamente
SELECT 'Configuración completada' as status;

-- Verificar usuario
SELECT 
    'Usuario admin:' as info,
    email,
    password_hash,
    role,
    status
FROM system_users 
WHERE email = 'admincoworkin@inmobiliaria.com';

-- Verificar políticas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('system_users', 'user_sessions', 'access_logs')
ORDER BY tablename, policyname;
