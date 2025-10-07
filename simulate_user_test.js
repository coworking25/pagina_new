/**
 * Script para simular exactamente lo que hace el usuario
 * Probar con diferentes fechas y horas reales
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Leer .env manualmente
const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      envVars[match[1].trim()] = match[2].trim();
    }
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Simular exactamente lo que hace el componente
async function simulateUserSelection(date, time, advisorId) {
  console.log(`\n🧪 SIMULANDO: Usuario selecciona ${date} a las ${time}`);
  console.log('─'.repeat(80));

  // Esto es exactamente lo que hace el componente (línea 204)
  const appointmentDateTime = new Date(`${date}T${time}:00`);
  console.log(`📅 Fecha construida: ${appointmentDateTime.toISOString()}`);
  console.log(`📅 Fecha local: ${appointmentDateTime.toLocaleString('es-CO')}`);

  // Simular la función checkAdvisorAvailability
  const proposedDate = new Date(appointmentDateTime.toISOString());

  const startTime = new Date(proposedDate);
  startTime.setMinutes(startTime.getMinutes() - 30);
  
  const endTime = new Date(proposedDate);
  endTime.setHours(endTime.getHours() + 1);
  endTime.setMinutes(endTime.getMinutes() + 30);

  console.log(`\n🔍 Buscando conflictos:`);
  console.log(`   Desde: ${startTime.toISOString()} (${startTime.toLocaleString('es-CO')})`);
  console.log(`   Hasta: ${endTime.toISOString()} (${endTime.toLocaleString('es-CO')})`);

  const { data: conflicts, error } = await supabase
    .from('property_appointments')
    .select('*')
    .eq('advisor_id', advisorId)
    .is('deleted_at', null)
    .neq('status', 'cancelled')
    .gte('appointment_date', startTime.toISOString())
    .lte('appointment_date', endTime.toISOString());

  if (error) {
    console.log(`\n❌ ERROR en query: ${error.message}`);
    console.log(error);
    return;
  }

  console.log(`\n📊 Citas encontradas: ${conflicts?.length || 0}`);
  
  if (conflicts && conflicts.length > 0) {
    console.log(`\n❌ HORARIO OCUPADO`);
    conflicts.forEach(c => {
      const cDate = new Date(c.appointment_date);
      console.log(`   • ${cDate.toISOString()} (${cDate.toLocaleString('es-CO')}) - ${c.status}`);
      console.log(`     Cliente: ${c.client_name}`);
    });
  } else {
    console.log(`\n✅ HORARIO DISPONIBLE`);
  }
}

async function runTests() {
  console.log('🎯 PRUEBA SIMULANDO SELECCIÓN DEL USUARIO');
  console.log('═'.repeat(80));

  // Obtener primer asesor
  const { data: advisors } = await supabase
    .from('advisors')
    .select('id, name')
    .limit(1);

  if (!advisors || advisors.length === 0) {
    console.log('❌ No se encontraron asesores');
    return;
  }

  const advisor = advisors[0];
  console.log(`\n👤 Asesor seleccionado: ${advisor.name}`);
  console.log(`🆔 ID: ${advisor.id}`);

  // Obtener una cita existente del asesor
  const { data: existingAppointments } = await supabase
    .from('property_appointments')
    .select('*')
    .eq('advisor_id', advisor.id)
    .neq('status', 'cancelled')
    .is('deleted_at', null)
    .order('appointment_date', { ascending: true })
    .limit(1);

  if (existingAppointments && existingAppointments.length > 0) {
    const existing = existingAppointments[0];
    const existingDate = new Date(existing.appointment_date);
    console.log(`\n📌 Este asesor tiene una cita el: ${existingDate.toLocaleString('es-CO')}`);
  }

  console.log('\n' + '═'.repeat(80));

  // PRUEBA 1: Hoy a las 10 AM
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  await simulateUserSelection(todayStr, '10:00', advisor.id);

  // PRUEBA 2: Hoy a las 15:00
  await simulateUserSelection(todayStr, '15:00', advisor.id);

  // PRUEBA 3: Mañana a las 09:00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  await simulateUserSelection(tomorrowStr, '09:00', advisor.id);

  // PRUEBA 4: Mañana a las 14:00
  await simulateUserSelection(tomorrowStr, '14:00', advisor.id);

  // PRUEBA 5: Pasado mañana a las 11:00
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfterStr = dayAfter.toISOString().split('T')[0];
  await simulateUserSelection(dayAfterStr, '11:00', advisor.id);

  console.log('\n' + '═'.repeat(80));
  console.log('✅ Pruebas completadas\n');
}

runTests();
