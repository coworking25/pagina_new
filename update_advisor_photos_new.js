// Script actualizado para las fotos correctas de los asesores
// Ejecuta este código en la consola del navegador cuando estés en localhost:5174

async function updateAdvisorPhotosCorrect() {
  console.log('🔄 Actualizando fotos de asesores con URLs correctas...');
  
  try {
    // Actualizar Santiago Sánchez
    console.log('📸 Actualizando Santiago Sánchez...');
    const { data: santiago, error: errorSantiago } = await window.supabase
      .from('advisors')
      .update({ 
        photo_url: '1.jpeg',
        updated_at: new Date().toISOString()
      })
      .eq('name', 'Santiago Sánchez')
      .select();

    if (errorSantiago) {
      console.error('❌ Error actualizando Santiago:', errorSantiago);
    } else {
      console.log('✅ Santiago Sánchez actualizado:', santiago);
    }

    // Actualizar Andrés Metrio
    console.log('📸 Actualizando Andrés Metrio...');
    const { data: andres, error: errorAndres } = await window.supabase
      .from('advisors')
      .update({ 
        photo_url: '2.jpg',
        updated_at: new Date().toISOString()
      })
      .eq('name', 'Andrés Metrio')
      .select();

    if (errorAndres) {
      console.error('❌ Error actualizando Andrés:', errorAndres);
    } else {
      console.log('✅ Andrés Metrio actualizado:', andres);
    }

    // Verificar los cambios
    console.log('🔍 Verificando cambios...');
    const { data: allAdvisors, error: errorAll } = await window.supabase
      .from('advisors')
      .select('id, name, photo_url, updated_at')
      .in('name', ['Santiago Sánchez', 'Andrés Metrio']);

    if (errorAll) {
      console.error('❌ Error verificando cambios:', errorAll);
    } else {
      console.log('📋 Estado actual de los asesores:', allAdvisors);
      
      // Probar las URLs de las fotos
      console.log('🖼️ URLs de fotos generadas:');
      allAdvisors.forEach(advisor => {
        const photoUrl = `https://gfczfjpyyyyvteyrvhgt.supabase.co/storage/v1/object/public/property-images/Asesores/${advisor.photo_url}`;
        console.log(`   ${advisor.name}: ${photoUrl}`);
      });
    }

    console.log('✅ Actualización completada! Recarga la página para ver las fotos actualizadas.');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar la función
updateAdvisorPhotosCorrect();
