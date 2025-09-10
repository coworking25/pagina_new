import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gfczfjpyyyyvteyrvhgt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc'
);

async function assignImagesToProperty() {
  try {
    console.log('🖼️ Asignando imágenes de Storage a la propiedad ID 64...');
    
    // 1. Obtener archivos de la carpeta CA-021
    console.log('📂 Obteniendo archivos de la carpeta CA-021...');
    const { data: files, error: filesError } = await supabase.storage
      .from('property-images')
      .list('CA-021', {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (filesError) {
      console.error('❌ Error obteniendo archivos:', filesError);
      return;
    }

    if (!files || files.length === 0) {
      console.log('📁 No se encontraron archivos en la carpeta CA-021');
      return;
    }

    console.log(`📸 Archivos encontrados: ${files.length}`);
    files.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.name}`);
    });

    // 2. Generar URLs públicas para cada imagen
    console.log('\n🔗 Generando URLs públicas...');
    const imageUrls = [];
    
    for (const file of files) {
      const filePath = `CA-021/${file.name}`;
      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);
      
      if (urlData?.publicUrl) {
        imageUrls.push(urlData.publicUrl);
        console.log(`  ✅ ${file.name} → ${urlData.publicUrl}`);
      }
    }

    console.log(`\n📊 Total URLs generadas: ${imageUrls.length}`);

    // 3. Actualizar la propiedad ID 64 con las imágenes
    console.log('\n💾 Actualizando propiedad ID 64 con las imágenes...');
    const { data: updateData, error: updateError } = await supabase
      .from('properties')
      .update({ 
        images: imageUrls 
      })
      .eq('id', 64)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error actualizando propiedad:', updateError);
      return;
    }

    console.log('✅ ¡Propiedad actualizada exitosamente!');
    console.log('📋 Detalles de la propiedad:');
    console.log(`  🆔 ID: ${updateData.id}`);
    console.log(`  🏷️ Código: ${updateData.code}`);
    console.log(`  📍 Título: ${updateData.title}`);
    console.log(`  🖼️ Imágenes asignadas: ${updateData.images.length}`);

    // 4. Mostrar las URLs asignadas
    console.log('\n🖼️ URLs de imágenes asignadas:');
    updateData.images.forEach((url, index) => {
      const fileName = url.split('/').pop();
      console.log(`  ${index + 1}. ${fileName}`);
      console.log(`     ${url}`);
    });

    console.log('\n🎉 ¡Proceso completado! Las imágenes ya están asignadas a la propiedad.');
    console.log('👀 Puedes ver la propiedad con imágenes en el dashboard ahora.');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

assignImagesToProperty();
