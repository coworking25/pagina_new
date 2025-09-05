-- Script actualizado para crear el sistema de autenticación
-- con las credenciales específicas: admincoworkin@inmobiliaria.com / 21033384

-- Verificar si las tablas existen y crearlas si es necesario
CREATE TABLE IF NOT EXISTS system_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Información básica del usuario
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    
    -- Rol del usuario
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    
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

-- Tabla de sesiones
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

-- Tabla de logs
CREATE TABLE IF NOT EXISTS access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES system_users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear/actualizar el usuario administrador
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

-- Verificar que el usuario se creó correctamente
SELECT 
    id,
    email,
    password_hash,
    full_name,
    role,
    status,
    created_at
FROM system_users 
WHERE email = 'admincoworkin@inmobiliaria.com';

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Usuario administrador configurado:';
    RAISE NOTICE 'Email: admincoworkin@inmobiliaria.com';
    RAISE NOTICE 'Contraseña: 21033384';
    RAISE NOTICE 'Tabla system_users creada/actualizada correctamente';
END $$;
