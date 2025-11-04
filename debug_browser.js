// Script para ejecutar desde la consola del navegador
// Copia y pega esto en la consola cuando la aplicación esté corriendo

import { debugAllProperties } from './lib/supabase.js';

window.testDebug = async function() {
  try {
    console.log('🚀 Iniciando debug de propiedades...');
    const result = await debugAllProperties();
    console.log('📊 Resultado del debug:', result);
    return result;
  } catch (error) {
    console.error('❌ Error en debug:', error);
    return null;
  }
};

// Ejecutar automáticamente
testDebug();