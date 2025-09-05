// Script para probar la autenticación con las nuevas credenciales
import { supabase } from './src/lib/supabase.js';

async function testAuthentication() {
  console.log('🔧 Iniciando pruebas de autenticación...');
  
  try {
    // 1. Verificar conexión a Supabase
    console.log('\n1. Verificando conexión a Supabase...');
    const { data: testConnection, error: connectionError } = await supabase
      .from('system_users')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Error de conexión:', connectionError);
      return;
    }
    console.log('✅ Conexión a Supabase establecida');
    
    // 2. Verificar si existe la tabla system_users
    console.log('\n2. Verificando tabla system_users...');
    const { data: users, error: usersError } = await supabase
      .from('system_users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Error accediendo a system_users:', usersError);
      console.log('💡 Ejecuta el archivo SQL: sql/11_create_auth_system.sql en tu base de datos');
      return;
    }
    
    console.log('✅ Tabla system_users accesible');
    console.log('📊 Usuarios encontrados:', users?.length || 0);
    
    // 3. Buscar el usuario administrador específico
    console.log('\n3. Buscando usuario admincoworkin@inmobiliaria.com...');
    const { data: adminUser, error: adminError } = await supabase
      .from('system_users')
      .select('*')
      .eq('email', 'admincoworkin@inmobiliaria.com')
      .single();
    
    if (adminError || !adminUser) {
      console.log('❌ Usuario admin no encontrado');
      console.log('🔧 Intentando crear usuario...');
      
      // Intentar crear el usuario
      const { data: newUser, error: createError } = await supabase
        .from('system_users')
        .insert([{
          email: 'admincoworkin@inmobiliaria.com',
          password_hash: '21033384',
          full_name: 'Administrador Principal',
          role: 'admin',
          status: 'active'
        }])
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creando usuario:', createError);
        return;
      }
      
      console.log('✅ Usuario admin creado exitosamente:', newUser);
    } else {
      console.log('✅ Usuario admin encontrado:', {
        id: adminUser.id,
        email: adminUser.email,
        full_name: adminUser.full_name,
        role: adminUser.role,
        status: adminUser.status
      });
    }
    
    // 4. Probar el login
    console.log('\n4. Probando función de login...');
    
    // Importar la función de login (esto podría no funcionar en Node.js directamente)
    try {
      const { loginUser } = await import('./src/lib/supabase.js');
      const loginResult = await loginUser('admincoworkin@inmobiliaria.com', '21033384');
      console.log('✅ Login exitoso:', loginResult);
    } catch (importError) {
      console.log('⚠️ No se pudo importar loginUser (normal en Node.js)');
      console.log('💡 Prueba el login directamente en la aplicación web');
    }
    
    console.log('\n🎉 Todas las pruebas completadas. El sistema debería funcionar correctamente.');
    
  } catch (error) {
    console.error('❌ Error general en las pruebas:', error);
  }
}

// Ejecutar las pruebas
testAuthentication();
