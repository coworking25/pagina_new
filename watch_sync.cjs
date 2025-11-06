// Script para monitorear sincronización en tiempo real
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

let previousAppointmentsCount = 0;
let previousPropertyAppointmentsCount = 0;

async function checkSync() {
  try {
    // Obtener conteos
    const { count: appointmentsCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    const { count: propertyAppointmentsCount } = await supabase
      .from('property_appointments')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    const now = new Date().toLocaleTimeString();

    // Detectar cambios
    if (appointmentsCount !== previousAppointmentsCount || 
        propertyAppointmentsCount !== previousPropertyAppointmentsCount) {
      
      console.log('\n' + '='.repeat(80));
      console.log(`🔄 [${now}] CAMBIO DETECTADO!`);
      console.log('='.repeat(80));
      
      if (propertyAppointmentsCount > previousPropertyAppointmentsCount) {
        console.log(`✅ Nueva cita en property_appointments: ${previousPropertyAppointmentsCount} → ${propertyAppointmentsCount}`);
      }
      
      if (appointmentsCount > previousAppointmentsCount) {
        console.log(`✅ Nueva cita en appointments: ${previousAppointmentsCount} → ${appointmentsCount}`);
      }

      if (propertyAppointmentsCount === appointmentsCount) {
        console.log('✅ SINCRONIZACIÓN PERFECTA: Ambas tablas tienen el mismo número de citas');
      } else {
        console.log('⚠️ DESINCRONIZACIÓN DETECTADA:');
        console.log(`   property_appointments: ${propertyAppointmentsCount}`);
        console.log(`   appointments: ${appointmentsCount}`);
        console.log(`   Diferencia: ${Math.abs(propertyAppointmentsCount - appointmentsCount)}`);
        console.log('\n💡 Ejecuta: node sync_existing_appointments.cjs');
      }

      // Mostrar última cita en cada tabla
      const { data: lastPropAppt } = await supabase
        .from('property_appointments')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const { data: lastAppt } = await supabase
        .from('appointments')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastPropAppt) {
        console.log('\n📋 Última cita en property_appointments:');
        console.log(`   ID: ${lastPropAppt.id}`);
        console.log(`   Cliente: ${lastPropAppt.client_name}`);
        console.log(`   Email: ${lastPropAppt.client_email}`);
        console.log(`   Fecha: ${lastPropAppt.appointment_date}`);
        console.log(`   Creado: ${lastPropAppt.created_at}`);
      }

      if (lastAppt) {
        console.log('\n📅 Última cita en appointments:');
        console.log(`   ID: ${lastAppt.id}`);
        console.log(`   Título: ${lastAppt.title}`);
        console.log(`   Contacto: ${lastAppt.contact_name}`);
        console.log(`   Fecha: ${lastAppt.start_time}`);
        console.log(`   property_appointment_id: ${lastAppt.property_appointment_id || '❌ NO VINCULADO'}`);
        console.log(`   Creado: ${lastAppt.created_at}`);
      }

      console.log('='.repeat(80) + '\n');
      
      previousAppointmentsCount = appointmentsCount;
      previousPropertyAppointmentsCount = propertyAppointmentsCount;
    } else {
      process.stdout.write(`\r⏳ [${now}] Monitoreando... | property_appointments: ${propertyAppointmentsCount} | appointments: ${appointmentsCount}`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

console.log('🔍 MONITOR DE SINCRONIZACIÓN EN TIEMPO REAL');
console.log('='.repeat(80));
console.log('Presiona Ctrl+C para detener\n');

// Inicializar contadores
(async () => {
  const { count: appointmentsCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);

  const { count: propertyAppointmentsCount } = await supabase
    .from('property_appointments')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);

  previousAppointmentsCount = appointmentsCount || 0;
  previousPropertyAppointmentsCount = propertyAppointmentsCount || 0;

  console.log(`📊 Estado inicial:`);
  console.log(`   property_appointments: ${previousPropertyAppointmentsCount}`);
  console.log(`   appointments: ${previousAppointmentsCount}`);
  console.log('');

  // Verificar cada 2 segundos
  setInterval(checkSync, 2000);
})();
