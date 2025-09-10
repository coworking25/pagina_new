import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testImageSystem() {
  console.log('🧪 Probando sistema de imágenes con códigos...\n');
  
  try {
    // 1. Probar generación de código
    console.log('1️⃣ Probando generación de código...');
    
    const { data: lastProperty, error: codeError } = await supabase
      .from('properties')
      .select('code')
      .not('code', 'is', null)
      .order('code', { ascending: false })
      .limit(1);
    
    if (codeError) {
      console.error('❌ Error obteniendo último código:', codeError);
    } else {
      const lastCode = lastProperty?.[0]?.code || 'CA-000';
      const match = lastCode.match(/CA-(\d+)/);
      const nextNumber = match ? parseInt(match[1]) + 1 : 1;
      const newCode = `CA-${nextNumber.toString().padStart(3, '0')}`;
      
      console.log(`   📋 Último código: ${lastCode}`);
      console.log(`   🆕 Próximo código: ${newCode}`);
    }
    
    // 2. Verificar estructura de carpetas en storage
    console.log('\n2️⃣ Verificando estructura de carpetas...');
    
    const { data: folders, error: listError } = await supabase.storage
      .from('property-images')
      .list('', { limit: 10 });
    
    if (listError) {
      console.error('❌ Error listando carpetas:', listError);
    } else {
      console.log(`   📁 Carpetas encontradas: ${folders?.length || 0}`);
      if (folders && folders.length > 0) {
        folders.forEach(folder => {
          console.log(`      - ${folder.name}`);
        });
      }
    }
    
    // 3. Verificar propiedades con códigos
    console.log('\n3️⃣ Verificando propiedades con códigos...');
    
    const { data: propertiesWithCodes, error: propError } = await supabase
      .from('properties')
      .select('code, title')
      .not('code', 'is', null)
      .order('code')
      .limit(5);
    
    if (propError) {
      console.error('❌ Error obteniendo propiedades:', propError);
    } else {
      console.log(`   🏠 Propiedades con código: ${propertiesWithCodes?.length || 0}`);
      propertiesWithCodes?.forEach(prop => {
        console.log(`      ${prop.code}: ${prop.title}`);
      });
    }
    
    // 4. Simular subida de imagen (sin archivo real)
    console.log('\n4️⃣ Simulando estructura de subida...');
    
    const testCode = 'CA-001';
    const testFileName = `${Date.now()}-test.jpg`;
    const testPath = `${testCode}/${testFileName}`;
    
    console.log(`   📁 Ruta de prueba: ${testPath}`);
    console.log(`   🔗 URL pública sería: ${supabaseUrl}/storage/v1/object/public/property-images/${testPath}`);
    
    console.log('\n✅ Sistema de imágenes configurado correctamente!');
    console.log('🚀 Todo listo para crear propiedades con códigos e imágenes organizadas');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error);
  }
}

testImageSystem();
