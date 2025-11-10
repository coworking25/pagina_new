// Script para verificar la estructura de la tabla appointments y arreglar el problema
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SENDGRID_API_KEY; // Service key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function investigateAppointmentTables() {
  console.log('🔍 Investigando estructura de tablas de citas...\n');

  try {
    // 1. Verificar estructura de appointments
    console.log('📋 ESTRUCTURA DE appointments:');
    console.log('==============================');
    
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);

    if (appointmentsError) {
      console.log('❌ Error consultando appointments:', appointmentsError.message);
    } else if (appointments.length > 0) {
      console.log('✅ Columnas en appointments:');
      Object.keys(appointments[0]).forEach(column => {
        console.log(`   - ${column}: ${typeof appointments[0][column]}`);
      });
    } else {
      console.log('⚠️ Tabla appointments existe pero está vacía');
      
      // Intentar obtener schema
      const { data: schema } = await supabase.rpc('get_table_columns', { 
        table_name: 'appointments' 
      }).catch(() => ({ data: null }));
      
      if (schema) {
        console.log('📋 Schema de appointments:', schema);
      }
    }

    // 2. Verificar estructura de property_appointments
    console.log('\n📋 ESTRUCTURA DE property_appointments:');
    console.log('======================================');
    
    const { data: propAppointments, error: propError } = await supabase
      .from('property_appointments')
      .select('*')
      .limit(1);

    if (propError) {
      console.log('❌ Error consultando property_appointments:', propError.message);
    } else if (propAppointments.length > 0) {
      console.log('✅ Columnas en property_appointments:');
      Object.keys(propAppointments[0]).forEach(column => {
        console.log(`   - ${column}: ${typeof propAppointments[0][column]}`);
      });
    } else {
      console.log('⚠️ Tabla property_appointments existe pero está vacía');
    }

    // 3. Verificar si existe el campo property_appointment_id en appointments
    console.log('\n🔍 VERIFICANDO CAMPO property_appointment_id:');
    console.log('=============================================');
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('property_appointment_id')
        .limit(1);
        
      if (error) {
        console.log('❌ Campo property_appointment_id NO EXISTE en appointments');
        console.log('   Error:', error.message);
        console.log('   Esto explica el error 406 Not Acceptable');
      } else {
        console.log('✅ Campo property_appointment_id SÍ EXISTE en appointments');
      }
    } catch (e) {
      console.log('❌ Campo property_appointment_id NO EXISTE o hay problema de permisos');
    }

    // 4. Sugerir solución
    console.log('\n💡 ANÁLISIS Y SOLUCIÓN:');
    console.log('=======================');
    console.log('El error 406 indica que el campo "property_appointment_id" no existe');
    console.log('en la tabla "appointments", o hay problemas de configuración.');
    console.log('');
    console.log('OPCIONES:');
    console.log('1. Agregar el campo property_appointment_id a la tabla appointments');
    console.log('2. Usar un enfoque diferente para la sincronización');
    console.log('3. Eliminar la lógica de sincronización si no es necesaria');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

investigateAppointmentTables();