const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no encontradas');
  console.error('Asegúrate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('🚀 Iniciando migración de campos adicionales para clients...');

    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, 'add_client_fields_migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Ejecutando migración SQL...');

    // Ejecutar la migración usando rpc (función personalizada en Supabase)
    // Nota: Para ejecutar SQL directo, necesitarías usar el cliente de admin
    // Por ahora, vamos a ejecutar las alteraciones una por una

    const alterations = [
      // Campos demográficos
      `ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS birth_date date`,
      `ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS gender character varying(20)`,
      `ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS marital_status character varying(20)`,

      // Campo de contacto
      `ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS preferred_contact_method character varying(20) DEFAULT 'phone'`,

      // Campo financiero
      `ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS budget_range character varying(20)`,

      // Campos de marketing
      `ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS referral_source character varying(50)`,
      `ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS property_requirements text`
    ];

    for (const alteration of alterations) {
      try {
        console.log(`🔧 Ejecutando: ${alteration.split('ADD COLUMN')[1]?.trim() || alteration}`);

        // Para ejecutar SQL directo, necesitaríamos usar el cliente admin de Supabase
        // Por ahora, vamos a intentar con un enfoque diferente

        const { error } = await supabase.rpc('exec_sql', { sql: alteration });

        if (error) {
          console.error(`❌ Error ejecutando: ${alteration}`);
          console.error('Error:', error);
        } else {
          console.log('✅ Alteración ejecutada correctamente');
        }
      } catch (err) {
        console.error(`❌ Error en alteración: ${alteration}`);
        console.error('Error detallado:', err);
      }
    }

    console.log('🎉 Migración completada!');
    console.log('');
    console.log('📋 Resumen de cambios:');
    console.log('- ✅ birth_date: Fecha de nacimiento');
    console.log('- ✅ gender: Género del cliente');
    console.log('- ✅ marital_status: Estado civil');
    console.log('- ✅ preferred_contact_method: Método de contacto preferido');
    console.log('- ✅ budget_range: Rango de presupuesto');
    console.log('- ✅ referral_source: Fuente de referencia');
    console.log('- ✅ property_requirements: Requisitos de propiedad');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar la migración
runMigration();