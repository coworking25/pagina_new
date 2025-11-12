/**
 * ============================================
 * SCRIPT PARA EJECUTAR MIGRACIÓN SQL
 * Sistema de Gestión de Pagos y Administración
 * ============================================
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function executeMigration() {
  log('\n============================================', 'cyan');
  log('MIGRACIÓN: SISTEMA DE PAGOS Y ADMINISTRACIÓN', 'bright');
  log('============================================\n', 'cyan');

  try {
    // 1. Cargar variables de entorno
    log('📋 Paso 1: Cargando configuración...', 'blue');
    
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('❌ Variables de entorno no encontradas. Verifica .env');
    }

    log(`✅ URL: ${supabaseUrl}`, 'green');
    log('✅ Key configurada\n', 'green');

    // 2. Crear cliente de Supabase
    log('📋 Paso 2: Conectando a Supabase...', 'blue');
    const supabase = createClient(supabaseUrl, supabaseKey);
    log('✅ Conexión establecida\n', 'green');

    // 3. Leer archivo SQL
    log('📋 Paso 3: Leyendo archivo de migración...', 'blue');
    const sqlPath = path.join(__dirname, 'ADD_PAYMENT_ADMINISTRATION_COLUMNS.sql');
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`❌ Archivo no encontrado: ${sqlPath}`);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    log(`✅ Archivo cargado (${sqlContent.length} caracteres)\n`, 'green');

    // 4. Verificar tablas existentes
    log('📋 Paso 4: Verificando estructura actual...', 'blue');
    
    const { data: contractsData, error: contractsError } = await supabase
      .from('contracts')
      .select('*')
      .limit(1);

    if (contractsError) {
      log('⚠️  Tabla contracts no encontrada o sin permisos', 'yellow');
    } else {
      log('✅ Tabla contracts encontrada', 'green');
    }

    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .limit(1);

    if (paymentsError) {
      log('⚠️  Tabla payments no encontrada o sin permisos', 'yellow');
    } else {
      log('✅ Tabla payments encontrada\n', 'green');
    }

    // 5. ADVERTENCIA - Requiere acceso directo
    log('⚠️  IMPORTANTE:', 'yellow');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
    log('Esta migración requiere permisos de administrador.', 'yellow');
    log('El cliente JavaScript de Supabase (anon key) NO puede:', 'yellow');
    log('  - Crear columnas con ALTER TABLE', 'yellow');
    log('  - Crear funciones con CREATE FUNCTION', 'yellow');
    log('  - Modificar esquemas de base de datos', 'yellow');
    log('\n✅ SOLUCIÓN:', 'green');
    log('Debes ejecutar el SQL en el SQL Editor de Supabase Dashboard', 'green');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'yellow');

    // 6. Mostrar instrucciones
    log('📝 INSTRUCCIONES PARA EJECUTAR LA MIGRACIÓN:\n', 'cyan');
    log('1. Abre tu navegador y ve a:', 'bright');
    log(`   ${supabaseUrl.replace('/rest/v1', '')}/project/_/sql\n`, 'blue');
    
    log('2. Copia el contenido del archivo:', 'bright');
    log('   ADD_PAYMENT_ADMINISTRATION_COLUMNS.sql\n', 'blue');
    
    log('3. Pégalo en el SQL Editor de Supabase\n', 'bright');
    
    log('4. Haz clic en "Run" para ejecutar\n', 'bright');
    
    log('5. Verifica que veas el mensaje:', 'bright');
    log('   "✅ Migración completada exitosamente"\n', 'green');

    // 7. Ofrecer crear backup
    log('💾 ¿Quieres crear un backup del SQL?', 'cyan');
    log('El archivo ya está guardado como:', 'bright');
    log(`   ${sqlPath}\n`, 'blue');

    // 8. Crear versión simplificada para copiar
    const simpleSqlPath = path.join(__dirname, 'MIGRATION_TO_COPY.sql');
    fs.writeFileSync(simpleSqlPath, sqlContent);
    log('✅ Copia creada:', 'green');
    log(`   ${simpleSqlPath}\n`, 'blue');

    log('============================================', 'cyan');
    log('SCRIPT COMPLETADO', 'bright');
    log('============================================\n', 'cyan');

    // 9. Ofrecer abrir el archivo
    log('💡 TIP: Puedes copiar el SQL con:', 'cyan');
    log(`   type "${sqlPath}" | clip\n`, 'yellow');

  } catch (error) {
    log('\n❌ ERROR:', 'red');
    log(error.message, 'red');
    log('\n', 'reset');
    process.exit(1);
  }
}

// Ejecutar
executeMigration();
