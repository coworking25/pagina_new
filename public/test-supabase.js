// Test simple para verificar Supabase en el navegador
console.log('🔧 Iniciando test de Supabase...');

// Verificar variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Variables de entorno:');
console.log('VITE_SUPABASE_URL:', supabaseUrl);
console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '[CONFIGURADA]' : '[NO CONFIGURADA]');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas');
} else {
  console.log('✅ Variables de entorno configuradas');
  
  // Test de fetch directo
  fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  })
  .then(response => {
    console.log('✅ Status:', response.status);
    console.log('✅ Response OK:', response.ok);
    return response.text();
  })
  .then(data => {
    console.log('✅ Datos recibidos (primeros 200 chars):', data.substring(0, 200));
  })
  .catch(error => {
    console.error('❌ Error en fetch:', error);
  });
}
