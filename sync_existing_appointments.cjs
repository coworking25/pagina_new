/**
 * Script para sincronizar citas existentes
 * Ejecutar UNA SOLA VEZ para sincronizar datos históricos
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Funciones de mapeo (igual que en appointmentSync.ts)
function mapAppointmentType(propertyType) {
  const mapping = {
    'visita': 'viewing',
    'consulta': 'consultation',
    'valuacion': 'valuation',
    'seguimiento': 'follow_up',
  };
  return mapping[propertyType] || 'meeting';
}

function mapStatus(propertyStatus) {
  const mapping = {
    'pending': 'scheduled',
    'confirmed': 'confirmed',
    'completed': 'completed',
    'cancelled': 'cancelled',
    'no_show': 'no_show',
  };
  return mapping[propertyStatus] || 'scheduled';
}

async function syncExistingAppointments() {
  console.log('\n🔄 === SINCRONIZANDO CITAS EXISTENTES ===\n');

  try {
    // 1. Obtener todas las property_appointments sin sincronizar
    const { data: propertyAppts, error: propError } = await supabase
      .from('property_appointments')
      .select('*')
      .is('deleted_at', null);

    if (propError) {
      console.error('❌ Error obteniendo property_appointments:', propError);
      return;
    }

    console.log(`📋 Encontradas ${propertyAppts?.length || 0} citas en property_appointments\n`);

    if (!propertyAppts || propertyAppts.length === 0) {
      console.log('✅ No hay citas para sincronizar');
      return;
    }

    let syncedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const propAppt of propertyAppts) {
      try {
        // Verificar si ya existe sincronización
        const { data: existing } = await supabase
          .from('appointments')
          .select('id')
          .eq('property_appointment_id', propAppt.id)
          .single();

        if (existing) {
          console.log(`⏭️  Saltando ${propAppt.client_name} - Ya sincronizada`);
          skippedCount++;
          continue;
        }

        // Crear cita en appointments
        const appointmentData = {
          title: `Cita - ${propAppt.client_name || 'Cliente'}`,
          description: propAppt.special_requests || '',
          start_time: propAppt.appointment_date,
          end_time: new Date(new Date(propAppt.appointment_date).getTime() + 60 * 60 * 1000).toISOString(),
          all_day: false,
          property_id: propAppt.property_id,
          advisor_id: propAppt.advisor_id,
          location: '',
          appointment_type: mapAppointmentType(propAppt.appointment_type || 'visita'),
          status: mapStatus(propAppt.status || 'pending'),
          contact_name: propAppt.client_name,
          contact_email: propAppt.client_email,
          contact_phone: propAppt.client_phone,
          reminder_sent: false,
          follow_up_required: false,
          property_appointment_id: propAppt.id,
          notes: propAppt.special_requests,
        };

        const { data: newAppt, error: insertError } = await supabase
          .from('appointments')
          .insert([appointmentData])
          .select()
          .single();

        if (insertError) {
          console.error(`❌ Error sincronizando ${propAppt.client_name}:`, insertError.message);
          errorCount++;
          continue;
        }

        console.log(`✅ Sincronizada: ${propAppt.client_name} → Appointment ID: ${newAppt.id.substring(0, 8)}...`);
        syncedCount++;

      } catch (error) {
        console.error(`❌ Error procesando ${propAppt.client_name}:`, error.message);
        errorCount++;
      }
    }

    // Resumen
    console.log('\n📊 === RESUMEN DE SINCRONIZACIÓN ===\n');
    console.log(`✅ Sincronizadas: ${syncedCount}`);
    console.log(`⏭️  Saltadas (ya sincronizadas): ${skippedCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📋 Total procesadas: ${propertyAppts.length}\n`);

    if (syncedCount > 0) {
      console.log('✅ ¡Sincronización completada exitosamente!\n');
    }

  } catch (error) {
    console.error('\n❌ Error en sincronización:', error);
  }
}

// Ejecutar
syncExistingAppointments();
