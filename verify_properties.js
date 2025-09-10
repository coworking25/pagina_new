import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gfczfjpyyyyvteyrvhgt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc'
);

async function checkProperties() {
  console.log('🔍 Verificando propiedades en la tabla...');
  
  // Obtener todas las propiedades
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(15);
    
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`📊 Total propiedades encontradas: ${data.length}`);
  console.log('📋 Últimas propiedades:');
  
  data.forEach((prop, index) => {
    console.log(`${index + 1}. ID: ${prop.id} | Código: ${prop.code || 'Sin código'} | Título: ${prop.title}`);
  });
  
  // Buscar específicamente el ID 62
  console.log('\n🔍 Buscando propiedad ID 62...');
  const { data: prop62, error: error62 } = await supabase
    .from('properties')
    .select('*')
    .eq('id', 62)
    .single();
    
  if (error62) {
    console.log('❌ Propiedad ID 62 no encontrada:', error62.message);
  } else {
    console.log('✅ Propiedad ID 62 encontrada:');
    console.log(JSON.stringify(prop62, null, 2));
  }
  
  // Buscar por código CA-021
  console.log('\n🔍 Buscando propiedad con código CA-021...');
  const { data: propCA021, error: errorCA021 } = await supabase
    .from('properties')
    .select('*')
    .eq('code', 'CA-021');
    
  if (errorCA021) {
    console.log('❌ Error buscando CA-021:', errorCA021.message);
  } else {
    console.log(`✅ Propiedades con código CA-021 encontradas: ${propCA021.length}`);
    propCA021.forEach(prop => {
      console.log(JSON.stringify(prop, null, 2));
    });
  }
}

checkProperties().catch(console.error);
