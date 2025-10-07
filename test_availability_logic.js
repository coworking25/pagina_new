/**
 * Script para probar la lógica de disponibilidad
 * Simula verificar disponibilidad en diferentes escenarios
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
  console.error('❌ Error: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY deben estar definidas en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAvailability() {
  console.log('🧪 PROBANDO LÓGICA DE DISPONIBILIDAD\n');
  console.log('═'.repeat(100));

  // Primero, obtener un asesor con citas
  const { data: advisors, error: advisorError } = await supabase
    .from('advisors')
    .select('id, name')
    .limit(5);

  if (advisorError) {
    console.error('❌ Error al obtener asesores:', advisorError);
    return;
  }

  console.log(`\n📋 Asesores encontrados: ${advisors?.length || 0}\n`);

  for (const advisor of advisors || []) {
    console.log(`\n👤 Probando con: ${advisor.name} (${advisor.id})`);
    console.log('─'.repeat(100));

    // Obtener citas existentes de este asesor
    const { data: existingAppointments, error } = await supabase
      .from('property_appointments')
      .select('*')
      .eq('advisor_id', advisor.id)
      .neq('status', 'cancelled')
      .is('deleted_at', null)
      .order('appointment_date', { ascending: true });

    if (error) {
      console.error('❌ Error:', error);
      continue;
    }

    if (!existingAppointments || existingAppointments.length === 0) {
      console.log('✅ No tiene citas - cualquier horario debería estar disponible');
      continue;
    }

    console.log(`📅 Citas existentes: ${existingAppointments.length}`);
    existingAppointments.forEach((apt, i) => {
      const date = new Date(apt.appointment_date);
      console.log(`   ${i + 1}. ${date.toLocaleString('es-CO')} - ${apt.status}`);
    });

    // Probar disponibilidad en varios escenarios
    console.log('\n🔍 PROBANDO ESCENARIOS:\n');

    // Escenario 1: Misma hora que una cita existente
    if (existingAppointments[0]) {
      const existingDate = new Date(existingAppointments[0].appointment_date);
      console.log(`\n1️⃣  Probando MISMA HORA que cita existente (${existingDate.toLocaleString('es-CO')})`);
      await checkAvailabilityTest(advisor.id, existingDate.toISOString());
    }

    // Escenario 2: 30 minutos después
    if (existingAppointments[0]) {
      const existingDate = new Date(existingAppointments[0].appointment_date);
      const plus30min = new Date(existingDate);
      plus30min.setMinutes(plus30min.getMinutes() + 30);
      console.log(`\n2️⃣  Probando 30 MINUTOS DESPUÉS (${plus30min.toLocaleString('es-CO')})`);
      await checkAvailabilityTest(advisor.id, plus30min.toISOString());
    }

    // Escenario 3: 1 hora después
    if (existingAppointments[0]) {
      const existingDate = new Date(existingAppointments[0].appointment_date);
      const plus1hour = new Date(existingDate);
      plus1hour.setHours(plus1hour.getHours() + 1);
      console.log(`\n3️⃣  Probando 1 HORA DESPUÉS (${plus1hour.toLocaleString('es-CO')})`);
      await checkAvailabilityTest(advisor.id, plus1hour.toISOString());
    }

    // Escenario 4: 2 horas después
    if (existingAppointments[0]) {
      const existingDate = new Date(existingAppointments[0].appointment_date);
      const plus2hours = new Date(existingDate);
      plus2hours.setHours(plus2hours.getHours() + 2);
      console.log(`\n4️⃣  Probando 2 HORAS DESPUÉS (${plus2hours.toLocaleString('es-CO')})`);
      await checkAvailabilityTest(advisor.id, plus2hours.toISOString());
    }

    // Escenario 5: Horario totalmente libre (mañana a las 10 AM)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    console.log(`\n5️⃣  Probando HORARIO LIBRE - Mañana 10 AM (${tomorrow.toLocaleString('es-CO')})`);
    await checkAvailabilityTest(advisor.id, tomorrow.toISOString());

    console.log('\n' + '═'.repeat(100));
  }
}

async function checkAvailabilityTest(advisorId, appointmentDate) {
  const proposedDate = new Date(appointmentDate);

  // LÓGICA ACTUAL (la que modificamos)
  const startTime = new Date(proposedDate);
  startTime.setMinutes(startTime.getMinutes() - 30);
  
  const endTime = new Date(proposedDate);
  endTime.setHours(endTime.getHours() + 1);
  endTime.setMinutes(endTime.getMinutes() + 30);

  console.log(`   📊 Buscando citas entre:`);
  console.log(`      Inicio: ${startTime.toLocaleString('es-CO')}`);
  console.log(`      Fin:    ${endTime.toLocaleString('es-CO')}`);

  const { data: conflicts, error } = await supabase
    .from('property_appointments')
    .select('*')
    .eq('advisor_id', advisorId)
    .is('deleted_at', null)
    .neq('status', 'cancelled')
    .gte('appointment_date', startTime.toISOString())
    .lte('appointment_date', endTime.toISOString());

  if (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return;
  }

  if (conflicts && conflicts.length > 0) {
    console.log(`   ❌ NO DISPONIBLE - ${conflicts.length} conflicto(s):`);
    conflicts.forEach(c => {
      const cDate = new Date(c.appointment_date);
      console.log(`      • ${cDate.toLocaleString('es-CO')} - ${c.status}`);
    });
  } else {
    console.log(`   ✅ DISPONIBLE - No hay conflictos`);
  }
}

testAvailability();
