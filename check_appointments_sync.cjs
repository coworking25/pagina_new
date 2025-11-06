// Script para verificar sincronización de citas entre appointments y property_appointments
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.log('Asegúrate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAppointmentsSync() {
  console.log('\n🔍 DIAGNÓSTICO DE SINCRONIZACIÓN DE CITAS\n');
  console.log('='.repeat(80));

  try {
    // 1. Total en appointments
    const { data: appointments, error: apptError } = await supabase
      .from('appointments')
      .select('*')
      .is('deleted_at', null);

    if (apptError) {
      console.error('❌ Error en appointments:', apptError);
    } else {
      console.log('\n📅 TABLA: appointments');
      console.log(`   Total de citas: ${appointments.length}`);
      console.log('\n   Citas encontradas:');
      appointments.forEach((appt, i) => {
        console.log(`   ${i + 1}. ID: ${appt.id}`);
        console.log(`      Título: ${appt.title || 'Sin título'}`);
        console.log(`      Contacto: ${appt.contact_name || 'Sin nombre'}`);
        console.log(`      Email: ${appt.contact_email || 'Sin email'}`);
        console.log(`      Fecha: ${appt.start_time}`);
        console.log(`      property_appointment_id: ${appt.property_appointment_id || '❌ NO VINCULADO'}`);
        console.log(`      Creado: ${appt.created_at}`);
        console.log('');
      });
    }

    // 2. Total en property_appointments
    const { data: propertyAppts, error: propError } = await supabase
      .from('property_appointments')
      .select('*')
      .is('deleted_at', null);

    if (propError) {
      console.error('❌ Error en property_appointments:', propError);
    } else {
      console.log('\n🏠 TABLA: property_appointments');
      console.log(`   Total de citas: ${propertyAppts.length}`);
      console.log('\n   Citas encontradas:');
      propertyAppts.forEach((appt, i) => {
        console.log(`   ${i + 1}. ID: ${appt.id}`);
        console.log(`      Cliente: ${appt.client_name}`);
        console.log(`      Email: ${appt.client_email}`);
        console.log(`      Fecha: ${appt.appointment_date}`);
        console.log(`      Tipo: ${appt.appointment_type}`);
        console.log(`      Estado: ${appt.status}`);
        console.log(`      Creado: ${appt.created_at}`);
        console.log('');
      });
    }

    // 3. Verificar sincronización
    console.log('\n🔗 ANÁLISIS DE SINCRONIZACIÓN\n');
    
    const appointmentsWithLink = appointments.filter(a => a.property_appointment_id);
    const appointmentsWithoutLink = appointments.filter(a => !a.property_appointment_id);
    
    console.log(`   ✅ Appointments CON vínculo: ${appointmentsWithLink.length}`);
    console.log(`   ⚠️  Appointments SIN vínculo: ${appointmentsWithoutLink.length}`);
    
    if (appointmentsWithoutLink.length > 0) {
      console.log('\n   ⚠️  CITAS HUÉRFANAS (appointments sin property_appointment_id):');
      appointmentsWithoutLink.forEach((appt, i) => {
        console.log(`   ${i + 1}. ${appt.title} - ${appt.contact_name} - ${appt.start_time}`);
      });
    }

    // 4. Verificar property_appointments sin appointments
    console.log('\n   Verificando property_appointments sin appointments vinculadas...');
    const unsynced = [];
    
    for (const pa of propertyAppts) {
      const hasAppointment = appointments.some(a => a.property_appointment_id === pa.id);
      if (!hasAppointment) {
        unsynced.push(pa);
      }
    }

    console.log(`   ⚠️  Property_appointments SIN sincronizar: ${unsynced.length}`);
    
    if (unsynced.length > 0) {
      console.log('\n   ⚠️  CITAS SIN SINCRONIZAR (property_appointments sin appointments):');
      unsynced.forEach((appt, i) => {
        console.log(`   ${i + 1}. ${appt.client_name} - ${appt.client_email} - ${appt.appointment_date}`);
        console.log(`      ID: ${appt.id}`);
        console.log(`      Tipo: ${appt.appointment_type}`);
        console.log(`      Creado: ${appt.created_at}`);
        console.log('');
      });
    }

    // 5. Resumen
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 RESUMEN\n');
    console.log(`   Citas en appointments: ${appointments.length}`);
    console.log(`   Citas en property_appointments: ${propertyAppts.length}`);
    console.log(`   Sincronizadas correctamente: ${appointmentsWithLink.length}`);
    console.log(`   Appointments huérfanas: ${appointmentsWithoutLink.length}`);
    console.log(`   Property_appointments sin sincronizar: ${unsynced.length}`);
    
    if (appointmentsWithLink.length === propertyAppts.length && 
        appointmentsWithoutLink.length === 0) {
      console.log('\n   ✅ SINCRONIZACIÓN PERFECTA');
    } else {
      console.log('\n   ⚠️  HAY PROBLEMAS DE SINCRONIZACIÓN');
      console.log('\n   💡 RECOMENDACIONES:');
      if (unsynced.length > 0) {
        console.log('      - Ejecutar sync_existing_appointments.cjs para sincronizar citas antiguas');
      }
      if (appointmentsWithoutLink.length > 0) {
        console.log('      - Las citas del calendario/modal no se están sincronizando a property_appointments');
        console.log('      - Verificar que calendarService.ts esté usando syncAppointmentToProperty()');
      }
    }

    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error);
  }
}

checkAppointmentsSync();
