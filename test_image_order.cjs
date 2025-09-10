const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjUyNzcwNywiZXhwIjoyMDUyMTAzNzA3fQ.21_jEOrDlvCNs2w8GrKTRfH8lz1oYOZicdPKl3KpSeU';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testImageOrder() {
  console.log('🔍 Verificando orden de imágenes en las propiedades...\n');

  try {
    // Obtener todas las propiedades con imágenes
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, title, images')
      .not('images', 'is', null)
      .limit(5);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`📊 ${properties.length} propiedades encontradas con imágenes:\n`);

    properties.forEach((property, index) => {
      console.log(`${index + 1}. 🏠 ${property.title}`);
      console.log(`   ID: ${property.id}`);
      console.log(`   Imágenes (${property.images.length}):`);
      
      property.images.forEach((img, imgIndex) => {
        const isFirst = imgIndex === 0;
        const shortUrl = img.substring(img.lastIndexOf('/') + 1);
        console.log(`      ${imgIndex + 1}. ${shortUrl} ${isFirst ? '⭐ (PORTADA)' : ''}`);
      });
      console.log('');
    });

    // Mostrar instrucciones para probar
    console.log('📝 Para probar la funcionalidad de portada:');
    console.log('1. Ve a AdminProperties → Editar una propiedad');
    console.log('2. Usa el selector de imagen de portada');
    console.log('3. Verifica que la primera imagen cambie aquí');
    console.log('4. Ejecuta este script nuevamente para confirmar');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testImageOrder();
