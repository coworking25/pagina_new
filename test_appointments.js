// Script para probar las funcionalidades de citas
import { getAllPropertyAppointments, savePropertyAppointment } from './src/lib/supabase.js';

console.log('🧪 Iniciando pruebas de citas...');

// Función para probar si podemos obtener citas
async function testGetAppointments() {
  console.log('\n📋 Probando obtener todas las citas...');
  try {
    const appointments = await getAllPropertyAppointments();
    console.log('✅ Obtener citas exitoso:', appointments);
    return appointments;
  } catch (error) {
    console.error('❌ Error al obtener citas:', error);
    return null;
  }
}

// Función para probar si podemos crear una cita
async function testCreateAppointment() {
  console.log('\n💾 Probando crear una cita de prueba...');
  try {
    const testData = {
      client_name: 'Juan Pérez (PRUEBA)',
      client_email: 'juan.test@example.com',
      client_phone: '+57 300 123 4567',
      property_id: 1, // Asumiendo que existe una propiedad con ID 1
      advisor_id: 'test-advisor-id',
      appointment_date: new Date().toISOString(),
      appointment_type: 'visita',
      visit_type: 'presencial',
      attendees: 2,
      special_requests: 'Esta es una cita de prueba del sistema',
      contact_method: 'whatsapp',
      marketing_consent: true
    };

    const result = await savePropertyAppointment(testData);
    console.log('✅ Crear cita exitoso:', result);
    return result;
  } catch (error) {
    console.error('❌ Error al crear cita:', error);
    return null;
  }
}

// Ejecutar pruebas
async function runTests() {
  console.log('🚀 Ejecutando pruebas del sistema de citas...\n');
  
  // Test 1: Obtener citas existentes
  const appointments = await testGetAppointments();
  
  // Test 2: Crear una cita de prueba
  const newAppointment = await testCreateAppointment();
  
  // Test 3: Verificar que se creó correctamente
  if (newAppointment) {
    console.log('\n🔄 Verificando que la cita se creó...');
    const updatedAppointments = await testGetAppointments();
    
    if (updatedAppointments && updatedAppointments.length > 0) {
      const latestAppointment = updatedAppointments[0];
      console.log('🎯 Última cita creada:', latestAppointment);
      
      if (latestAppointment.client_name === 'Juan Pérez (PRUEBA)') {
        console.log('✅ ¡Prueba exitosa! La cita se guardó correctamente en la base de datos.');
      } else {
        console.log('⚠️  La cita se guardó pero no coincide con los datos de prueba.');
      }
    }
  }
  
  console.log('\n🏁 Pruebas completadas.');
}

// Ejecutar las pruebas
runTests().catch(console.error);
