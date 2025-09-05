-- Crear tabla de usuarios del sistema
CREATE TABLE IF NOT EXISTS system_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Información básica del usuario
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    
    -- Rol del usuario
    role VARCHAR(50) NOT NULL DEFAULT 'admin', -- 'admin', 'advisor', 'client'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'suspended'
    
    -- Información adicional
    phone VARCHAR(50),
    avatar_url TEXT,
    
    -- Configuraciones de acceso
    last_login_at TIMESTAMPTZ,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    
    -- Configuraciones del usuario
    preferences JSONB DEFAULT '{}',
    permissions JSONB DEFAULT '{}'
);

-- Crear tabla de sesiones para manejo de login
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

-- Crear tabla de logs de acceso
CREATE TABLE IF NOT EXISTS access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES system_users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'login', 'logout', 'failed_login', 'access_admin'
    ip_address INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_system_users_email ON system_users(email);
CREATE INDEX IF NOT EXISTS idx_system_users_role ON system_users(role);
CREATE INDEX IF NOT EXISTS idx_system_users_status ON system_users(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE system_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para system_users
CREATE POLICY "Users can only read own data" ON system_users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Allow public login verification" ON system_users
    FOR SELECT USING (true); -- Necesario para verificación de login

-- Políticas de seguridad para user_sessions
CREATE POLICY "Users can only access own sessions" ON user_sessions
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Políticas de seguridad para access_logs
CREATE POLICY "Users can only read own logs" ON access_logs
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Allow insert access logs" ON access_logs
    FOR INSERT WITH CHECK (true);

-- Función para limpiar sesiones expiradas
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en system_users
CREATE TRIGGER update_system_users_updated_at 
    BEFORE UPDATE ON system_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar usuario administrador por defecto
-- Contraseña: 21033384
INSERT INTO system_users (email, password_hash, full_name, role, status) 
VALUES (
    'admincoworkin@inmobiliaria.com',
    '21033384', -- Contraseña en texto plano para simplificar (en producción usar hash)
    'Administrador Principal',
    'admin',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- Comentarios sobre las tablas
COMMENT ON TABLE system_users IS 'Tabla de usuarios del sistema (admin, asesores, clientes)';
COMMENT ON TABLE user_sessions IS 'Tabla de sesiones activas de usuarios';
COMMENT ON TABLE access_logs IS 'Tabla de logs de acceso y acciones del sistema';
