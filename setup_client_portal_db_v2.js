#!/usr/bin/env node

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

    // Ejecutar el SQL completo usando una consulta directa
    // Nota: Esto requiere permisos elevados y no es recomendado para producción
    const { data, error } = await supabase.rpc('exec', { query: sqlContent });

    if (error) {
      console.log(`⚠️  Error ejecutando ${scriptPath}: ${error.message}`);
      return false;
    } else {
      console.log(`✅ ${scriptPath} ejecutado exitosamente`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Error leyendo o ejecutando ${scriptPath}:`, error.message);
    return false;
  }
}

async function setupClientPortalDatabase() {
  console.log('🚀 Iniciando configuración de base de datos del Portal de Clientes...');
  console.log('⚠️  NOTA: Este script requiere la función exec() en Supabase (solo para desarrollo)');

  const scripts = [
    'sql/01_client_portal_credentials.sql',
    'sql/02_extend_payments_table.sql',
    'sql/03_row_level_security.sql',
    'sql/04_extract_functions.sql',
    'sql/05_storage_buckets.sql'
  ];

  let successCount = 0;

  for (const script of scripts) {
    const scriptPath = path.join(__dirname, script);
    if (fs.existsSync(scriptPath)) {
      const success = await executeSQLScript(scriptPath);
      if (success) successCount++;
    } else {
      console.log(`⚠️  Script no encontrado: ${script}`);
    }
  }

  console.log(`\n🎉 Configuración completada! ${successCount}/${scripts.length} scripts ejecutados exitosamente.`);

  if (successCount === scripts.length) {
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
  } else {
    console.log('\n❌ Algunos scripts fallaron. Revisa los errores arriba.');
    console.log('💡 Sugerencia: Ejecuta los scripts manualmente en el SQL Editor de Supabase');
  }
}

setupClientPortalDatabase().catch(console.error);