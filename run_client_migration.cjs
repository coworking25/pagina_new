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
    console.log('⚠️  Nota: Este script intentará ejecutar la migración usando RPC');
    console.log('📝 Si falla, ejecuta manualmente el archivo add_client_fields_migration.sql en el SQL Editor de Supabase');

    // Intentar ejecutar usando una función RPC personalizada
    // Esto probablemente fallará porque necesitamos permisos de admin
    console.log('🔧 Intentando ejecutar migración...');

    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Campos demográficos
        ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS birth_date date;
        ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS gender character varying(20);
        ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS marital_status character varying(20);

        -- Campo de contacto
        ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS preferred_contact_method character varying(20) DEFAULT 'phone';

        -- Campo financiero
        ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS budget_range character varying(20);

        -- Campos de marketing
        ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS referral_source character varying(50);
        ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS property_requirements text;
      `
    });

    if (error) {
      console.error('❌ Error ejecutando migración automática:', error);
      console.log('');
      console.log('🔧 INSTRUCCIONES MANUALES:');
      console.log('1. Ve al SQL Editor de Supabase: https://supabase.com/dashboard/project/YOUR_PROJECT/sql');
      console.log('2. Copia y pega el contenido del archivo add_client_fields_migration.sql');
      console.log('3. Ejecuta la migración');
      console.log('4. Una vez ejecutada, intenta actualizar un cliente nuevamente');
    } else {
      console.log('✅ Migración ejecutada correctamente!');
      console.log('');
      console.log('📋 Campos agregados:');
      console.log('- birth_date: Fecha de nacimiento');
      console.log('- gender: Género del cliente');
      console.log('- marital_status: Estado civil');
      console.log('- preferred_contact_method: Método de contacto preferido');
      console.log('- budget_range: Rango de presupuesto');
      console.log('- referral_source: Fuente de referencia');
      console.log('- property_requirements: Requisitos de propiedad');
    }

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    console.log('');
    console.log('🔧 INSTRUCCIONES PARA EJECUCIÓN MANUAL:');
    console.log('1. Abre el SQL Editor de Supabase');
    console.log('2. Copia el contenido de add_client_fields_migration.sql');
    console.log('3. Ejecuta la migración');
    console.log('4. Reinicia la aplicación');
  }
}

// Ejecutar la migración
runMigration();