import { supabase } from './supabase';

// Función de login simplificada sin sesiones en BD (para testing)
export async function loginUserSimple(email: string, password: string) {
  try {
    console.log('🔐 Login simplificado para:', email);
    
    // Buscar usuario por email
    const { data: user, error: userError } = await supabase
      .from('system_users')
      .select('*')
      .eq('email', email)
      .eq('status', 'active')
      .single();
    
    console.log('🔍 Usuario encontrado:', user);
    console.log('❌ Error de usuario:', userError);
    
    if (userError || !user) {
      throw new Error('Usuario no encontrado');
    }
    
    // Verificar contraseña simple
    if (password !== user.password_hash) {
      throw new Error('Contraseña incorrecta');
    }
    
    // Crear sesión solo en localStorage (sin BD)
    const sessionToken = 'simple_session_' + Date.now();
    
    localStorage.setItem('auth_token', sessionToken);
    localStorage.setItem('user_data', JSON.stringify({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    }));
    
    console.log('✅ Login simplificado exitoso');
    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    };
    
  } catch (error) {
    console.error('❌ Error en login simplificado:', error);
    throw error;
  }
}
