import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = 'https://pztnujhphqyckrplmfzd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6dG51amhwaHF5Y2tycGxtZnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMTcwNTIsImV4cCI6MjA0OTY5MzA1Mn0.HzfqdRBiXqrJe9xn9c5axUP8B1fNyPU1Ai18QJsBgqM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL(sqlFilePath, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 ${description}`);
  console.log(`${'='.repeat(60)}`);
  
  try {
    const sql = readFileSync(sqlFilePath, 'utf8');
    
    // Dividir el SQL en comandos individuales (por punto y coma)
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Total de comandos a ejecutar: ${commands.length}`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i] + ';'; // Re-agregar punto y coma
      
      // Saltar comentarios de bloque
      if (command.trim().startsWith('/*') || command.includes('COMMENT ON')) {
        continue;
      }
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql: command 
        });
        
        if (error) {
          // Si el error es "already exists", lo consideramos OK
          if (error.message.includes('already exists') || 
              error.message.includes('ya existe')) {
            console.log(`⚠️  Comando ${i + 1}: Ya existe (omitiendo)`);
            successCount++;
          } else {
            console.error(`❌ Comando ${i + 1} falló:`, error.message);
            errorCount++;
          }
        } else {
          console.log(`✅ Comando ${i + 1}: Ejecutado`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Comando ${i + 1} error:`, err.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Resultado: ${successCount} exitosos, ${errorCount} errores`);
    
    if (errorCount === 0) {
      console.log(`✅ ${description} - COMPLETADO`);
      return true;
    } else {
      console.log(`⚠️  ${description} - COMPLETADO CON ERRORES`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error leyendo archivo:`, error.message);
    return false;
  }
}

async function executeSQLDirect(sql, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 ${description}`);
  console.log(`${'='.repeat(60)}`);
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      if (error.message.includes('already exists') || 
          error.message.includes('ya existe')) {
        console.log(`⚠️  Ya existe (omitiendo)`);
        return true;
      } else {
        console.error(`❌ Error:`, error.message);
        return false;
      }
    } else {
      console.log(`✅ Ejecutado correctamente`);
      return true;
    }
  } catch (err) {
    console.error(`❌ Error:`, err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 INSTALACIÓN DEL MÓDULO DE GESTIÓN DE PAGOS');
  console.log('Fase 1: Base de Datos\n');
  
  const sqlDir = join(__dirname, 'sql');
  
  // Paso 1: Crear payment_schedules
  const step1 = await executeSQL(
    join(sqlDir, 'CREATE_PAYMENT_SCHEDULES_TABLE.sql'),
    'PASO 1: Crear tabla payment_schedules'
  );
  
  if (!step1) {
    console.error('\n❌ Error en Paso 1. Deteniendo instalación.');
    return;
  }
  
  // Paso 2: Crear payment_receipts
  const step2 = await executeSQL(
    join(sqlDir, 'CREATE_PAYMENT_RECEIPTS_TABLE.sql'),
    'PASO 2: Crear tabla payment_receipts'
  );
  
  if (!step2) {
    console.error('\n❌ Error en Paso 2. Deteniendo instalación.');
    return;
  }
  
  // Paso 3: Agregar FK receipt_id
  const step3 = await executeSQL(
    join(sqlDir, 'ADD_PAYMENT_SCHEDULES_RECEIPT_FK.sql'),
    'PASO 3: Agregar FK receipt_id a payment_schedules'
  );
  
  if (!step3) {
    console.error('\n❌ Error en Paso 3. Deteniendo instalación.');
    return;
  }
  
  // Paso 4: Actualizar client_payments
  const step4 = await executeSQL(
    join(sqlDir, 'UPDATE_CLIENT_PAYMENTS_TABLE.sql'),
    'PASO 4: Actualizar tabla client_payments'
  );
  
  if (!step4) {
    console.error('\n❌ Error en Paso 4. Deteniendo instalación.');
    return;
  }
  
  // Validación
  console.log(`\n${'='.repeat(60)}`);
  console.log('🧪 VALIDACIÓN POST-INSTALACIÓN');
  console.log(`${'='.repeat(60)}`);
  
  // Verificar tablas
  const { data: tables, error: tablesError } = await supabase
    .from('payment_schedules')
    .select('id')
    .limit(0);
  
  if (tablesError && tablesError.code !== 'PGRST116') {
    console.log('❌ Tabla payment_schedules no encontrada');
  } else {
    console.log('✅ Tabla payment_schedules creada');
  }
  
  const { data: receipts, error: receiptsError } = await supabase
    .from('payment_receipts')
    .select('id')
    .limit(0);
  
  if (receiptsError && receiptsError.code !== 'PGRST116') {
    console.log('❌ Tabla payment_receipts no encontrada');
  } else {
    console.log('✅ Tabla payment_receipts creada');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 INSTALACIÓN COMPLETADA');
  console.log('='.repeat(60));
  console.log('\n📝 Próximos pasos:');
  console.log('1. Configurar cron job para pagos vencidos');
  console.log('2. Ejecutar queries de validación (ver FASE_1_INSTRUCCIONES_BASE_DATOS.md)');
  console.log('3. Continuar con Fase 2: API y funciones TypeScript\n');
}

main().catch(console.error);
