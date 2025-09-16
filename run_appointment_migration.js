import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de Supabase (hardcoded para este script)
const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseKey);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkTableStructure() {
  try {
    console.log('� Verificando estructura de la tabla property_appointments...');

    // Intentar hacer una consulta que incluya las nuevas columnas
    const { data, error } = await supabase
      .from('property_appointments')
      .select('id, status, no_show_at, follow_up_notes, rescheduled_date, cancellation_reason, actual_attendees, appointment_duration, appointment_rating, client_feedback')
      .limit(1);

    if (error) {
      console.error('❌ Error al consultar tabla:', error.message);

      if (error.message.includes('no_show_at') || error.message.includes('column')) {
        console.log('');
        console.log('🚨 COLUMNAS FALTANTES DETECTADAS 🚨');
        console.log('');
        console.log('Las siguientes columnas no existen en la tabla property_appointments:');
        console.log('- no_show_at');
        console.log('- follow_up_notes');
        console.log('- rescheduled_date');
        console.log('- cancellation_reason');
        console.log('- actual_attendees');
        console.log('- appointment_duration');
        console.log('- appointment_rating');
        console.log('- client_feedback');
        console.log('');
        console.log('📋 SOLUCIÓN: Ejecuta el archivo SQL en Supabase');
        console.log('');
        console.log('1. Ve a https://supabase.com/dashboard');
        console.log('2. Selecciona tu proyecto');
        console.log('3. Ve a "SQL Editor"');
        console.log('4. Copia y pega el contenido del archivo:');
        console.log('   add_appointment_tracking_columns.sql');
        console.log('5. Ejecuta la consulta');
        console.log('');
        console.log('Después de ejecutar la migración, recarga la aplicación.');
        console.log('');

        // Mostrar el contenido del archivo SQL
        const sqlFile = path.join(__dirname, 'add_appointment_tracking_columns.sql');
        if (fs.existsSync(sqlFile)) {
          console.log('📄 Contenido del archivo SQL:');
          console.log('=' .repeat(50));
          const sqlContent = fs.readFileSync(sqlFile, 'utf8');
          console.log(sqlContent);
          console.log('=' .repeat(50));
        }

        return false;
      }
    } else {
      console.log('✅ Todas las columnas existen en la tabla');
      console.log('📊 Estructura verificada correctamente');
      return true;
    }

  } catch (error) {
    console.error('❌ Error verificando estructura:', error);
    return false;
  }
}

// Ejecutar verificación
checkTableStructure();