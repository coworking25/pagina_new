const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testCoverImageColumn() {
  console.log('🔍 Verificando columna cover_image...\n');

  try {
    // Intentar consultar con la columna cover_image
    const { data, error } = await supabase
      .from('properties')
      .select('id, title, images, cover_image')
      .limit(2);

    if (error) {
      console.error('❌ Error:', error);
      console.log('\n🔧 La columna cover_image no existe. Creándola...\n');
      
      // Intentar crear la columna usando SQL directo
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_query: 'ALTER TABLE properties ADD COLUMN IF NOT EXISTS cover_image TEXT;'
      });

      if (createError) {
        console.error('❌ Error creando columna:', createError);
      } else {
        console.log('✅ Columna cover_image creada');
        
        // Probar nuevamente
        const { data: newData, error: newError } = await supabase
          .from('properties')
          .select('id, title, images, cover_image')
          .limit(2);

        if (newError) {
          console.error('❌ Error después de crear:', newError);
        } else {
          console.log('✅ Consulta exitosa:', newData?.length || 0, 'propiedades');
        }
      }
    } else {
      console.log('✅ Columna cover_image ya existe');
      console.log('📊 Propiedades encontradas:', data?.length || 0);
      
      // Mostrar propiedades
      if (data && data.length > 0) {
        data.forEach(property => {
          console.log(`\n🏠 ${property.title}`);
          console.log(`   ID: ${property.id}`);
          console.log(`   Imágenes: ${property.images ? property.images.length : 0}`);
          console.log(`   Cover Image: ${property.cover_image || 'Sin definir'}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testCoverImageColumn();
