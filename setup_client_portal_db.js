import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function executeSQLScript(scriptPath) {
  console.log(`📄 Ejecutando: ${scriptPath}`);

  try {
    const sqlContent = fs.readFileSync(scriptPath, 'utf8');

    // Dividir el script en statements individuales (por punto y coma)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.log(`⚠️  Error en statement: ${error.message}`);
          }
        } catch (err) {
          // Ignorar errores de funciones que no existen
          if (!err.message.includes('function exec_sql')) {
            console.log(`⚠️  Error: ${err.message}`);
          }
        }
      }
    }

    console.log(`✅ ${scriptPath} ejecutado`);
  } catch (error) {
    console.log(`❌ Error ejecutando ${scriptPath}:`, error.message);
  }
}

async function setupClientPortalDatabase() {
  console.log('🚀 Iniciando configuración de base de datos del Portal de Clientes...');

  const scripts = [
    'sql/00_create_exec_sql_function.sql',
    'sql/01_client_portal_credentials.sql',
    'sql/02_extend_payments_table.sql',
    'sql/03_row_level_security.sql',
    'sql/04_extract_functions.sql',
    'sql/05_storage_buckets.sql'
  ];

  for (const script of scripts) {
    const scriptPath = path.join(__dirname, script);
    if (fs.existsSync(scriptPath)) {
      await executeSQLScript(scriptPath);
    } else {
      console.log(`⚠️  Script no encontrado: ${script}`);
    }
  }

  console.log('🎉 Configuración completada!');
  console.log('🔍 Verificando tablas...');

  // Verificar tablas
  const tables = [
    'client_credentials',
    'client_documents',
    'client_property_relations',
    'client_alerts',
    'client_communications'
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: OK`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Error`);
    }
  }
}

setupClientPortalDatabase().catch(console.error);