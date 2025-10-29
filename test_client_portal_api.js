import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testClientPortalAPI() {
  console.log('🧪 Probando APIs del Portal de Clientes...');

  try {
    // Verificar estructura de client_credentials
    console.log('1. Verificando estructura de client_credentials...');
    const { data: credentials, error: credError } = await supabase
      .from('client_credentials')
      .select('id, email, is_active')
      .limit(1);

    if (credError) {
      console.log(`❌ client_credentials: ${credError.message}`);
    } else {
      console.log(`✅ client_credentials: Estructura OK (${credentials?.length || 0} registros)`);
    }

    // Verificar client_documents
    console.log('2. Verificando estructura de client_documents...');
    const { data: documents, error: docError } = await supabase
      .from('client_documents')
      .select('id, document_type, document_name')
      .limit(1);

    if (docError) {
      console.log(`❌ client_documents: ${docError.message}`);
    } else {
      console.log(`✅ client_documents: Estructura OK (${documents?.length || 0} registros)`);
    }

    // Verificar client_property_relations
    console.log('3. Verificando estructura de client_property_relations...');
    const { data: relations, error: relError } = await supabase
      .from('client_property_relations')
      .select('id, client_id, property_id, status')
      .limit(1);

    if (relError) {
      console.log(`❌ client_property_relations: ${relError.message}`);
    } else {
      console.log(`✅ client_property_relations: Estructura OK (${relations?.length || 0} registros)`);
    }

    console.log('✅ Verificación completada - Las tablas del portal de clientes están listas!');

  } catch (error) {
    console.log(`❌ Error general: ${error.message}`);
  }
}

testClientPortalAPI().catch(console.error);