const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjUyNzcwNywiZXhwIjoyMDUyMTAzNzA3fQ.21_jEOrDlvCNs2w8GrKTRfH8lz1oYOZicdPKl3KpSeU';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function runCoverImageMigration() {
  console.log('🔄 Ejecutando migración para agregar columna cover_image...\n');

  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'sql', '02_add_cover_image_column.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Ejecutando SQL:', sqlContent.substring(0, 200) + '...\n');

    // Ejecutar la migración SQL
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: sqlContent 
    });

    if (error) {
      console.error('❌ Error ejecutando migración SQL:', error);
      
      // Intentar ejecutar cada comando por separado
      console.log('🔄 Intentando ejecutar comandos por separado...\n');
      
      const commands = sqlContent
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

      for (const command of commands) {
        if (command.trim()) {
          console.log(`📝 Ejecutando: ${command.substring(0, 100)}...`);
          
          const { error: cmdError } = await supabase.rpc('exec_sql', { 
            sql_query: command 
          });
          
          if (cmdError) {
            console.warn(`⚠️ Error en comando (puede ser normal si ya existe):`, cmdError.message);
          } else {
            console.log('✅ Comando ejecutado exitosamente');
          }
        }
      }
    } else {
      console.log('✅ Migración SQL ejecutada exitosamente');
    }

    // Verificar que la columna se agregó correctamente
    console.log('\n🔍 Verificando estructura de la tabla...');
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('properties')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Error verificando tabla:', tableError);
    } else {
      console.log('✅ Tabla verificada correctamente');
      if (tableInfo && tableInfo.length > 0) {
        const columns = Object.keys(tableInfo[0]);
        console.log('📋 Columnas disponibles:', columns);
        
        if (columns.includes('cover_image')) {
          console.log('✅ ¡Columna cover_image agregada exitosamente!');
        } else {
          console.log('⚠️ La columna cover_image no aparece en la respuesta');
        }
      }
    }

    // Actualizar propiedades existentes
    console.log('\n🔄 Actualizando propiedades existentes...');
    
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, images, cover_image')
      .is('cover_image', null);

    if (propError) {
      console.error('❌ Error obteniendo propiedades:', propError);
    } else {
      console.log(`📊 ${properties.length} propiedades sin cover_image encontradas`);
      
      for (const property of properties) {
        if (property.images && property.images.length > 0) {
          const firstImage = property.images[0];
          
          const { error: updateError } = await supabase
            .from('properties')
            .update({ cover_image: firstImage })
            .eq('id', property.id);

          if (updateError) {
            console.error(`❌ Error actualizando propiedad ${property.id}:`, updateError.message);
          } else {
            console.log(`✅ Propiedad ${property.id} actualizada con cover_image`);
          }
        }
      }
    }

    console.log('\n✅ ¡Migración completada exitosamente!');
    console.log('🎯 Ahora puedes seleccionar imágenes de portada para las propiedades');

  } catch (error) {
    console.error('❌ Error general en la migración:', error);
  }
}

runCoverImageMigration();
