// Script de prueba para verificar isAdmin() desde el navegador
// Ejecutar en la consola del navegador después de hacer login

import { supabase } from './lib/supabase.ts';

async function testIsAdmin() {
  console.log('🧪 PRUEBA DE isAdmin() DESDE EL NAVEGADOR');

  try {
    // 1. Verificar sesión actual
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    console.log('📋 Sesión actual:', session);
    console.log('📋 Error de sesión:', sessionError);

    if (!session?.session) {
      console.log('❌ No hay sesión activa');
      return;
    }

    // 2. Verificar usuario actual
    const { data: user, error: userError } = await supabase.auth.getUser();
    console.log('👤 Usuario actual:', user);
    console.log('👤 Error de usuario:', userError);

    // 3. Probar función isAdmin()
    console.log('🔧 Probando isAdmin()...');
    const { data: isAdminResult, error: isAdminError } = await supabase.rpc('is_admin');
    console.log('✅ Resultado de isAdmin():', isAdminResult);
    console.log('❌ Error de isAdmin():', isAdminError);

    // 4. Verificar perfil manualmente
    console.log('📋 Verificando perfil manualmente...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.user?.id);

    console.log('👤 Perfil encontrado:', profile);
    console.log('👤 Error de perfil:', profileError);

    // 5. Comparar resultados
    if (profile && profile.length > 0) {
      const userProfile = profile[0];
      console.log('🔍 Comparación:');
      console.log('- ID del usuario:', user.user?.id);
      console.log('- ID en perfil:', userProfile.id);
      console.log('- Rol en perfil:', userProfile.role);
      console.log('- Activo:', userProfile.is_active);
      console.log('- isAdmin() result:', isAdminResult);

      const expectedResult = userProfile.role === 'admin' && userProfile.is_active === true;
      console.log('- Resultado esperado:', expectedResult);

      if (isAdminResult === expectedResult) {
        console.log('✅ isAdmin() funciona correctamente');
      } else {
        console.log('❌ isAdmin() NO coincide con el resultado esperado');
      }
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar la prueba
testIsAdmin();