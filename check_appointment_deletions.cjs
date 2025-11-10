// Script para verificar el estado de las citas en la base de datos
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurar cliente de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAppointmentDeletions() {
  console.log('🔍 Verificando estado de las citas en la base de datos...\n');

  try {
    // 1. Obtener todas las citas (incluyendo eliminadas)
    const { data: allAppointments, error: allError } = await supabase
      .from('property_appointments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (allError) {
      console.error('❌ Error obteniendo todas las citas:', allError);
      return;
    }

    console.log('📊 Resumen de citas (últimas 20):');
    console.log('=====================================');
    allAppointments.forEach(apt => {
      const status = apt.deleted_at ? '🗑️ ELIMINADA' : '✅ ACTIVA';
      console.log(`${status} - ID: ${apt.id} - Cliente: ${apt.client_name} - Fecha: ${apt.appointment_date}`);
      if (apt.deleted_at) {
        console.log(`   Eliminada el: ${apt.deleted_at}`);
      }
    });

    // 2. Contar citas por estado
    const activeCount = allAppointments.filter(apt => !apt.deleted_at).length;
    const deletedCount = allAppointments.filter(apt => apt.deleted_at).length;

    console.log('\n📈 Estadísticas:');
    console.log('================');
    console.log(`✅ Citas activas: ${activeCount}`);
    console.log(`🗑️ Citas eliminadas: ${deletedCount}`);
    console.log(`📊 Total en muestra: ${allAppointments.length}`);

    // 3. Obtener solo las citas activas (como lo haría la app)
    const { data: activeAppointments, error: activeError } = await supabase
      .from('property_appointments')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (activeError) {
      console.error('❌ Error obteniendo citas activas:', activeError);
      return;
    }

    console.log(`\n🎯 Citas que ve la aplicación: ${activeAppointments.length}`);

    // 4. Verificar si hay discrepancias
    if (activeCount !== activeAppointments.length) {
      console.log('⚠️ DISCREPANCIA DETECTADA entre conteo manual y query filtrado');
    } else {
      console.log('✅ Consistencia verificada: filtros funcionando correctamente');
    }

  } catch (error) {
    console.error('❌ Error en verificación:', error);
  }
}

// Ejecutar verificación
checkAppointmentDeletions();