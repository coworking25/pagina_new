// Script final para probar eliminación con datos válidos
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWithValidData() {
  console.log('🧪 Probando eliminación con datos válidos...\n');

  try {
    // 1. Obtener o crear asesor
    let { data: advisors } = await supabase
      .from('advisors')
      .select('id')
      .limit(1);

    let advisorId;
    if (!advisors || advisors.length === 0) {
      console.log('📝 Creando asesor de prueba...');
      const { data: newAdvisor, error } = await supabase
        .from('advisors')
        .insert({
          name: 'Asesor Prueba',
          email: 'asesor@test.com',
          phone: '3001234567'
        })
        .select('id');
      
      if (error) {
        console.error('❌ Error creando asesor:', error.message);
        return;
      }
      advisorId = newAdvisor[0].id;
    } else {
      advisorId = advisors[0].id;
    }

    console.log(`👤 Usando asesor ID: ${advisorId}`);

    // 2. Obtener propiedad
    const { data: properties } = await supabase
      .from('properties')
      .select('id')
      .limit(1);

    if (!properties || properties.length === 0) {
      console.error('❌ No hay propiedades disponibles');
      return;
    }

    const propertyId = properties[0].id;
    console.log(`🏠 Usando propiedad ID: ${propertyId}`);

    // 3. Crear cita de prueba
    const testAppointment = {
      client_name: 'Cliente Test Delete',
      client_email: 'test@delete.com',
      client_phone: '3009876543',
      appointment_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      appointment_type: 'visita',
      visit_type: 'presencial',
      attendees: 1,
      status: 'pending',
      property_id: propertyId,
      advisor_id: advisorId,
      special_requests: 'Cita para probar eliminación'
    };

    console.log('\n📅 Insertando cita...');
    const { data: insertResult, error: insertError } = await supabase
      .from('property_appointments')
      .insert(testAppointment)
      .select();

    if (insertError) {
      console.error('❌ Error insertando:', insertError.message);
      return;
    }

    const appointmentId = insertResult[0].id;
    console.log('✅ Cita creada con ID:', appointmentId);

    // 4. Contar citas antes de eliminar
    const { data: beforeCount } = await supabase
      .from('property_appointments')
      .select('id')
      .is('deleted_at', null);

    console.log(`📊 Citas activas antes: ${beforeCount.length}`);

    // 5. Simular eliminación usando la función deleteAppointment
    console.log('\n🗑️ Ejecutando soft delete...');
    const { error: deleteError } = await supabase
      .from('property_appointments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', appointmentId);

    if (deleteError) {
      console.error('❌ Error en soft delete:', deleteError.message);
      return;
    }

    console.log('✅ Soft delete ejecutado');

    // 6. Verificar después del delete
    const { data: afterCount } = await supabase
      .from('property_appointments')
      .select('id')
      .is('deleted_at', null);

    const { data: allCount } = await supabase
      .from('property_appointments')
      .select('id');

    console.log('\n📈 RESULTADOS FINALES:');
    console.log('=====================');
    console.log(`Citas activas después: ${afterCount.length}`);
    console.log(`Total de citas: ${allCount.length}`);
    console.log(`Diferencia: ${beforeCount.length - afterCount.length}`);

    if (beforeCount.length - afterCount.length === 1) {
      console.log('✅ ELIMINACIÓN FUNCIONA CORRECTAMENTE');
      console.log('   La cita fue marcada como eliminada y no aparece en filtros');
    } else {
      console.log('❌ PROBLEMA DETECTADO');
      console.log('   La cita no fue filtrada correctamente');
    }

    // 7. Verificar el registro eliminado
    const { data: deletedRecord } = await supabase
      .from('property_appointments')
      .select('*')
      .eq('id', appointmentId);

    if (deletedRecord.length > 0) {
      console.log(`\n🔍 Estado del registro eliminado:`);
      console.log(`   - deleted_at: ${deletedRecord[0].deleted_at}`);
      console.log(`   - status: ${deletedRecord[0].status}`);
    }

    // 8. Limpiar
    await supabase
      .from('property_appointments')
      .delete()
      .eq('id', appointmentId);

    console.log('\n🧹 Registro de prueba eliminado permanentemente');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testWithValidData();