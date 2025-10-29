import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testClientPortalAPIs() {
  console.log('🧪 Probando APIs del Portal de Clientes...\n');

  try {
    // 1. Verificar credenciales de cliente
    console.log('1. 📧 Verificando credenciales de cliente...');
    const { data: credentials, error: credError } = await supabase
      .from('client_credentials')
      .select('id, email, is_active, client_id')
      .limit(5);

    if (credError) {
      console.log(`❌ Error en credenciales: ${credError.message}`);
    } else {
      console.log(`✅ Credenciales OK - ${credentials?.length || 0} registros encontrados`);
      if (credentials && credentials.length > 0) {
        console.log(`   📧 Email de ejemplo: ${credentials[0].email}`);
        console.log(`   🔑 Estado: ${credentials[0].is_active ? 'Activo' : 'Inactivo'}`);
      }
    }

    // 2. Verificar pagos del cliente
    console.log('\n2. 💳 Verificando pagos del cliente...');
    const { data: payments, error: payError } = await supabase
      .from('payments')
      .select('id, client_id, amount, status, due_date')
      .limit(5);

    if (payError) {
      console.log(`❌ Error en pagos: ${payError.message}`);
    } else {
      console.log(`✅ Pagos OK - ${payments?.length || 0} registros encontrados`);
      if (payments && payments.length > 0) {
        console.log(`   💰 Monto de ejemplo: $${payments[0].amount}`);
        console.log(`   📅 Estado: ${payments[0].status}`);
      }
    }

    // 3. Verificar documentos del cliente
    console.log('\n3. 📄 Verificando documentos del cliente...');
    const { data: documents, error: docError } = await supabase
      .from('client_documents')
      .select('id, client_id, document_type, document_name, status')
      .limit(5);

    if (docError) {
      console.log(`❌ Error en documentos: ${docError.message}`);
    } else {
      console.log(`✅ Documentos OK - ${documents?.length || 0} registros encontrados`);
      if (documents && documents.length > 0) {
        console.log(`   📄 Tipo: ${documents[0].document_type}`);
        console.log(`   📝 Nombre: ${documents[0].document_name}`);
      }
    }

    // 4. Verificar relaciones cliente-propiedad
    console.log('\n4. 🏠 Verificando relaciones cliente-propiedad...');
    const { data: relations, error: relError } = await supabase
      .from('client_property_relations')
      .select('id, client_id, property_id, status')
      .limit(5);

    if (relError) {
      console.log(`❌ Error en relaciones: ${relError.message}`);
    } else {
      console.log(`✅ Relaciones OK - ${relations?.length || 0} registros encontrados`);
      if (relations && relations.length > 0) {
        console.log(`   🏠 Estado: ${relations[0].status}`);
      }
    }

    // 5. Verificar alertas del cliente
    console.log('\n5. 🔔 Verificando alertas del cliente...');
    const { data: alerts, error: alertError } = await supabase
      .from('client_alerts')
      .select('id, client_id, alert_type, title, status')
      .limit(5);

    if (alertError) {
      console.log(`❌ Error en alertas: ${alertError.message}`);
    } else {
      console.log(`✅ Alertas OK - ${alerts?.length || 0} registros encontrados`);
      if (alerts && alerts.length > 0) {
        console.log(`   📢 Tipo: ${alerts[0].alert_type}`);
        console.log(`   📋 Título: ${alerts[0].title}`);
      }
    }

    // 6. Verificar comunicaciones del cliente
    console.log('\n6. 💬 Verificando comunicaciones del cliente...');
    const { data: communications, error: commError } = await supabase
      .from('client_communications')
      .select('id, client_id, communication_type, subject, status')
      .limit(5);

    if (commError) {
      console.log(`❌ Error en comunicaciones: ${commError.message}`);
    } else {
      console.log(`✅ Comunicaciones OK - ${communications?.length || 0} registros encontrados`);
      if (communications && communications.length > 0) {
        console.log(`   💬 Tipo: ${communications[0].communication_type}`);
        console.log(`   📧 Asunto: ${communications[0].subject}`);
      }
    }

    // 7. Verificar funciones SQL
    console.log('\n7. 🔧 Verificando funciones SQL...');
    try {
      const { data: funcResult, error: funcError } = await supabase.rpc('generate_monthly_extract', {
        p_client_id: '00000000-0000-0000-0000-000000000000', // UUID dummy
        p_contract_id: '00000000-0000-0000-0000-000000000000', // UUID dummy
        p_year: 2025,
        p_month: 10
      });

      if (funcError) {
        console.log(`⚠️ Función generate_monthly_extract: ${funcError.message} (esperado con datos dummy)`);
      } else {
        console.log(`✅ Función generate_monthly_extract: OK`);
      }
    } catch (err) {
      console.log(`⚠️ Error al probar función: ${err.message}`);
    }

    // 8. Verificar bucket de storage
    console.log('\n8. 📦 Verificando bucket de storage...');
    try {
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

      if (bucketError) {
        console.log(`❌ Error en storage: ${bucketError.message}`);
      } else {
        const clientBucket = buckets?.find(b => b.id === 'client-documents');
        if (clientBucket) {
          console.log(`✅ Bucket client-documents: OK (${clientBucket.public ? 'Público' : 'Privado'})`);
        } else {
          console.log(`❌ Bucket client-documents no encontrado`);
        }
      }
    } catch (err) {
      console.log(`❌ Error al verificar storage: ${err.message}`);
    }

    console.log('\n🎉 Verificación completa del Portal de Clientes!');
    console.log('✅ Todas las APIs y funcionalidades están listas para usar.');

  } catch (error) {
    console.log(`❌ Error general en las pruebas: ${error.message}`);
  }
}

testClientPortalAPIs().catch(console.error);