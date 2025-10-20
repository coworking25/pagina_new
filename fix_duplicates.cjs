const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer variables de entorno
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

let supabaseUrl = '';
let supabaseKey = '';

for (const line of envLines) {
  if (line.startsWith('VITE_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].trim();
  } else if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
    supabaseKey = line.split('=')[1].trim();
  }
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDuplicates() {
  try {
    console.log('🔧 Limpiando duplicados de Juan Diego...\n');
    
    // 1. Buscar ambos Juan Diego
    const { data: juanDiegos, error: searchError } = await supabase
      .from('clients')
      .select('*')
      .eq('email', 'diegorpo9608@gmail.com')
      .order('created_at', { ascending: true });
    
    if (searchError) {
      console.error('❌ Error:', searchError.message);
      return;
    }
    
    console.log(`📋 Clientes encontrados: ${juanDiegos?.length || 0}\n`);
    
    if (!juanDiegos || juanDiegos.length < 2) {
      console.log('✅ No hay duplicados');
      return;
    }
    
    juanDiegos.forEach((jd, i) => {
      console.log(`${i + 1}. ID: ${jd.id}`);
      console.log(`   Documento: ${jd.document_number}`);
      console.log(`   Tipo: ${jd.client_type}`);
      console.log(`   Fecha creación: ${jd.created_at}`);
      console.log('');
    });
    
    // 2. Determinar cuál mantener (el que es 'landlord' y tiene documento 1036647890)
    const correctJuanDiego = juanDiegos.find(jd => 
      jd.document_number === '1036647890' && jd.client_type === 'landlord'
    );
    
    const duplicateJuanDiego = juanDiegos.find(jd => jd.id !== correctJuanDiego?.id);
    
    if (!correctJuanDiego) {
      console.error('❌ No se encontró el Juan Diego correcto');
      return;
    }
    
    console.log('✅ Juan Diego CORRECTO (mantener):');
    console.log(`   ID: ${correctJuanDiego.id}`);
    console.log(`   Documento: ${correctJuanDiego.document_number}`);
    console.log(`   Tipo: ${correctJuanDiego.client_type}\n`);
    
    if (duplicateJuanDiego) {
      console.log('🗑️  Juan Diego DUPLICADO (eliminar):');
      console.log(`   ID: ${duplicateJuanDiego.id}`);
      console.log(`   Documento: ${duplicateJuanDiego.document_number}\n`);
      
      // 3. Verificar si el duplicado tiene datos asociados
      const { data: dupContracts } = await supabase
        .from('contracts')
        .select('*')
        .eq('landlord_id', duplicateJuanDiego.id);
      
      console.log(`   Contratos asociados: ${dupContracts?.length || 0}`);
      
      if (dupContracts && dupContracts.length > 0) {
        console.log('   ⚠️  El duplicado tiene contratos, transfiriéndolos...');
        
        const { error: transferError } = await supabase
          .from('contracts')
          .update({ landlord_id: correctJuanDiego.id })
          .eq('landlord_id', duplicateJuanDiego.id);
        
        if (transferError) {
          console.error('   ❌ Error transfiriendo contratos:', transferError.message);
        } else {
          console.log('   ✅ Contratos transferidos');
        }
      }
      
      // 4. Eliminar el duplicado
      console.log('\n🗑️  Eliminando duplicado...');
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', duplicateJuanDiego.id);
      
      if (deleteError) {
        console.error('❌ Error eliminando:', deleteError.message);
      } else {
        console.log('✅ Duplicado eliminado');
      }
    }
    
    // 5. Verificar contratos del correcto
    console.log('\n📊 Verificando datos del cliente correcto...');
    const { data: finalContracts } = await supabase
      .from('contracts')
      .select('*')
      .eq('landlord_id', correctJuanDiego.id);
    
    console.log(`✅ Contratos asignados: ${finalContracts?.length || 0}`);
    
    if (finalContracts && finalContracts.length > 0) {
      const contractIds = finalContracts.map(c => c.id);
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .in('contract_id', contractIds);
      
      console.log(`✅ Pagos asociados: ${payments?.length || 0}`);
    }
    
    console.log('\n🎉 Proceso completado!');
    console.log('🔄 Recarga el dashboard para ver los cambios');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixDuplicates();
