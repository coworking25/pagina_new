// Script para verificar ambas tablas de citas
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

async function checkBothAppointmentTables() {
  console.log('🔍 Verificando ambas tablas de citas...\n');

  try {
    // 1. Verificar tabla property_appointments
    console.log('📋 TABLA: property_appointments');
    console.log('=====================================');
    
    const { data: propertyAppts, error: propError } = await supabase
      .from('property_appointments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (propError) {
      console.error('❌ Error:', propError.message);
    } else {
      console.log(`📊 Total de registros: ${propertyAppts.length}`);
      propertyAppts.forEach(apt => {
        const status = apt.deleted_at ? '🗑️ ELIMINADA' : '✅ ACTIVA';
        console.log(`${status} - ID: ${apt.id} - Cliente: ${apt.client_name || 'N/A'} - Fecha: ${apt.appointment_date || apt.created_at}`);
      });
    }

    // 2. Verificar tabla appointments
    console.log('\n📋 TABLA: appointments');
    console.log('=====================================');
    
    const { data: appointments, error: apptError } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (apptError) {
      console.error('❌ Error:', apptError.message);
    } else {
      console.log(`📊 Total de registros: ${appointments.length}`);
      appointments.forEach(apt => {
        const status = apt.deleted_at ? '🗑️ ELIMINADA' : '✅ ACTIVA';
        console.log(`${status} - ID: ${apt.id} - Contacto: ${apt.contact_name || 'N/A'} - Fecha: ${apt.start_time || apt.created_at}`);
      });
    }

    // 3. Verificar estructuras de las tablas
    console.log('\n🔍 VERIFICANDO ESTRUCTURAS...');
    console.log('=====================================');
    
    // Intentar obtener la estructura de property_appointments
    const { data: propStructure, error: propStructError } = await supabase
      .from('property_appointments')
      .select('*')
      .limit(1);
      
    if (!propStructError && propStructure.length > 0) {
      console.log('🏗️ Columnas en property_appointments:', Object.keys(propStructure[0]));
    }
    
    // Intentar obtener la estructura de appointments
    const { data: apptStructure, error: apptStructError } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);
      
    if (!apptStructError && apptStructure.length > 0) {
      console.log('🏗️ Columnas en appointments:', Object.keys(apptStructure[0]));
    }

  } catch (error) {
    console.error('❌ Error en verificación:', error);
  }
}

// Ejecutar verificación
checkBothAppointmentTables();