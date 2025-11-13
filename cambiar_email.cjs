// =====================================================
// SCRIPT PARA CAMBIAR EMAIL DESDE NODE.JS
// =====================================================
// Ejecuta: node cambiar_email.cjs

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer variables de entorno
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

let supabaseUrl, supabaseServiceKey;
envContent.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].trim();
  }
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    supabaseServiceKey = line.split('=')[1].trim();
  }
});

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: No se encontraron las variables de entorno');
  console.log('Asegúrate de tener VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env');
  process.exit(1);
}

// Crear cliente con service role key (tiene permisos de admin)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cambiarEmail() {
  try {
    console.log('🔄 Cambiando email...\n');

    const EMAIL_VIEJO = 'diegoadmin@gmail.com';
    const EMAIL_NUEVO = 'diegorpo9608@gmail.com';

    // 1. Buscar el usuario
    console.log('1. Buscando usuario...');
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, role')
      .eq('email', EMAIL_VIEJO)
      .single();

    if (userError || !userData) {
      console.error('❌ Error: Usuario no encontrado');
      console.error(userError);
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log('   ID:', userData.id);
    console.log('   Email actual:', userData.email);
    console.log('   Nombre:', userData.full_name);
    console.log('   Rol:', userData.role);
    console.log('');

    // 2. Actualizar en auth.users usando Admin API
    console.log('2. Actualizando en auth.users...');
    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
      userData.id,
      {
        email: EMAIL_NUEVO,
        email_confirm: true // Marcar como confirmado
      }
    );

    if (authError) {
      console.error('❌ Error actualizando en auth.users:', authError);
      return;
    }

    console.log('✅ Email actualizado en auth.users');
    console.log('');

    // 3. Actualizar en user_profiles
    console.log('3. Actualizando en user_profiles...');
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        email: EMAIL_NUEVO,
        updated_at: new Date().toISOString()
      })
      .eq('id', userData.id);

    if (profileError) {
      console.error('❌ Error actualizando en user_profiles:', profileError);
      return;
    }

    console.log('✅ Email actualizado en user_profiles');
    console.log('');

    // 4. Verificar el cambio
    console.log('4. Verificando cambio...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_profiles')
      .select('email, full_name, role')
      .eq('id', userData.id)
      .single();

    if (verifyError) {
      console.error('❌ Error verificando:', verifyError);
      return;
    }

    console.log('✅ Email confirmado en base de datos:');
    console.log('   Nuevo email:', verifyData.email);
    console.log('');

    console.log('🎉 ¡EMAIL CAMBIADO EXITOSAMENTE!');
    console.log('');
    console.log('📋 PRÓXIMOS PASOS:');
    console.log('   1. Haz logout del dashboard');
    console.log('   2. Haz login con el nuevo email:', EMAIL_NUEVO);
    console.log('   3. Usa la misma contraseña que tenías');
    console.log('');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar
cambiarEmail();
