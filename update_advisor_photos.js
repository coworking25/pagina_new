// Script para actualizar las fotos de los asesores
// Ejecutar esto en la consola del navegador después de que se cargue la página

console.log('🔄 Actualizando fotos de asesores...');

// Función para actualizar un asesor
async function updateAdvisorPhoto(advisorName, photoFileName) {
  try {
    console.log(`📸 Actualizando foto de ${advisorName} con ${photoFileName}...`);
    
    const { data, error } = await window.supabase
      .from('advisors')
      .update({ photo_url: photoFileName })
      .eq('name', advisorName)
      .select();
    
    if (error) {
      console.error(`❌ Error actualizando ${advisorName}:`, error);
      return false;
    }
    
    console.log(`✅ ${advisorName} actualizado exitosamente:`, data);
    return true;
  } catch (error) {
    console.error(`❌ Error general actualizando ${advisorName}:`, error);
    return false;
  }
}

// Función principal para actualizar todos los asesores
async function updateAllAdvisorPhotos() {
  console.log('🚀 Iniciando actualización de fotos...');
  
  // Actualizar Santiago Sánchez
  await updateAdvisorPhoto('Santiago Sánchez', '1.jpeg');
  
  // Actualizar Andrés Metrio
  await updateAdvisorPhoto('Andrés Metrio', '2.jpg');
  
  // Verificar las actualizaciones
  console.log('🔍 Verificando actualizaciones...');
  const { data: advisors, error } = await window.supabase
    .from('advisors')
    .select('name, photo_url, specialty, experience_years')
    .eq('is_active', true)
    .order('name');
  
  if (error) {
    console.error('❌ Error verificando asesores:', error);
  } else {
    console.log('✅ Asesores actualizados:', advisors);
  }
  
  console.log('🎉 Actualización completada!');
}

// Ejecutar la actualización
updateAllAdvisorPhotos();
