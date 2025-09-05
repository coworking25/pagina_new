# 🔧 Guía de Configuración del Sistema de Autenticación

## ✅ Pasos para Activar el Sistema

### 1. 📋 Credenciales Actualizadas
- **Email:** `admincoworkin@inmobiliaria.com`
- **Contraseña:** `21033384`

### 2. 🗄️ Ejecutar SQL en Supabase

Ejecuta este código SQL en tu panel de Supabase (SQL Editor):

```sql
-- Crear tabla system_users si no existe
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

-- Crear tabla user_sessions si no existe
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

-- Crear tabla access_logs si no existe
CREATE TABLE IF NOT EXISTS access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES system_users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar/actualizar usuario admin
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
```

### 3. 🔍 Verificar la Configuración

Después de ejecutar el SQL, verifica que el usuario se creó:

```sql
SELECT * FROM system_users WHERE email = 'admincoworkin@inmobiliaria.com';
```

### 4. 🌐 Probar el Login

1. Ve a: http://localhost:5174/login
2. Usa las credenciales:
   - Email: `admincoworkin@inmobiliaria.com`
   - Contraseña: `21033384`
3. Deberías ser redirigido a `/admin/appointments`

### 5. 🐛 Debugging

Si el login falla, abre las herramientas de desarrollador (F12) y revisa la consola para ver los logs detallados que agregamos:

- 🔐 Logs de login
- 🔍 Búsqueda de usuario
- 🔑 Validación de contraseña
- ✅/❌ Resultado de autenticación

### 6. 📱 Rutas Protegidas

Una vez autenticado, puedes acceder a:
- `/admin/appointments` - Panel de citas
- `/admin/service-inquiries` - Panel de consultas

### 7. 🔒 Logout

Para cerrar sesión, usa el botón de logout en las páginas admin o limpia localStorage:
```javascript
localStorage.clear();
```

## 🚨 Solución de Problemas Comunes

### Error "Usuario no encontrado"
- Verifica que ejecutaste el SQL en Supabase
- Confirma que la tabla `system_users` existe
- Revisa que el email esté exacto: `admincoworkin@inmobiliaria.com`

### Error "Credenciales incorrectas"
- Verifica que la contraseña sea exactamente: `21033384`
- Revisa la consola del navegador para logs detallados

### Error de conexión
- Verifica que tu proyecto de Supabase esté activo
- Confirma que las variables de entorno estén configuradas
- Revisa el archivo `.env` con las credenciales de Supabase

## ✅ Estado Actual

- [x] Credenciales actualizadas en el código
- [x] Función de verificación de contraseña actualizada
- [x] Logs de debugging agregados
- [x] SQL script preparado
- [x] Documentación completa

**El sistema está listo para funcionar una vez que ejecutes el SQL en Supabase.**
