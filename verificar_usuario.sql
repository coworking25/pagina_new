-- Verificar que el usuario admin existe en la base de datos
SELECT 
    id,
    email,
    password_hash,
    full_name,
    role,
    status,
    created_at,
    updated_at
FROM system_users 
WHERE email = 'admincoworkin@inmobiliaria.com';

-- También verificar todas las tablas de autenticación
SELECT 'system_users' as tabla, count(*) as registros FROM system_users
UNION ALL
SELECT 'user_sessions' as tabla, count(*) as registros FROM user_sessions  
UNION ALL
SELECT 'access_logs' as tabla, count(*) as registros FROM access_logs;
