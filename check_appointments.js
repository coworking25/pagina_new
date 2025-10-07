/**
 * Script para verificar las citas en la base de datos
 * Muestra todas las citas activas y ayuda a diagnosticar problemas de disponibilidad
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

console.log('🔑 URL:', supabaseUrl ? 'Cargada ✅' : 'No encontrada ❌');
console.log('🔑 Key:', supabaseKey ? 'Cargada ✅' : 'No encontrada ❌');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY deben estar definidas en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAppointments() {
  console.log('🔍 Verificando citas en la base de datos...\n');

  try {
    // 1. Obtener todas las citas activas (no canceladas)
    const { data: allAppointments, error: allError } = await supabase
      .from('property_appointments')
      .select('*')
      .neq('status', 'cancelled')
      .order('appointment_date', { ascending: true });

    if (allError) {
      console.error('❌ Error al obtener citas:', allError);
      return;
    }

    console.log(`📊 Total de citas activas: ${allAppointments?.length || 0}\n`);

    if (allAppointments && allAppointments.length > 0) {
      console.log('📅 CITAS EXISTENTES:\n');
      console.log('─'.repeat(120));
      console.log(
        'ID'.padEnd(10) +
        'Cliente'.padEnd(25) +
        'Asesor ID'.padEnd(15) +
        'Fecha/Hora'.padEnd(25) +
        'Estado'.padEnd(15) +
        'Tipo'
      );
      console.log('─'.repeat(120));

      for (const apt of allAppointments) {
        const date = new Date(apt.appointment_date);
        const formattedDate = date.toLocaleDateString('es-CO', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });

        console.log(
          apt.id.toString().substring(0, 8).padEnd(10) +
          (apt.client_name || 'N/A').substring(0, 23).padEnd(25) +
          (apt.advisor_id || 'N/A').substring(0, 13).padEnd(15) +
          formattedDate.padEnd(25) +
          (apt.status || 'N/A').padEnd(15) +
          (apt.appointment_type || 'N/A')
        );
      }
      console.log('─'.repeat(120));
    } else {
      console.log('✅ No hay citas activas en la base de datos');
    }

    // 2. Obtener citas por asesor
    console.log('\n📊 CITAS POR ASESOR:\n');

    const { data: advisors, error: advisorError } = await supabase
      .from('advisors')
      .select('id, name, email')
      .order('name');

    if (advisorError) {
      console.error('❌ Error al obtener asesores:', advisorError);
      return;
    }

    for (const advisor of advisors || []) {
      const { data: advisorAppointments, error } = await supabase
        .from('property_appointments')
        .select('*')
        .eq('advisor_id', advisor.id)
        .neq('status', 'cancelled');

      if (!error) {
        console.log(`👤 ${advisor.name}: ${advisorAppointments?.length || 0} citas activas`);
        
        if (advisorAppointments && advisorAppointments.length > 0) {
          advisorAppointments.forEach(apt => {
            const date = new Date(apt.appointment_date);
            console.log(`   • ${date.toLocaleString('es-CO')} - ${apt.appointment_type} (${apt.status})`);
          });
        }
      }
    }

    // 3. Verificar citas futuras
    console.log('\n📅 CITAS FUTURAS:\n');

    const now = new Date().toISOString();
    const { data: futureAppointments, error: futureError } = await supabase
      .from('property_appointments')
      .select('*')
      .gte('appointment_date', now)
      .neq('status', 'cancelled')
      .order('appointment_date', { ascending: true });

    if (futureError) {
      console.error('❌ Error al obtener citas futuras:', futureError);
    } else {
      console.log(`Total de citas futuras: ${futureAppointments?.length || 0}`);
      
      if (futureAppointments && futureAppointments.length > 0) {
        futureAppointments.slice(0, 10).forEach(apt => {
          const date = new Date(apt.appointment_date);
          console.log(`• ${date.toLocaleString('es-CO')} - ${apt.client_name} con asesor ${apt.advisor_id}`);
        });
      }
    }

    // 4. Verificar la estructura de la tabla
    console.log('\n🔧 ESTRUCTURA DE LA TABLA:\n');

    const { data: sample, error: sampleError } = await supabase
      .from('property_appointments')
      .select('*')
      .limit(1);

    if (!sampleError && sample && sample.length > 0) {
      console.log('Campos disponibles:');
      Object.keys(sample[0]).forEach(key => {
        console.log(`  • ${key}: ${typeof sample[0][key]}`);
      });
    }

    // 5. Buscar conflictos de horario
    console.log('\n⚠️  VERIFICANDO POSIBLES CONFLICTOS:\n');

    if (allAppointments && allAppointments.length > 1) {
      const conflicts = [];
      
      for (let i = 0; i < allAppointments.length; i++) {
        for (let j = i + 1; j < allAppointments.length; j++) {
          const apt1 = allAppointments[i];
          const apt2 = allAppointments[j];
          
          // Verificar si son del mismo asesor
          if (apt1.advisor_id === apt2.advisor_id) {
            const date1 = new Date(apt1.appointment_date);
            const date2 = new Date(apt2.appointment_date);
            
            // Verificar si están dentro de 1 hora de diferencia
            const diffMs = Math.abs(date1.getTime() - date2.getTime());
            const diffHours = diffMs / (1000 * 60 * 60);
            
            if (diffHours < 1) {
              conflicts.push({
                advisor: apt1.advisor_id,
                date1: date1.toLocaleString('es-CO'),
                date2: date2.toLocaleString('es-CO'),
                diffMinutes: Math.round(diffHours * 60)
              });
            }
          }
        }
      }
      
      if (conflicts.length > 0) {
        console.log(`❌ Se encontraron ${conflicts.length} conflictos potenciales:`);
        conflicts.forEach(c => {
          console.log(`  • Asesor ${c.advisor}: ${c.date1} vs ${c.date2} (diferencia: ${c.diffMinutes} minutos)`);
        });
      } else {
        console.log('✅ No se encontraron conflictos de horario');
      }
    }

    console.log('\n✅ Verificación completada\n');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar la verificación
checkAppointments();
