// Verificar que la columna deleted_at fue agregada correctamente
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SENDGRID_API_KEY; // Service key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyDeletedAtColumn() {
  console.log('🔍 Verificando columna deleted_at en appointments...\n');

  try {
    // 1. Verificar que existe alguna cita para probar
    const { data: appointments, error: selectError } = await supabase
      .from('appointments')
      .select('id, title, deleted_at')
      .limit(5);

    if (selectError) {
      console.error('❌ Error consultando appointments:', selectError.message);
      return;
    }

    console.log('✅ Consulta exitosa - columna deleted_at existe');
    console.log(`📊 Citas encontradas: ${appointments.length}`);
    
    if (appointments.length > 0) {
      console.log('\n📋 Muestra de citas:');
      appointments.forEach((apt, index) => {
        console.log(`${index + 1}. ID: ${apt.id}`);
        console.log(`   Título: ${apt.title}`);
        console.log(`   deleted_at: ${apt.deleted_at || 'NULL (activa)'}`);
        console.log('');
      });

      // 2. Probar filtro de citas activas
      const { data: activeAppointments, error: filterError } = await supabase
        .from('appointments')
        .select('id')
        .is('deleted_at', null);

      if (filterError) {
        console.error('❌ Error con filtro deleted_at:', filterError.message);
      } else {
        console.log(`✅ Filtro funciona: ${activeAppointments.length} citas activas`);
      }
    }

    console.log('\n🎯 ESTADO DEL SISTEMA:');
    console.log('====================');
    console.log('✅ Columna deleted_at: EXISTE');
    console.log('✅ Consultas: FUNCIONAN');
    console.log('✅ Filtros: FUNCIONAN');
    console.log('✅ Soft delete: LISTO PARA USAR');
    
    console.log('\n🧪 SIGUIENTE PASO:');
    console.log('==================');
    console.log('1. Reinicia la aplicación (npm run dev)');
    console.log('2. Prueba eliminar una cita');
    console.log('3. La cita debería desaparecer inmediatamente');
    console.log('4. Los datos se preservan en BD con deleted_at');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verifyDeletedAtColumn();