import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

if (!urlMatch || !keyMatch) {
  console.error('Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function runDiagnostics() {
  try {
    console.log('🔍 EJECUTANDO DIAGNÓSTICO DE USUARIOS ADMIN...');

    // Verificar user_profiles
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, role, is_active, created_at, last_login_at')
      .in('email', ['jaideradmin@gmail.com', 'diegoadmin@gmail.com']);

    if (profileError) {
      console.error('❌ Error consultando user_profiles:', profileError);
      return;
    }

    console.log('📋 PERFILES EN user_profiles:');
    profiles.forEach(profile => {
      console.log(`  - ${profile.email}: Rol='${profile.role}', Activo=${profile.is_active}, Último login=${profile.last_login_at || 'Nunca'}`);
    });

    // Verificar si hay más usuarios admin
    const { data: allAdmins, error: adminError } = await supabase
      .from('user_profiles')
      .select('email, role, is_active')
      .eq('role', 'admin');

    if (adminError) {
      console.error('❌ Error consultando admins:', adminError);
    } else {
      console.log('\n� TODOS LOS USUARIOS ADMIN:');
      allAdmins.forEach(admin => {
        console.log(`  - ${admin.email}: Activo=${admin.is_active}`);
      });
    }

    // Verificar funciones RPC
    console.log('\n🔧 VERIFICACIÓN DE FUNCIONES RPC:');

    try {
      const { data: adminResult, error: adminFuncError } = await supabase.rpc('is_admin');
      if (adminFuncError) {
        console.log('❌ Función is_admin() error:', adminFuncError.message);
      } else {
        console.log('✅ Función is_admin() funciona');
      }
    } catch (e) {
      console.log('❌ Error llamando is_admin():', e.message);
    }

    try {
      const { data: advisorResult, error: advisorFuncError } = await supabase.rpc('is_advisor');
      if (advisorFuncError) {
        console.log('❌ Función is_advisor() error:', advisorFuncError.message);
      } else {
        console.log('✅ Función is_advisor() funciona');
      }
    } catch (e) {
      console.log('❌ Error llamando is_advisor():', e.message);
    }

    // Intentar login simulado para verificar
    console.log('\n🔐 PRUEBA DE LOGIN SIMULADO:');
    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'jaideradmin@gmail.com',
        password: 'admin2025'
      });

      if (loginError) {
        console.log('❌ Login fallido:', loginError.message);
      } else {
        console.log('✅ Login exitoso para jaideradmin@gmail.com');

        // Verificar si es admin después del login
        const { data: isAdminResult } = await supabase.rpc('is_admin');
        console.log(`   - ¿Es admin? ${isAdminResult ? '✅ Sí' : '❌ No'}`);

        // Logout
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.log('❌ Error en login simulado:', e.message);
    }

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  }
}

runDiagnostics();