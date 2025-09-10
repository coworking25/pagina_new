import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njxrtfyqnzakagwewzrl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qeHJ0Znlxbnpha2Fnd2V3enJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDYyMzY2MywiZXhwIjoyMDUwMTk5NjYzfQ.ey9L7UE3IzHgdVsIyRUP6u4w7fIMLnD4b3uM4CqQPGc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyStorageStructure() {
  console.log('🔍 Verificando estructura del storage...\n');
  
  try {
    // Listar buckets disponibles
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error al obtener buckets:', bucketsError);
      return;
    }
    
    console.log('📦 Buckets disponibles:');
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'público' : 'privado'})`);
    });
    
    // Verificar bucket property-images
    const bucketName = 'property-images';
    console.log(`\n📁 Explorando bucket: ${bucketName}`);
    
    const { data: files, error: filesError } = await supabase.storage
      .from(bucketName)
      .list('', {
        limit: 100,
        offset: 0
      });
    
    if (filesError) {
      console.error('❌ Error al listar archivos:', filesError);
      return;
    }
    
    if (files && files.length > 0) {
      console.log('\n📄 Archivos y carpetas encontrados:');
      files.forEach(file => {
        const type = file.metadata ? '📄' : '📁';
        console.log(`   ${type} ${file.name}`);
      });
      
      // Si hay carpetas, explorar las primeras
      const folders = files.filter(f => !f.metadata);
      if (folders.length > 0) {
        console.log('\n🔍 Explorando carpetas...');
        for (let i = 0; i < Math.min(3, folders.length); i++) {
          const folder = folders[i];
          console.log(`\n📁 Contenido de ${folder.name}:`);
          
          const { data: folderFiles, error: folderError } = await supabase.storage
            .from(bucketName)
            .list(folder.name, { limit: 10 });
          
          if (folderError) {
            console.error(`   ❌ Error: ${folderError.message}`);
          } else if (folderFiles && folderFiles.length > 0) {
            folderFiles.forEach(file => {
              console.log(`   📄 ${file.name}`);
            });
          } else {
            console.log('   📭 Carpeta vacía');
          }
        }
      }
    } else {
      console.log('📭 El bucket está vacío');
      console.log('\n💡 Sugerencia: Necesitas crear carpetas para cada propiedad:');
      console.log('   CA-001/, CA-002/, CA-003/, etc.');
      console.log('   Cada carpeta debe contener las imágenes de esa propiedad');
    }
    
    // Verificar propiedades en la base de datos
    console.log('\n🏠 Verificando propiedades en la base de datos...');
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('code, title, images')
      .limit(5);
    
    if (propertiesError) {
      console.error('❌ Error al obtener propiedades:', propertiesError);
    } else {
      console.log(`\n✅ ${properties.length} propiedades encontradas (mostrando primeras 5):`);
      properties.forEach(prop => {
        console.log(`   📍 ${prop.code}: ${prop.title}`);
        console.log(`      Imágenes: ${prop.images || 'No definidas'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verifyStorageStructure();
