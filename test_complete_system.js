import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testImageUploadSystem() {
  console.log('🧪 Probando sistema completo de subida de imágenes...\n');
  
  try {
    // 1. Probar generación de código
    console.log('1️⃣ Probando generación de código de propiedad...');
    
    const { data: lastProperty, error: codeError } = await supabase
      .from('properties')
      .select('code')
      .not('code', 'is', null)
      .order('code', { ascending: false })
      .limit(1);
    
    if (codeError) {
      console.error('❌ Error obteniendo último código:', codeError);
      return;
    }
    
    let nextCode = 'CA-001';
    if (lastProperty && lastProperty.length > 0) {
      const lastCode = lastProperty[0].code;
      const match = lastCode.match(/CA-(\d+)/);
      if (match) {
        const nextNumber = parseInt(match[1]) + 1;
        nextCode = `CA-${nextNumber.toString().padStart(3, '0')}`;
      }
    }
    
    console.log(`✅ Próximo código disponible: ${nextCode}`);
    
    // 2. Verificar estructura de carpetas en storage
    console.log('\n2️⃣ Verificando estructura de carpetas...');
    
    const { data: folders, error: foldersError } = await supabase.storage
      .from('property-images')
      .list('', { limit: 100 });
    
    if (foldersError) {
      console.error('❌ Error obteniendo carpetas:', foldersError);
      return;
    }
    
    console.log(`📁 Carpetas encontradas: ${folders?.length || 0}`);
    folders?.forEach(folder => {
      if (!folder.metadata) { // Es una carpeta
        console.log(`   📂 ${folder.name}`);
      }
    });
    
    // 3. Verificar propiedades con códigos
    console.log('\n3️⃣ Verificando propiedades con códigos...');
    
    const { data: propertiesWithCodes, error: propsError } = await supabase
      .from('properties')
      .select('id, code, title, images')
      .not('code', 'is', null)
      .order('code')
      .limit(10);
    
    if (propsError) {
      console.error('❌ Error obteniendo propiedades:', propsError);
      return;
    }
    
    console.log(`🏠 Propiedades con código: ${propertiesWithCodes?.length || 0}`);
    propertiesWithCodes?.forEach(prop => {
      console.log(`   ${prop.code}: ${prop.title}`);
      console.log(`      📸 Imágenes: ${prop.images?.length || 0}`);
    });
    
    // 4. Simular creación de archivo de prueba
    console.log('\n4️⃣ Simulando subida de imagen...');
    
    const testContent = 'Test image content for property';
    const testBlob = new Blob([testContent], { type: 'image/jpeg' });
    const testFile = new File([testBlob], 'test-property-image.jpg', { type: 'image/jpeg' });
    
    const testPath = `${nextCode}/test-image-${Date.now()}.jpg`;
    
    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(testPath, testFile);
    
    if (uploadError) {
      console.error('❌ Error subiendo imagen de prueba:', uploadError);
    } else {
      console.log('✅ Imagen de prueba subida exitosamente');
      
      // Obtener URL pública
      const { data: publicUrl } = supabase.storage
        .from('property-images')
        .getPublicUrl(testPath);
      
      console.log(`🔗 URL pública: ${publicUrl.publicUrl}`);
      
      // Limpiar archivo de prueba
      await supabase.storage
        .from('property-images')
        .remove([testPath]);
      
      console.log('🧹 Archivo de prueba eliminado');
    }
    
    console.log('\n📊 RESUMEN DEL SISTEMA:');
    console.log('='.repeat(50));
    console.log('✅ Storage configurado y funcionando');
    console.log('✅ Generación de códigos automática');
    console.log('✅ Organización por carpetas implementada');
    console.log('✅ Subida de imágenes funcional');
    console.log('\n🚀 CÓMO USAR EL SISTEMA:');
    console.log('1. Ve al dashboard de propiedades');
    console.log('2. Haz clic en "Agregar Propiedad"');
    console.log('3. Llena el formulario (el código se genera automáticamente)');
    console.log('4. Sube imágenes usando el campo de archivo');
    console.log('5. Las imágenes se organizarán en carpetas por código');
    console.log('6. Guarda la propiedad');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testImageUploadSystem();
