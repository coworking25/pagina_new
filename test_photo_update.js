// Test para actualizar fotos de asesores - ejecutar en la consola del navegador
// Una vez que se cargue la página, copiar y pegar esto en la consola

console.log('🔧 Test de actualización de fotos de asesores');

// Función simplificada
async function updatePhotos() {
  try {
    // Verificar conexión
    console.log('🔌 Verificando conexión a Supabase...');
    const { data: test, error: testError } = await window.supabase.from('advisors').select('count').single();
    
    if (testError) {
      console.error('❌ Error de conexión:', testError);
      return;
    }
    
    console.log('✅ Conexión OK');
    
    // Actualizar Santiago
    console.log('📸 Actualizando Santiago Sánchez...');
    const { error: e1 } = await window.supabase
      .from('advisors')
      .update({ photo_url: '1.jpeg' })
      .eq('name', 'Santiago Sánchez');
    
    if (e1) console.error('Error Santiago:', e1);
    else console.log('✅ Santiago actualizado');
    
    // Actualizar Andrés
    console.log('📸 Actualizando Andrés Metrio...');
    const { error: e2 } = await window.supabase
      .from('advisors')
      .update({ photo_url: '2.jpg' })
      .eq('name', 'Andrés Metrio');
    
    if (e2) console.error('Error Andrés:', e2);
    else console.log('✅ Andrés actualizado');
    
    console.log('🏁 Actualización completada');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Auto-ejecutar después de 2 segundos
setTimeout(() => {
  if (window.supabase) {
    updatePhotos();
  } else {
    console.log('⏳ Supabase no está disponible aún');
  }
}, 2000);
