// =====================================================
// VALIDACIÓN DEL SISTEMA DE TRACKING DE VISITAS
// Ejecutar en consola del navegador
// =====================================================

console.log('🔍 Iniciando validación del sistema de tracking...\n');

// 1. Verificar que analytics.ts está cargado
import { trackPropertyView, getDashboardAnalytics } from './src/lib/analytics';

async function validarSistemaVisitas() {
  console.log('📊 VALIDACIÓN DEL CONTADOR DE VISITAS\n');
  console.log('='.repeat(50));
  
  // PASO 1: Verificar función de tracking
  console.log('\n1️⃣ Verificando función trackPropertyView...');
  if (typeof trackPropertyView === 'function') {
    console.log('✅ Función trackPropertyView existe');
  } else {
    console.log('❌ ERROR: trackPropertyView no está disponible');
    return;
  }
  
  // PASO 2: Probar tracking de vista
  console.log('\n2️⃣ Probando tracking de una vista...');
  try {
    await trackPropertyView('1', 30); // Propiedad ID 1, 30 segundos
    console.log('✅ Vista registrada exitosamente');
  } catch (error) {
    console.log('❌ Error al registrar vista:', error);
  }
  
  // PASO 3: Verificar getDashboardAnalytics
  console.log('\n3️⃣ Obteniendo analytics del dashboard...');
  try {
    const analytics = await getDashboardAnalytics();
    console.log('📊 Analytics del dashboard:');
    console.log({
      'Total Likes': analytics?.totalLikes || 0,
      'Total Vistas': analytics?.totalViews || 0,
      'Total Contactos': analytics?.totalContacts || 0,
      'Visitantes Únicos': analytics?.uniqueVisitors || 0
    });
    
    if (analytics && analytics.totalViews > 0) {
      console.log('✅ Sistema de vistas funcionando correctamente');
    } else {
      console.log('⚠️ No se encontraron vistas registradas');
      console.log('   Esto puede significar:');
      console.log('   - Las vistas no se están registrando');
      console.log('   - Hay un problema con las políticas RLS');
      console.log('   - Necesitas navegar por el sitio para generar datos');
    }
  } catch (error) {
    console.log('❌ Error al obtener analytics:', error);
  }
  
  // PASO 4: Verificar localStorage (Session ID)
  console.log('\n4️⃣ Verificando Session ID...');
  const sessionId = localStorage.getItem('session_id');
  if (sessionId) {
    console.log('✅ Session ID existe:', sessionId);
  } else {
    console.log('❌ No hay Session ID en localStorage');
    console.log('   Esto es necesario para el tracking anónimo');
  }
  
  // PASO 5: Verificar Supabase
  console.log('\n5️⃣ Verificando conexión con Supabase...');
  try {
    const { createClient } = await import('@supabase/supabase-js');
    console.log('✅ Cliente de Supabase cargado');
  } catch (error) {
    console.log('❌ Error al cargar Supabase:', error);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Validación completada\n');
  
  // RECOMENDACIONES
  console.log('📝 PRÓXIMOS PASOS:');
  console.log('1. Si "Total Vistas" = 0:');
  console.log('   → Navega a /properties y abre varias propiedades');
  console.log('   → Espera 5 segundos en cada una');
  console.log('   → Vuelve a ejecutar este script');
  console.log('');
  console.log('2. Si hay vistas pero el dashboard no las muestra:');
  console.log('   → Verifica que ReportsModal esté usando getDashboardAnalytics()');
  console.log('   → Revisa la consola en el modal de reportes');
  console.log('   → Ejecuta VALIDAR_CONTADOR_VISITAS.sql en Supabase');
  console.log('');
  console.log('3. Para generar datos de prueba:');
  console.log('   → Ejecuta INSERT_DATOS_PRUEBA.sql en Supabase');
  console.log('');
}

// Auto-ejecutar
validarSistemaVisitas();

// Exportar para uso manual
window.validarVisitas = validarSistemaVisitas;

console.log('\n💡 TIP: Puedes ejecutar `validarVisitas()` en cualquier momento\n');
