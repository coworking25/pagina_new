// Script para verificar errores de sincronización consultando logs de Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSyncErrors() {
  console.log('\n🔍 === VERIFICANDO ERRORES DE SINCRONIZACIÓN ===\n');

  try {
    // Obtener la última cita sin sincronizar
    const { data: orphaned, error: orphanedError } = await supabase
      .from('property_appointments')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (orphanedError) {
      console.error('❌ Error consultando property_appointments:', orphanedError);
      return;
    }

    console.log('📋 Últimas citas en property_appointments:\n');
    
    for (const appt of orphaned.slice(0, 5)) {
      // Verificar si existe en appointments
      const { data: synced, error: syncError } = await supabase
        .from('appointments')
        .select('id, property_appointment_id')
        .eq('property_appointment_id', appt.id)
        .maybeSingle();

      const status = synced ? '✅ SINCRONIZADA' : '❌ SIN SINCRONIZAR';
      
      console.log(`${status}`);
      console.log(`   🆔 Property ID: ${appt.id}`);
      console.log(`   👤 Cliente: ${appt.client_name}`);
      console.log(`   📧 Email: ${appt.client_email}`);
      console.log(`   📅 Fecha: ${appt.appointment_date}`);
      console.log(`   🕐 Creado: ${appt.created_at}`);
      
      if (synced) {
        console.log(`   🔗 Appointment ID: ${synced.id}`);
      } else {
        console.log(`   ⚠️  NO HAY REGISTRO EN APPOINTMENTS`);
        
        // Intentar sincronizar manualmente
        console.log(`   🔄 Intentando sincronizar...`);
        
        const appointmentData = {
          title: `Cita - ${appt.client_name || 'Cliente'}`,
          description: appt.special_requests || '',
          start_time: appt.appointment_date,
          end_time: new Date(new Date(appt.appointment_date).getTime() + 60 * 60 * 1000).toISOString(),
          all_day: false,
          property_id: appt.property_id,
          advisor_id: appt.advisor_id,
          location: '',
          appointment_type: appt.appointment_type === 'visita' ? 'viewing' : 'meeting',
          status: 'scheduled',
          contact_name: appt.client_name,
          contact_email: appt.client_email,
          contact_phone: appt.client_phone,
          reminder_sent: false,
          follow_up_required: false,
          property_appointment_id: appt.id,
          notes: appt.special_requests,
        };

        const { data: inserted, error: insertError } = await supabase
          .from('appointments')
          .insert([appointmentData])
          .select()
          .single();

        if (insertError) {
          console.error(`   ❌ ERROR AL SINCRONIZAR:`, insertError);
          console.error(`      Código: ${insertError.code}`);
          console.error(`      Mensaje: ${insertError.message}`);
          console.error(`      Detalles: ${insertError.details}`);
          console.error(`      Hint: ${insertError.hint}`);
        } else {
          console.log(`   ✅ SINCRONIZADA EXITOSAMENTE: ${inserted.id}`);
        }
      }
      
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkSyncErrors();
