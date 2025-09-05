// Utilidad de diagnóstico para verificar URLs de imágenes

export function diagnosticImageUrls() {
  console.log('\n🔍 === DIAGNÓSTICO DE URLs DE IMÁGENES ===');
  
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  console.log('🌐 Base URL de Supabase:', baseUrl);
  
  // URLs de prueba
  const testPaths = [
    'CA-001/CA-001-(1).jpeg',
    'imagenes/CA-001/CA-001-(1).jpeg',
    'imagenes/imagenes/CA-001/CA-001-(1).jpeg'
  ];
  
  console.log('\n📋 Pruebas de rutas:');
  testPaths.forEach(path => {
    const bucketOld = `${baseUrl}/storage/v1/object/public/imagenes/${path}`;
    const bucketNew = `${baseUrl}/storage/v1/object/public/property-images/${path}`;
    
    console.log(`\n🔧 Path: "${path}"`);
    console.log(`   Bucket anterior: ${bucketOld}`);
    console.log(`   Bucket nuevo: ${bucketNew}`);
  });
  
  // Verificar variables de entorno
  console.log('\n🔑 Variables de entorno:');
  console.log('   VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('   VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'PRESENTE' : 'FALTANTE');
  
  console.log('\n=== FIN DIAGNÓSTICO ===\n');
}

// Función para probar URLs directamente
export async function testImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    console.log(`🧪 Test URL: ${url} -> ${response.status} ${response.statusText}`);
    return response.ok;
  } catch (error) {
    console.error(`❌ Error testing URL: ${url}`, error);
    return false;
  }
}

// Función para probar múltiples URLs
export async function testMultipleUrls(urls: string[]) {
  console.log('\n🧪 === TESTING URLS ===');
  const results = await Promise.all(
    urls.map(async (url) => ({
      url,
      accessible: await testImageUrl(url)
    }))
  );
  
  console.log('\n📊 Resultados:');
  results.forEach(({ url, accessible }) => {
    console.log(`${accessible ? '✅' : '❌'} ${url}`);
  });
  
  return results;
}
