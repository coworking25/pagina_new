// Script para investigar las relaciones y tablas de appointments
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SENDGRID_API_KEY; // Service key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function investigateRelations() {
  console.log('🔍 Investigando relaciones de appointments...\n');

  try {
    // 1. Probar consulta simple sin relaciones
    console.log('📋 CONSULTA SIMPLE (sin joins):');
    console.log('==============================');
    
    const { data: simple, error: simpleError } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);

    if (simpleError) {
      console.error('❌ Error consulta simple:', simpleError.message);
    } else {
      console.log('✅ Consulta simple funciona');
      if (simple.length > 0) {
        console.log('📊 Campos disponibles:', Object.keys(simple[0]));
      }
    }

    // 2. Verificar existencia de tablas relacionadas
    console.log('\n🔗 VERIFICANDO TABLAS RELACIONADAS:');
    console.log('==================================');
    
    const tables = ['clients', 'advisors', 'properties'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        if (error) {
          console.log(`❌ Tabla "${table}": NO EXISTE o sin permisos`);
          console.log(`   Error: ${error.message}`);
        } else {
          console.log(`✅ Tabla "${table}": EXISTE`);
          if (data.length > 0) {
            console.log(`   Campos: ${Object.keys(data[0]).slice(0, 5).join(', ')}...`);
          }
        }
      } catch (e) {
        console.log(`❌ Tabla "${table}": ERROR - ${e.message}`);
      }
    }

    // 3. Probar consulta con relaciones una por una
    console.log('\n🧪 PROBANDO JOINS INDIVIDUALES:');
    console.log('==============================');
    
    // Probar client join
    try {
      const { data: clientJoin, error: clientError } = await supabase
        .from('appointments')
        .select('*, client:clients(full_name)')
        .limit(1);
        
      if (clientError) {
        console.log('❌ Join con clients:', clientError.message);
      } else {
        console.log('✅ Join con clients: FUNCIONA');
      }
    } catch (e) {
      console.log('❌ Join con clients: ERROR -', e.message);
    }

    // Probar advisor join
    try {
      const { data: advisorJoin, error: advisorError } = await supabase
        .from('appointments')
        .select('*, advisor:advisors(name)')
        .limit(1);
        
      if (advisorError) {
        console.log('❌ Join con advisors:', advisorError.message);
      } else {
        console.log('✅ Join con advisors: FUNCIONA');
      }
    } catch (e) {
      console.log('❌ Join con advisors: ERROR -', e.message);
    }

    // Probar property join
    try {
      const { data: propertyJoin, error: propertyError } = await supabase
        .from('appointments')
        .select('*, property:properties(title)')
        .limit(1);
        
      if (propertyError) {
        console.log('❌ Join con properties:', propertyError.message);
      } else {
        console.log('✅ Join con properties: FUNCIONA');
      }
    } catch (e) {
      console.log('❌ Join con properties: ERROR -', e.message);
    }

    // 4. Verificar si la cita fue realmente eliminada (soft delete)
    console.log('\n🗑️ VERIFICANDO SOFT DELETE:');
    console.log('===========================');
    
    const { data: allAppointments } = await supabase
      .from('appointments')
      .select('id, title, deleted_at')
      .eq('id', '71f55c6d-0b38-49a6-bc8e-5d26d8b2f63e');

    if (allAppointments && allAppointments.length > 0) {
      const apt = allAppointments[0];
      console.log(`📋 Cita ID: ${apt.id}`);
      console.log(`📋 Título: ${apt.title}`);
      console.log(`📋 deleted_at: ${apt.deleted_at}`);
      
      if (apt.deleted_at) {
        console.log('✅ Cita marcada como eliminada (soft delete funcionó)');
      } else {
        console.log('❌ Cita NO marcada como eliminada (soft delete falló)');
      }
    } else {
      console.log('⚠️ Cita no encontrada');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

investigateRelations();