const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://txnfgfzsvqkbwdnlbxvb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bmZnZnpzdnFrYndkbmxieHZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4NTQ3OTMsImV4cCI6MjA0NjQzMDc5M30.3tjG-YSWVdNJoJ8yNhHCx1SJLRD8gkEMt-s3FsWlmYo'
);

async function checkCodes() {
  console.log('🔍 Verificando códigos de propiedades...\n');
  
  const { data, error } = await supabase
    .from('properties')
    .select('id, title, code, type')
    .order('created_at', { ascending: true })
    .limit(10);
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log('📊 Primeras 10 propiedades:\n');
  data.forEach(prop => {
    const codeDisplay = prop.code ? `✅ ${prop.code}` : '❌ SIN CÓDIGO';
    console.log(`${codeDisplay} | ${prop.type} | ${prop.title.substring(0, 40)}`);
  });
  
  // Contar propiedades con y sin código
  const { count: withCode } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .not('code', 'is', null);
    
  const { count: total } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true });
  
  console.log('\n📈 Resumen:');
  console.log(`✅ Con código: ${withCode}/${total}`);
  console.log(`❌ Sin código: ${total - withCode}/${total}`);
}

checkCodes();
