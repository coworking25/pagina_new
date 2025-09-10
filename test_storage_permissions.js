import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorageConfiguration() {
  console.log('🧪 Probando configuración de Storage...\n');
  
  try {
    // 1. Verificar que el bucket existe
    console.log('1️⃣ Verificando bucket...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error obteniendo buckets:', bucketsError);
      return;
    }
    
    const propertyImagesBucket = buckets.find(bucket => bucket.id === 'property-images');
    if (propertyImagesBucket) {
      console.log('✅ Bucket "property-images" encontrado');
      console.log(`   📁 Público: ${propertyImagesBucket.public ? 'Sí' : 'No'}`);
    } else {
      console.log('❌ Bucket "property-images" no encontrado');
      return;
    }
    
    // 2. Probar listado de archivos (debería funcionar ahora)
    console.log('\n2️⃣ Probando listado de archivos...');
    const { data: files, error: listError } = await supabase.storage
      .from('property-images')
      .list('', { limit: 1 });
    
    if (listError) {
      console.error('❌ Error listando archivos:', listError);
      console.log('   💡 Esto podría indicar problemas de permisos RLS');
    } else {
      console.log('✅ Listado de archivos funciona correctamente');
      console.log(`   📄 Archivos encontrados: ${files?.length || 0}`);
    }
    
    // 3. Crear un archivo de prueba (blob pequeño)
    console.log('\n3️⃣ Probando subida de archivo...');
    const testContent = 'Test file content for storage permissions';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test-storage-permissions.txt', { type: 'text/plain' });
    
    const testPath = `test/${Date.now()}-test.txt`;
    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(testPath, testFile);
    
    if (uploadError) {
      console.error('❌ Error subiendo archivo de prueba:', uploadError);
      console.log('   💡 Las políticas RLS necesitan ser configuradas');
      
      // Mostrar detalles del error
      if (uploadError.message.includes('row-level security')) {
        console.log('   🔐 Error específico: Políticas RLS bloqueando el acceso');
        console.log('   📋 Acción requerida: Ejecutar el SQL de configuración');
      }
    } else {
      console.log('✅ Subida de archivo funciona correctamente');
      
      // 4. Probar eliminación del archivo de prueba
      console.log('\n4️⃣ Limpiando archivo de prueba...');
      const { error: deleteError } = await supabase.storage
        .from('property-images')
        .remove([testPath]);
      
      if (deleteError) {
        console.log('⚠️  Archivo subido pero no se pudo eliminar:', deleteError);
      } else {
        console.log('✅ Eliminación funciona correctamente');
      }
    }
    
    // 5. Resumen final
    console.log('\n📊 RESUMEN DE LA PRUEBA:');
    console.log('='.repeat(40));
    
    if (!bucketsError && propertyImagesBucket) {
      console.log('✅ Bucket configurado correctamente');
    }
    
    if (!listError) {
      console.log('✅ Permisos de lectura funcionando');
    }
    
    if (!uploadError) {
      console.log('✅ Permisos de escritura funcionando');
      console.log('🎉 ¡Storage completamente funcional!');
      console.log('🚀 Puedes proceder con la integración de imágenes');
    } else {
      console.log('❌ Permisos de escritura bloqueados');
      console.log('📋 SIGUIENTE PASO: Ejecutar configure_storage_rls_safe.sql');
      console.log('🔗 Ubicación: sql/configure_storage_rls_safe.sql');
    }
    
  } catch (error) {
    console.error('❌ Error general en la prueba:', error);
  }
}

testStorageConfiguration();
