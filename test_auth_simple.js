// Script simplificado para verificar y crear el usuario admin
console.log('🔧 Iniciando verificación de autenticación...');

// Simulación de datos para verificar estructura
const newAdminUser = {
  email: 'admincoworkin@inmobiliaria.com',
  password_hash: '21033384',
  full_name: 'Administrador Principal',
  role: 'admin',
  status: 'active'
};

console.log('📋 Datos del usuario admin a crear/verificar:');
console.log(JSON.stringify(newAdminUser, null, 2));

console.log('\n🔍 Para verificar en Supabase, ejecuta esta consulta SQL:');
console.log(`
SELECT * FROM system_users 
WHERE email = 'admincoworkin@inmobiliaria.com';
`);

console.log('\n🔧 Si el usuario no existe, ejecuta este INSERT:');
console.log(`
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
    status = EXCLUDED.status;
`);

console.log('\n✅ Script completado. Revisa tu base de datos de Supabase.');
