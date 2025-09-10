import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gfczfjpyyyyvteyrvhgt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc'
);

async function checkAdvisorPhotos() {
  try {
    console.log('📸 Verificando fotos de asesores...');
    
    // Obtener asesores
    const { data: advisors, error } = await supabase
      .from('advisors')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('❌ Error obteniendo asesores:', error);
      return;
    }
    
    console.log(`👥 ${advisors.length} asesores encontrados`);
    
    advisors.forEach((advisor, index) => {
      console.log(`\n${index + 1}. ${advisor.name}`);
      console.log(`   📷 Foto actual: ${advisor.photo || 'Sin foto'}`);
      console.log(`   🎯 Especialidad: ${advisor.specialty}`);
      console.log(`   ⭐ Rating: ${advisor.rating}`);
    });
    
    // Verificar archivos en Storage
    console.log('\n📂 Verificando archivos en Storage...');
    const { data: files, error: storageError } = await supabase.storage
      .from('property-images')
      .list('Asesores', {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });
      
    if (storageError) {
      console.error('❌ Error obteniendo archivos:', storageError);
      return;
    }
    
    console.log('\n📁 Archivos disponibles en Storage/Asesores:');
    files.forEach((file, index) => {
      const fullUrl = `https://gfczfjpyyyyvteyrvhgt.supabase.co/storage/v1/object/public/property-images/Asesores/${file.name}`;
      console.log(`${index + 1}. ${file.name} → ${fullUrl}`);
    });
    
    // Sugerir mejoras
    console.log('\n🔧 Sugerencias de mejora:');
    advisors.forEach((advisor) => {
      if (advisor.photo) {
        console.log(`\n${advisor.name}:`);
        console.log(`  URL actual: ${advisor.photo}`);
        
        // Verificar si la URL ya tiene parámetros de optimización
        if (!advisor.photo.includes('?')) {
          console.log(`  ✅ Sugerencia: Agregar parámetros de calidad`);
        }
      } else {
        console.log(`\n${advisor.name}: ❌ Sin foto asignada`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkAdvisorPhotos();
