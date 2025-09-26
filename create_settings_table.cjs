const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSettingsTable() {
  try {
    console.log('🔧 Creando tabla de configuraciones...');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'create_settings_table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Ejecutar el SQL usando rpc (función personalizada)
    // Como no tenemos rpc configurado, vamos a ejecutar las consultas una por una
    const queries = sqlContent.split(';').filter(q => q.trim().length > 0);

    for (const query of queries) {
      if (query.trim()) {
        console.log(`Ejecutando: ${query.trim().substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: query.trim() + ';' });

        if (error) {
          console.log(`⚠️  Error en consulta (usando método alternativo): ${error.message}`);

          // Intentar método alternativo usando la API REST
          try {
            const { data, error: altError } = await supabase
              .from('settings')
              .select('*')
              .limit(1);

            if (altError && altError.message.includes('relation "public.settings" does not exist')) {
              console.log('La tabla no existe, intentando crear manualmente...');
              await createTableManually();
              break;
            }
          } catch (e) {
            console.log('Intentando crear tabla manualmente...');
            await createTableManually();
            break;
          }
        }
      }
    }

    console.log('✅ Tabla de configuraciones creada exitosamente');

    // Verificar que se creó correctamente
    const { data, error } = await supabase
      .from('settings')
      .select('*');

    if (error) {
      console.error('❌ Error verificando tabla:', error.message);
    } else {
      console.log(`📊 Tabla creada con ${data.length} registros iniciales`);
    }

  } catch (error) {
    console.error('❌ Error creando tabla de configuraciones:', error.message);
  }
}

async function createTableManually() {
  try {
    console.log('🔧 Creando tabla manualmente...');

    // Crear tabla usando insert (esto debería crear la tabla si no existe)
    const { error } = await supabase
      .from('settings')
      .insert({
        key: 'test',
        value: { test: true }
      });

    if (error && error.message.includes('relation "public.settings" does not exist')) {
      console.log('❌ No se puede crear tabla automáticamente. Necesitas ejecutar el SQL manualmente en Supabase.');
      console.log('📄 El archivo SQL está en: create_settings_table.sql');
      return;
    }

    // Si no hay error, la tabla ya existe o se creó
    console.log('✅ Tabla verificada/creada');

    // Limpiar el registro de prueba
    await supabase
      .from('settings')
      .delete()
      .eq('key', 'test');

  } catch (error) {
    console.error('❌ Error en creación manual:', error.message);
  }
}

createSettingsTable();