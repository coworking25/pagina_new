import { supabase } from './src/lib/supabase.ts';

async function updateAdvisorPhotos() {
  console.log('🔄 Actualizando fotos de asesores...\n');

  try {
    // Obtener todos los asesores
    const { data: advisors, error: advisorsError } = await supabase
      .from('advisors')
      .select('*')
      .order('id');

    if (advisorsError) {
      console.error('❌ Error obteniendo asesores:', advisorsError);
      return;
    }

    console.log(`👥 ${advisors.length} asesores encontrados\n`);

    // Asignar fotos específicas basadas en el nombre
    const photoUpdates = [
      {
        name: 'Andrés Metrio',
        photoUrl: 'https://gfczfjpyyyyvteyrvhgt.supabase.co/storage/v1/object/public/property-images/Asesores/1.jpeg'
      },
      {
        name: 'Santiago Sánchez', 
        photoUrl: 'https://gfczfjpyyyyvteyrvhgt.supabase.co/storage/v1/object/public/property-images/Asesores/2.jpg'
      }
    ];

    // Actualizar cada asesor
    for (const advisor of advisors) {
      const photoUpdate = photoUpdates.find(update => 
        advisor.name.toLowerCase().includes(update.name.toLowerCase()) ||
        update.name.toLowerCase().includes(advisor.name.toLowerCase())
      );

      if (photoUpdate) {
        const { error: updateError } = await supabase
          .from('advisors')
          .update({ photo: photoUpdate.photoUrl })
          .eq('id', advisor.id);

        if (updateError) {
          console.error(`❌ Error actualizando foto de ${advisor.name}:`, updateError);
        } else {
          console.log(`✅ ${advisor.name} → Foto actualizada`);
          console.log(`   📷 URL: ${photoUpdate.photoUrl}\n`);
        }
      } else {
        console.log(`⚠️  ${advisor.name} → No se encontró foto correspondiente\n`);
      }
    }

    // Verificar resultados
    console.log('\n🔍 Verificando resultados...');
    const { data: updatedAdvisors, error: verifyError } = await supabase
      .from('advisors')
      .select('*')
      .order('id');

    if (verifyError) {
      console.error('❌ Error verificando resultados:', verifyError);
      return;
    }

    console.log('\n📊 Estado final:');
    updatedAdvisors.forEach(advisor => {
      console.log(`👤 ${advisor.name}`);
      console.log(`   📷 Foto: ${advisor.photo || 'Sin foto'}`);
      console.log(`   🎯 Especialidad: ${advisor.specialty}`);
      console.log(`   ⭐ Rating: ${advisor.rating}`);
      console.log('');
    });

    console.log('✅ ¡Actualización de fotos completada!');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

updateAdvisorPhotos();
