import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gfczfjpyyyyvteyrvhgt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc'
);

async function checkTables() {
  try {
    console.log('🔍 Verificando tablas existentes...\n');
    
    // Lista de tablas a verificar
    const tables = ['properties', 'property_appointments', 'property_activity', 'advisors', 'clients', 'appointments', 'inquiries'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        
        if (error) {
          console.log(`❌ Tabla '${table}': ${error.message}`);
        } else {
          console.log(`✅ Tabla '${table}' existe - registros encontrados: ${data?.length || 0}`);
        }
      } catch (error) {
        console.log(`❌ Tabla '${table}' error: ${error.message}`);
      }
    }
    
    console.log('\n🔍 Verificando propiedad específica ID 63...');
    const { data: prop63, error: errorProp63 } = await supabase
      .from('properties')
      .select('*')
      .eq('id', 63)
      .single();
      
    if (errorProp63) {
      console.log('❌ Propiedad ID 63 no encontrada:', errorProp63.message);
    } else {
      console.log('✅ Propiedad ID 63 encontrada:');
      console.log(`   - Código: ${prop63.code}`);
      console.log(`   - Título: ${prop63.title}`);
      console.log(`   - Precio: ${prop63.price.toLocaleString()}`);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkTables();
