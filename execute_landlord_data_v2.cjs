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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeLandlordData() {
  try {
    console.log('📊 CREANDO DATOS DE PRUEBA PARA PORTAL DE PROPIETARIO\n');
    console.log('='.repeat(60));
    
    // 1. Crear o actualizar cliente como landlord
    console.log('\n1️⃣  Creando/actualizando cliente como "landlord"...');
    const { data: updateClient, error: updateError } = await supabase
      .from('clients')
      .upsert({
        full_name: 'Juan Diego Restrepo Bayer',
        document_type: 'cedula',
        document_number: '1036647890',
        phone: '3001234567',
        email: 'diegorpo9608@gmail.com',
        address: 'Calle 50 # 25-30',
        city: 'Medellín',
        client_type: 'landlord',
        status: 'active',
        monthly_income: 15000000,
        occupation: 'Empresario',
        company_name: 'Inversiones Restrepo SAS',
        notes: 'Cliente propietario con 3 propiedades en arriendo. Portal demo.',
        created_at: '2023-06-01T00:00:00Z',
        updated_at: new Date().toISOString()
      }, { onConflict: 'document_type,document_number' })
      .select();
    
    if (updateError) {
      console.error('❌ Error:', updateError.message);
      return;
    }
    
    if (!updateClient || updateClient.length === 0) {
      console.error('❌ No se pudo crear/actualizar el cliente');
      return;
    }
    
    console.log('✅ Cliente:', updateClient[0].full_name, '- Tipo:', updateClient[0].client_type);
    
    const landlordId = updateClient[0].id;
    
    // 2. Crear 3 propiedades
    console.log('\n2️⃣  Creando 3 propiedades...');
    
    const properties = [
      {
        title: 'Apartamento Premium Poblado',
        type: 'apartamento',
        price: 2800000,
        location: 'El Poblado, Medellín',
        bedrooms: 3,
        bathrooms: 2,
        area: 85,
        description: 'Moderno apartamento de 3 habitaciones en El Poblado. Completamente amoblado, piso alto con vista panorámica. Edificio con portería 24/7.',
        code: 'PROP-2024-001',
        status: 'disponible',
        amenities: ['Parqueadero', 'Gimnasio', 'Portería 24/7', 'Salón Social', 'Amoblado'],
        created_at: '2023-01-15T00:00:00Z'
      },
      {
        title: 'Casa Familiar Laureles',
        type: 'casa',
        price: 3500000,
        location: 'Laureles, Medellín',
        bedrooms: 4,
        bathrooms: 3,
        area: 150,
        description: 'Amplia casa de 4 habitaciones en Laureles. Patio, zona de lavandería, garaje para 2 vehículos.',
        code: 'PROP-2024-002',
        status: 'disponible',
        amenities: ['Garaje', 'Patio', 'Zona de Lavandería', 'Cocina Integral'],
        created_at: '2023-03-10T00:00:00Z'
      },
      {
        title: 'Apartaestudio Moderno Envigado',
        type: 'apartamento',
        price: 1800000,
        location: 'Centro, Envigado',
        bedrooms: 1,
        bathrooms: 1,
        area: 45,
        description: 'Acogedor apartaestudio ideal para persona sola o pareja. Cocina americana, excelente iluminación natural.',
        code: 'PROP-2024-003',
        status: 'disponible',
        amenities: ['Ascensor', 'Parqueadero', 'Cocina Americana'],
        created_at: '2023-06-20T00:00:00Z'
      }
    ];
    
    const propertyIds = [];
    for (const property of properties) {
      // Primero verificar si ya existe
      const { data: existing } = await supabase
        .from('properties')
        .select('id')
        .eq('code', property.code)
        .single();
      
      if (existing) {
        propertyIds.push(existing.id);
        console.log(`⚠️  ${property.code} ya existe, usando existente`);
      } else {
        const { data, error } = await supabase
          .from('properties')
          .insert(property)
          .select();
        
        if (error) {
          console.error(`❌ Error con ${property.code}:`, error.message);
        } else if (data && data[0]) {
          propertyIds.push(data[0].id);
          console.log(`✅ ${property.code}: ${property.title} - $${property.price.toLocaleString()}/mes`);
        }
      }
    }
    
    // 3. Crear inquilinos
    console.log('\n3️⃣  Creando 3 inquilinos...');
    
    const tenants = [
      {
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
        notes: 'Inquilina confiable, paga puntual. Arrendando desde enero 2024.',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
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
        notes: 'Familia con 2 niños. Excelentes referencias.',
        created_at: '2023-08-01T00:00:00Z'
      },
      {
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
        notes: 'Joven profesional. Primer contrato.',
        created_at: '2024-03-01T00:00:00Z'
      }
    ];
    
    const tenantIds = [];
    for (const tenant of tenants) {
      const { data, error } = await supabase
        .from('clients')
        .upsert(tenant, { onConflict: 'document_type,document_number' })
        .select();
      
      if (error) {
        console.error(`❌ Error con ${tenant.full_name}:`, error.message);
      } else if (data && data[0]) {
        tenantIds.push(data[0].id);
        console.log(`✅ ${tenant.full_name} - ${tenant.occupation}`);
      }
    }
    
    // 4. Crear contratos
    console.log('\n4️⃣  Creando contratos de arrendamiento...');
    
    if (propertyIds.length < 3 || tenantIds.length < 3) {
      console.error('❌ No se crearon suficientes propiedades o inquilinos');
      return;
    }
    
    const contracts = [
      {
        client_id: tenantIds[0],
        // property_id: propertyIds[0], // Comentado por incompatibilidad de tipos
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
        notes: 'Apartamento Premium Poblado (PROP-2024-001). Contrato estándar. Depósito en garantía.',
        created_at: '2023-12-15T00:00:00Z'
      },
      {
        client_id: tenantIds[1],
        // property_id: propertyIds[1],
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
        notes: 'Casa Familiar Laureles (PROP-2024-002). Contrato familiar a largo plazo.',
        created_at: '2023-07-20T00:00:00Z'
      },
      {
        client_id: tenantIds[2],
        // property_id: propertyIds[2],
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
        notes: 'Apartaestudio Moderno Envigado (PROP-2024-003). Primer contrato con codeudor.',
        created_at: '2024-02-25T00:00:00Z'
      }
    ];
    
    const contractIds = [];
    for (const contract of contracts) {
      // Verificar si ya existe
      const { data: existing } = await supabase
        .from('contracts')
        .select('id')
        .eq('contract_number', contract.contract_number)
        .single();
      
      if (existing) {
        contractIds.push(existing.id);
        console.log(`⚠️  ${contract.contract_number} ya existe, usando existente`);
      } else {
        const { data, error } = await supabase
          .from('contracts')
          .insert(contract)
          .select();
        
        if (error) {
          console.error(`❌ Error con ${contract.contract_number}:`, error.message);
        } else if (data && data[0]) {
          contractIds.push(data[0].id);
          console.log(`✅ ${contract.contract_number} - $${contract.monthly_rent.toLocaleString()}/mes`);
        }
      }
    }
    
    // 5. Crear algunos pagos de muestra
    console.log('\n5️⃣  Creando pagos de ejemplo (último trimestre)...');
    
    if (contractIds.length < 3 || tenantIds.length < 3) {
      console.error('❌ No se crearon suficientes contratos');
      return;
    }
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // María Camila - 3 últimos meses PAGADOS
    for (let i = 2; i >= 0; i--) {
      const mes = currentMonth - i;
      if (mes > 0) {
        const pago = {
          contract_id: contractIds[0],
          client_id: tenantIds[0],
          payment_type: 'rent',
          amount: 2800000,
          amount_paid: 2800000,
          due_date: `${currentYear}-${String(mes).padStart(2, '0')}-05`,
          payment_date: `${currentYear}-${String(mes).padStart(2, '0')}-04`,
          status: 'paid',
          payment_method: 'transfer',
          transaction_reference: `REF-POB-${currentYear}-${String(mes).padStart(2, '0')}`,
          late_fee_applied: 0,
          notes: 'Pago puntual',
          created_at: `${currentYear}-${String(mes).padStart(2, '0')}-01T00:00:00Z`
        };
        
        const { error } = await supabase.from('payments').insert(pago);
        if (error) {
          console.error(`❌ Error pago ${mes}/${currentYear}:`, error.message);
        } else {
          console.log(`✅ Pago ${mes}/${currentYear} - María Camila: $2.8M (PAGADO)`);
        }
      }
    }
    
    // Carlos - 1 pago con mora
    const mesAtrasado = currentMonth - 2;
    if (mesAtrasado > 0) {
      const { error: p1 } = await supabase.from('payments').insert({
        contract_id: contractIds[1],
        client_id: tenantIds[1],
        payment_type: 'rent',
        amount: 3500000,
        amount_paid: 3675000, // Incluye mora
        due_date: `${currentYear}-${String(mesAtrasado).padStart(2, '0')}-10`,
        payment_date: `${currentYear}-${String(mesAtrasado).padStart(2, '0')}-12`,
        status: 'paid',
        payment_method: 'transfer',
        late_fee_applied: 175000,
        transaction_reference: `REF-LAU-${currentYear}-${String(mesAtrasado).padStart(2, '0')}`,
        notes: 'Pago con 2 días de retraso. Mora aplicada.',
        created_at: `${currentYear}-${String(mesAtrasado).padStart(2, '0')}-01T00:00:00Z`
      });
      if (p1) {
        console.error(`❌ Error pago Carlos:`, p1.message);
      } else {
        console.log(`✅ Pago ${mesAtrasado}/${currentYear} - Carlos: $3.5M + $175K mora`);
      }
    }
    
    // Laura - 1 pendiente VENCIDO (ya creado, verificar si existe)
    const { data: existingOverdue } = await supabase
      .from('payments')
      .select('id')
      .eq('contract_id', contractIds[2])
      .eq('status', 'overdue')
      .single();
    
    if (!existingOverdue) {
      const { error: p2 } = await supabase.from('payments').insert({
        contract_id: contractIds[2],
        client_id: tenantIds[2],
        payment_type: 'rent',
        amount: 1800000,
        amount_paid: 0,
        due_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-05`,
        payment_date: null,
        status: 'overdue',
        late_fee_applied: 0,
        notes: 'VENCIDO - Pendiente de pago',
        created_at: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01T00:00:00Z`
      });
      if (p2) {
        console.error(`❌ Error pago Laura:`, p2.message);
      } else {
        console.log(`✅ Pago ${currentMonth}/${currentYear} - Laura: $1.8M (VENCIDO)`);
      }
    } else {
      console.log(`⚠️  Pago vencido de Laura ya existe`);
    }
    
    // Verificaciones
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN FINAL\n');
    
    const { data: propertiesData } = await supabase
      .from('properties')
      .select('code')
      .in('code', ['PROP-2024-001', 'PROP-2024-002', 'PROP-2024-003']);
    
    const { data: tenantsData } = await supabase
      .from('clients')
      .select('full_name')
      .eq('client_type', 'tenant')
      .in('document_number', ['1234567890', '9876543210', '5555555555']);
    
    const { data: contractsData } = await supabase
      .from('contracts')
      .select('contract_number')
      .eq('landlord_id', landlordId);
    
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('id, status')
      .in('contract_id', contractIds);
    
    console.log(`✅ Propiedades creadas: ${propertiesData?.length || 0}/3`);
    console.log(`✅ Inquilinos creados: ${tenantsData?.length || 0}/3`);
    console.log(`✅ Contratos activos: ${contractsData?.length || 0}/3`);
    console.log(`✅ Pagos registrados: ${paymentsData?.length || 0}`);
    
    console.log('\n📋 Ingreso mensual esperado: $8,100,000 COP');
    console.log('   • Poblado: $2,800,000 + $350,000 adm');
    console.log('   • Laureles: $3,500,000');
    console.log('   • Envigado: $1,800,000 + $180,000 adm\n');
    
    console.log('✅ DATOS DE PRUEBA CREADOS EXITOSAMENTE');
    console.log('\n🔐 Puedes acceder al portal con:');
    console.log('   Email: diegorpo9608@gmail.com');
    console.log('   Pass: MiPass2025!\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  }
}

executeLandlordData();
