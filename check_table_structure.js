import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkTableStructure() {
  console.log('🔍 Verificando estructura de tablas del portal de clientes...');

  const tables = ['client_credentials', 'client_documents', 'client_property_relations'];

  for (const table of tables) {
    try {
      // Intentar una consulta simple para ver si la tabla existe
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: OK`);
        if (data && data.length > 0) {
          console.log(`   Columnas disponibles: ${Object.keys(data[0]).join(', ')}`);
        } else {
          console.log(`   Tabla vacía, intentando consulta sin datos...`);
          // Si no hay datos, intentar una consulta que devuelva estructura
          try {
            const { data: emptyData, error: emptyError } = await supabase.from(table).select('*').limit(0);
            if (!emptyError) {
              console.log(`   Estructura disponible pero tabla vacía`);
            }
          } catch (e) {
            console.log(`   No se puede determinar estructura`);
          }
        }
      }
    } catch (err) {
      console.log(`❌ ${table}: Error - ${err.message}`);
    }
  }
}

checkTableStructure().catch(console.error);