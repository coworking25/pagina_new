const { createClient } = require('@supabase/supabase-js');

async function checkAdminUser() {
  console.log('🔍 Verificando usuario admin...');

  try {
    const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMzA0NjIsImV4cCI6MjA3MTkwNjQ2Mn0.ngCP1rv5jLYnJlNnuEtshyHsa1FILqBq89bcjv9pshY';

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar si existe la tabla system_users
    const { data: users, error } = await supabase
      .from('system_users')
      .select('*')
      .eq('email', 'admincoworkin@inmobiliaria.com');

    if (error) {
      console.error('❌ Error consultando system_users:', error);
      return false;
    }

    console.log('👤 Usuarios encontrados:', users?.length || 0);
    if (users && users.length > 0) {
      console.log('✅ Usuario admin encontrado:', {
        email: users[0].email,
        role: users[0].role,
        status: users[0].status
      });
    } else {
      console.log('❌ No se encontró usuario admin');
    }

    return true;

  } catch (error) {
    console.error('❌ Error en checkAdminUser:', error);
    return false;
  }
}

// Ejecutar la verificación
checkAdminUser();