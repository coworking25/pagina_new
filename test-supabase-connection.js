import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMzA0NjIsImV4cCI6MjA3MTkwNjQ2Mn0.ngCP1rv5jLYnJlNnuEtshyHsa1FILqBq89bcjv9pshY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('🔄 Probando conexión a Supabase...');
    
    // Probar conexión básica
    const { data, error } = await supabase.from('advisors').select('*').limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error);
      return false;
    }
    
    console.log('✅ Conexión exitosa!');
    console.log('📊 Datos obtenidos:', data);
    return true;
    
  } catch (err) {
    console.error('❌ Error crítico:', err);
    return false;
  }
}

testConnection();
