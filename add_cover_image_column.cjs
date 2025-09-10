const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjUyNzcwNywiZXhwIjoyMDUyMTAzNzA3fQ.21_jEOrDlvCNs2w8GrKTRfH8lz1oYOZicdPKl3KpSeU';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function addCoverImageColumn() {
  console.log('🔧 Agregando columna cover_image a la tabla properties...\n');

  try {
    // Verificar primero si la columna ya existe
    console.log('🔍 Verificando si la columna cover_image ya existe...');
    
    const { data: testData, error: testError } = await supabase
      .from('properties')
      .select('cover_image')
      .limit(1);

    if (!testError) {
      console.log('✅ La columna cover_image ya existe');
      return;
    }

    console.log('📝 La columna no existe, procediendo a crearla...');

    // Usar SQL directo para agregar la columna
    const { data, error } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE properties 
        ADD COLUMN cover_image TEXT;
        
        UPDATE properties 
        SET cover_image = (
          CASE 
            WHEN images IS NOT NULL AND jsonb_array_length(images) > 0 
            THEN images->>0 
            ELSE NULL 
          END
        )
        WHERE cover_image IS NULL;
      `
    });

    if (error) {
      console.error('❌ Error ejecutando SQL:', error);
      
      // Intentar método alternativo usando REST API directamente
      console.log('🔄 Intentando método alternativo...');
      
      // Obtener todas las propiedades para ver su estructura
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('*')
        .limit(1);

      if (propError) {
        console.error('❌ Error obteniendo propiedades:', propError);
      } else {
        console.log('📋 Estructura actual de properties:', Object.keys(properties[0] || {}));
      }
      
      throw error;
    }

    console.log('✅ Columna cover_image agregada exitosamente');

    // Verificar que se agregó correctamente
    const { data: verifyData, error: verifyError } = await supabase
      .from('properties')
      .select('id, cover_image')
      .limit(3);

    if (verifyError) {
      console.error('❌ Error verificando la columna:', verifyError);
    } else {
      console.log('✅ Verificación exitosa. Primeras 3 propiedades:');
      verifyData.forEach(prop => {
        console.log(`  ID: ${prop.id}, cover_image: ${prop.cover_image || 'NULL'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

addCoverImageColumn();
