import { debugAllProperties } from './lib/supabase.js';

async function testDebug() {
  try {
    console.log('🚀 Iniciando debug de propiedades...');
    const result = await debugAllProperties();
    console.log('📊 Resultado del debug:', result);
  } catch (error) {
    console.error('❌ Error en debug:', error);
  }
}

testDebug();