// Test directo de conexión a Supabase y verificación del usuario
// Ejecutar en la consola del navegador en la página de login

console.log('🔧 Iniciando test de conexión...');

// Test 1: Verificar conexión a Supabase
async function testSupabaseConnection() {
  try {
    console.log('1️⃣ Probando conexión a Supabase...');
    
    // Importar supabase desde el módulo
    const { supabase } = await import('/src/lib/supabase.js');
    
    // Test básico de conexión
    const { data, error } = await supabase
      .from('system_users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error);
      return false;
    }
    
    console.log('✅ Conexión a Supabase OK');
    return true;
    
  } catch (error) {
    console.error('❌ Error general:', error);
    return false;
  }
}

// Test 2: Verificar usuario específico
async function testUserExists() {
  try {
    console.log('2️⃣ Verificando usuario admincoworkin@inmobiliaria.com...');
    
    const { supabase } = await import('/src/lib/supabase.js');
    
    const { data: user, error } = await supabase
      .from('system_users')
      .select('*')
      .eq('email', 'admincoworkin@inmobiliaria.com')
      .single();
    
    if (error) {
      console.error('❌ Error buscando usuario:', error);
      return false;
    }
    
    if (!user) {
      console.error('❌ Usuario no encontrado');
      return false;
    }
    
    console.log('✅ Usuario encontrado:', {
      id: user.id,
      email: user.email,
      password_hash: user.password_hash,
      role: user.role,
      status: user.status
    });
    
    return user;
    
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

// Test 3: Probar función de login
async function testLogin() {
  try {
    console.log('3️⃣ Probando función de login...');
    
    const { loginUser } = await import('/src/lib/supabase.js');
    
    const result = await loginUser('admincoworkin@inmobiliaria.com', '21033384');
    
    console.log('✅ Login exitoso:', result);
    return true;
    
  } catch (error) {
    console.error('❌ Error en login:', error);
    return false;
  }
}

// Ejecutar todos los tests
async function runAllTests() {
  console.log('🚀 Ejecutando todos los tests...\n');
  
  const connection = await testSupabaseConnection();
  if (!connection) return;
  
  const user = await testUserExists();
  if (!user) return;
  
  const login = await testLogin();
  
  if (login) {
    console.log('\n🎉 Todos los tests pasaron! El sistema debería funcionar.');
  } else {
    console.log('\n❌ Hay problemas con el login. Revisa los logs anteriores.');
  }
}

// Ejecutar automáticamente
runAllTests();

// También exponer las funciones para uso manual
window.testAuth = {
  connection: testSupabaseConnection,
  user: testUserExists,
  login: testLogin,
  all: runAllTests
};
