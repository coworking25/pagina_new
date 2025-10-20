const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer variables de entorno del archivo .env manualmente
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

let supabaseUrl = '';
let supabaseKey = '';

for (const line of envLines) {
  if (line.startsWith('VITE_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].trim();
  } else if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
    supabaseKey = line.split('=')[1].trim();
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.error('Verifica VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQLFile() {
  try {
    console.log('📂 Leyendo archivo SQL...');
    const sqlPath = path.join(__dirname, 'create_landlord_test_data.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📊 Ejecutando script de datos de prueba...\n');
    console.log('=' . repeat(60));
    
    // Dividir el SQL en bloques ejecutables
    // Nota: Supabase no soporta múltiples statements en una sola llamada
    // Vamos a ejecutar las partes principales manualmente
    
    // 1. Actualizar tipo de cliente
    console.log('\n1️⃣  Actualizando cliente a tipo "landlord"...');
    const { data: updateClient, error: updateError } = await supabase
      .from('clients')
      .update({
        client_type: 'landlord',
        monthly_income: 15000000,
        occupation: 'Empresario',
        company_name: 'Inversiones Restrepo SAS',
        notes: 'Cliente propietario con 3 propiedades en arriendo. Portal demo.',
        updated_at: new Date().toISOString()
      })
      .eq('document_number', '1036647890')
      .select();
    
    if (updateError) {
      console.error('❌ Error actualizando cliente:', updateError.message);
    } else {
      console.log('✅ Cliente actualizado:', updateClient[0]?.full_name);
    }
    
    // 2. Insertar propiedades
    console.log('\n2️⃣  Creando 3 propiedades...');
    const properties = [
      {
        id: 'aaaaaaaa-0001-0001-0001-111111111111',
        title: 'Apartamento Premium Poblado',
        property_type: 'apartamento',
        transaction_type: 'arriendo',
        price: 2800000,
        area: 85,
        rooms: 3,
        bathrooms: 2,
        address: 'Calle 10 # 43A-25, Apto 801',
        neighborhood: 'El Poblado',
        city: 'Medellín',
        description: 'Moderno apartamento de 3 habitaciones en El Poblado. Completamente amoblado, piso alto con vista panorámica.',
        property_code: 'PROP-2024-001',
        status: 'disponible',
        amenities: '["Parqueadero", "Gimnasio", "Portería 24/7", "Salón Social", "Amoblado"]',
        created_at: '2023-01-15T00:00:00Z'
      },
      {
        id: 'bbbbbbbb-0002-0002-0002-222222222222',
        title: 'Casa Familiar Laureles',
        property_type: 'casa',
        transaction_type: 'arriendo',
        price: 3500000,
        area: 150,
        rooms: 4,
        bathrooms: 3,
        address: 'Cra 75 # 32-18',
        neighborhood: 'Laureles',
        city: 'Medellín',
        description: 'Amplia casa de 4 habitaciones en el tradicional barrio Laureles. Incluye patio, zona de lavandería, garaje para 2 vehículos.',
        property_code: 'PROP-2024-002',
        status: 'disponible',
        amenities: '["Garaje", "Patio", "Zona de Lavandería", "Cocina Integral"]',
        created_at: '2023-03-10T00:00:00Z'
      },
      {
        id: 'cccccccc-0003-0003-0003-333333333333',
        title: 'Apartaestudio Moderno Envigado',
        property_type: 'apartamento',
        transaction_type: 'arriendo',
        price: 1800000,
        area: 45,
        rooms: 1,
        bathrooms: 1,
        address: 'Calle 37 Sur # 43-25, Torre B Apto 503',
        neighborhood: 'Zona Centro',
        city: 'Envigado',
        description: 'Acogedor apartaestudio ideal para persona sola o pareja. Cocina americana, baño completo, excelente iluminación natural.',
        property_code: 'PROP-2024-003',
        status: 'disponible',
        amenities: '["Ascensor", "Parqueadero", "Cocina Americana", "Iluminación Natural"]',
        created_at: '2023-06-20T00:00:00Z'
      }
    ];
    
    for (const property of properties) {
      const { data, error } = await supabase
        .from('properties')
        .upsert(property, { onConflict: 'id' })
        .select();
      
      if (error) {
        console.error(`❌ Error creando propiedad ${property.property_code}:`, error.message);
      } else {
        console.log(`✅ Propiedad creada: ${property.title} (${property.property_code})`);
      }
    }
    
    // 3. Insertar inquilinos
    console.log('\n3️⃣  Creando 3 inquilinos...');
    const tenants = [
      {
        id: 'tenant01-0000-0000-0000-000000000001',
        full_name: 'María Camila Gómez Pérez',
        document_type: 'cedula',
        document_number: '1234567890',
        phone: '3001234567',
        email: 'maria.gomez@email.com',
        address: 'Calle 10 # 43A-25, Apto 801',
        city: 'Medellín',
        client_type: 'tenant',
        status: 'active',
        monthly_income: 8000000,
        occupation: 'Gerente de Marketing',
        company_name: 'Digital Marketing SAS',
        source: 'manual',
        notes: 'Inquilina confiable, paga puntual. Arrendando desde enero 2024.',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'tenant02-0000-0000-0000-000000000002',
        full_name: 'Carlos Andrés Martínez López',
        document_type: 'cedula',
        document_number: '9876543210',
        phone: '3109876543',
        email: 'carlos.martinez@email.com',
        address: 'Cra 75 # 32-18',
        city: 'Medellín',
        client_type: 'tenant',
        status: 'active',
        monthly_income: 12000000,
        occupation: 'Ingeniero de Software',
        company_name: 'Tech Solutions Ltda',
        source: 'manual',
        notes: 'Familia con 2 niños. Excelentes referencias. Contrato renovado en 2024.',
        created_at: '2023-08-01T00:00:00Z'
      },
      {
        id: 'tenant03-0000-0000-0000-000000000003',
        full_name: 'Laura Valentina Rodríguez Castro',
        document_type: 'cedula',
        document_number: '5555555555',
        phone: '3155555555',
        email: 'laura.rodriguez@email.com',
        address: 'Calle 37 Sur # 43-25, Torre B Apto 503',
        city: 'Envigado',
        client_type: 'tenant',
        status: 'active',
        monthly_income: 4500000,
        occupation: 'Diseñadora Gráfica',
        company_name: 'Freelance',
        source: 'manual',
        notes: 'Joven profesional. Primer contrato de arriendo. Ocasionalmente paga con 2-3 días de retraso.',
        created_at: '2024-03-01T00:00:00Z'
      }
    ];
    
    for (const tenant of tenants) {
      const { data, error } = await supabase
        .from('clients')
        .upsert(tenant, { onConflict: 'document_type,document_number', ignoreDuplicates: true })
        .select();
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`❌ Error creando inquilino ${tenant.full_name}:`, error.message);
      } else {
        console.log(`✅ Inquilino creado: ${tenant.full_name}`);
      }
    }
    
    // 4. Obtener ID del landlord
    const { data: landlordData } = await supabase
      .from('clients')
      .select('id')
      .eq('document_number', '1036647890')
      .single();
    
    const landlordId = landlordData.id;
    console.log(`\n👤 Landlord ID: ${landlordId}`);
    
    // 5. Crear contratos
    console.log('\n4️⃣  Creando contratos de arrendamiento...');
    const contracts = [
      {
        id: 'contract1-0000-0000-0000-000000000001',
        client_id: 'tenant01-0000-0000-0000-000000000001',
        property_id: 'aaaaaaaa-0001-0001-0001-111111111111',
        landlord_id: landlordId,
        contract_type: 'rental',
        contract_number: 'CONT-2024-001',
        status: 'active',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        signature_date: '2023-12-15',
        monthly_rent: 2800000,
        deposit_amount: 2800000,
        administration_fee: 350000,
        contract_duration_months: 12,
        renewal_type: 'automatic',
        payment_day: 5,
        late_fee_percentage: 0.05,
        notes: 'Contrato estándar. Depósito en garantía. Pagos puntuales.',
        created_at: '2023-12-15T00:00:00Z'
      },
      {
        id: 'contract2-0000-0000-0000-000000000002',
        client_id: 'tenant02-0000-0000-0000-000000000002',
        property_id: 'bbbbbbbb-0002-0002-0002-222222222222',
        landlord_id: landlordId,
        contract_type: 'rental',
        contract_number: 'CONT-2023-045',
        status: 'active',
        start_date: '2023-08-01',
        end_date: '2025-07-31',
        signature_date: '2023-07-20',
        monthly_rent: 3500000,
        deposit_amount: 7000000,
        administration_fee: 0,
        contract_duration_months: 24,
        renewal_type: 'manual',
        payment_day: 10,
        late_fee_percentage: 0.05,
        notes: 'Contrato familiar a largo plazo. Depósito doble por familia.',
        created_at: '2023-07-20T00:00:00Z'
      },
      {
        id: 'contract3-0000-0000-0000-000000000003',
        client_id: 'tenant03-0000-0000-0000-000000000003',
        property_id: 'cccccccc-0003-0003-0003-333333333333',
        landlord_id: landlordId,
        contract_type: 'rental',
        contract_number: 'CONT-2024-015',
        status: 'active',
        start_date: '2024-03-01',
        end_date: '2025-02-28',
        signature_date: '2024-02-25',
        monthly_rent: 1800000,
        deposit_amount: 1800000,
        administration_fee: 180000,
        contract_duration_months: 12,
        renewal_type: 'automatic',
        payment_day: 5,
        late_fee_percentage: 0.05,
        notes: 'Primer contrato de la inquilina. Codeudor verificado.',
        created_at: '2024-02-25T00:00:00Z'
      }
    ];
    
    for (const contract of contracts) {
      const { data, error } = await supabase
        .from('contracts')
        .upsert(contract, { onConflict: 'contract_number', ignoreDuplicates: true })
        .select();
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`❌ Error creando contrato ${contract.contract_number}:`, error.message);
      } else {
        console.log(`✅ Contrato creado: ${contract.contract_number}`);
      }
    }
    
    console.log('\n5️⃣  Generando historial de pagos (puede tardar unos segundos)...');
    console.log('⏳ Esto creará ~70 pagos con historial realista...');
    
    // Nota: Los pagos se crearán con una función PL/pgSQL en el servidor
    // Por limitaciones de Supabase JS, necesitamos ejecutar el bloque DO directamente
    
    console.log('\n⚠️  IMPORTANTE: Para completar la creación de pagos,');
    console.log('ejecuta manualmente la sección de pagos del archivo SQL');
    console.log('desde el SQL Editor de Supabase Dashboard.\n');
    console.log('O ejecuta el siguiente comando en psql:');
    console.log('psql < create_landlord_test_data.sql\n');
    
    // Verificaciones finales
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICACIONES FINALES\n');
    
    const { data: clientCheck } = await supabase
      .from('clients')
      .select('full_name, client_type, occupation, company_name')
      .eq('document_number', '1036647890')
      .single();
    
    console.log('✅ Cliente:', clientCheck);
    
    const { count: propertiesCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .in('id', [
        'aaaaaaaa-0001-0001-0001-111111111111',
        'bbbbbbbb-0002-0002-0002-222222222222',
        'cccccccc-0003-0003-0003-333333333333'
      ]);
    
    console.log(`✅ Propiedades creadas: ${propertiesCount}/3`);
    
    const { count: tenantsCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('client_type', 'tenant')
      .in('document_number', ['1234567890', '9876543210', '5555555555']);
    
    console.log(`✅ Inquilinos creados: ${tenantsCount}/3`);
    
    const { count: contractsCount } = await supabase
      .from('contracts')
      .select('*', { count: 'exact', head: true })
      .eq('landlord_id', landlordId);
    
    console.log(`✅ Contratos creados: ${contractsCount}/3`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ DATOS BASE CREADOS EXITOSAMENTE');
    console.log('\n📝 Siguiente paso: Ejecutar la sección de PAGOS del SQL');
    console.log('   desde Supabase Dashboard para completar el historial.\n');
    
  } catch (error) {
    console.error('\n❌ ERROR GENERAL:', error.message);
    console.error(error);
  }
}

executeSQLFile();
