const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer variables de entorno
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

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestData() {
  try {
    console.log('📊 CREANDO CONTRATOS Y PAGOS PARA JUAN DIEGO\n');
    console.log('='.repeat(60));
    
    // ID fijo de Juan Diego
    const landlordId = 'd8871ea3-d748-407d-93e8-83969406be29';
    
    console.log('✅ Usando landlord ID:', landlordId);
    
    // 1. Crear inquilinos
    console.log('\n1️⃣  Creando inquilinos...');
    
    const tenantsData = [
      {
        full_name: 'María Camila Gómez Pérez',
        document_type: 'cedula',
        document_number: 'TENANT-001',
        phone: '3201234567',
        email: 'maria.gomez@gmail.com',
        client_type: 'tenant',
        status: 'active',
        occupation: 'Ingeniera',
        monthly_income: 5000000,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        full_name: 'Carlos Andrés Martínez López',
        document_type: 'cedula',
        document_number: 'TENANT-002',
        phone: '3157654321',
        email: 'carlos.martinez@gmail.com',
        client_type: 'tenant',
        status: 'active',
        occupation: 'Contador',
        monthly_income: 6000000,
        created_at: '2023-08-15T00:00:00Z'
      },
      {
        full_name: 'Laura Valentina Rodríguez Silva',
        document_type: 'cedula',
        document_number: 'TENANT-003',
        phone: '3009876543',
        email: 'laura.rodriguez@gmail.com',
        client_type: 'tenant',
        status: 'active',
        occupation: 'Diseñadora',
        monthly_income: 4500000,
        created_at: '2024-02-10T00:00:00Z'
      }
    ];
    
    const tenantIds = [];
    for (const tenant of tenantsData) {
      const { data, error } = await supabase
        .from('clients')
        .upsert(tenant, { onConflict: 'document_type,document_number' })
        .select();
      
      if (error) {
        console.error(`❌ Error creando ${tenant.full_name}:`, error.message);
      } else if (data && data[0]) {
        tenantIds.push(data[0].id);
        console.log(`✅ ${tenant.full_name} - ${tenant.email}`);
      }
    }
    
    if (tenantIds.length !== 3) {
      console.error('❌ No se pudieron crear todos los inquilinos');
      return;
    }
    
    // 2. Crear contratos
    console.log('\n2️⃣  Creando contratos...');
    
    const contractsData = [
      {
        contract_number: 'CONT-2024-001',
        client_id: tenantIds[0], // María
        landlord_id: landlordId,
        contract_type: 'rental',
        status: 'active',
        start_date: '2024-01-01',
        end_date: '2025-01-01',
        monthly_rent: 2800000,
        deposit_amount: 2800000,
        payment_day: 1,
        notes: 'Propiedad: Apartamento Premium Poblado. Código PROP-2024-001. 3 habitaciones, 2 baños, 85m². El Poblado, Medellín.',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        contract_number: 'CONT-2023-045',
        client_id: tenantIds[1], // Carlos
        landlord_id: landlordId,
        contract_type: 'rental',
        status: 'active',
        start_date: '2023-09-01',
        end_date: '2024-09-01',
        monthly_rent: 3500000,
        deposit_amount: 3500000,
        payment_day: 5,
        notes: 'Propiedad: Casa Familiar Laureles. Código PROP-2024-002. 4 habitaciones, 3 baños, 150m². Laureles, Medellín.',
        created_at: '2023-09-01T00:00:00Z'
      },
      {
        contract_number: 'CONT-2024-015',
        client_id: tenantIds[2], // Laura
        landlord_id: landlordId,
        contract_type: 'rental',
        status: 'active',
        start_date: '2024-03-01',
        end_date: '2025-03-01',
        monthly_rent: 1800000,
        deposit_amount: 1800000,
        payment_day: 1,
        notes: 'Propiedad: Apartaestudio Moderno Envigado. Código PROP-2024-003. 1 habitación, 1 baño, 45m². Centro, Envigado.',
        created_at: '2024-03-01T00:00:00Z'
      }
    ];
    
    const contractIds = [];
    for (const contract of contractsData) {
      const { data, error } = await supabase
        .from('contracts')
        .upsert(contract, { onConflict: 'contract_number' })
        .select();
      
      if (error) {
        console.error(`❌ Error creando ${contract.contract_number}:`, error.message);
      } else if (data && data[0]) {
        contractIds.push(data[0].id);
        console.log(`✅ ${contract.contract_number} - $${contract.monthly_rent.toLocaleString()}/mes`);
      }
    }
    
    if (contractIds.length !== 3) {
      console.error('❌ No se pudieron crear todos los contratos');
      return;
    }
    
    // 3. Crear pagos
    console.log('\n3️⃣  Creando pagos...');
    
    const paymentsData = [
      // Pagos de María (CONT-2024-001) - Todos pagados a tiempo
      {
        contract_id: contractIds[0],
        client_id: tenantIds[0],
        amount: 2800000,
        amount_paid: 2800000,
        due_date: '2024-09-01',
        payment_date: '2024-08-30',
        payment_type: 'rent',
        payment_method: 'bank_transfer',
        status: 'paid',
        transaction_reference: 'TRX-2024-09-001',
        late_fee_applied: 0,
        notes: 'Pago septiembre 2024 - A tiempo'
      },
      {
        contract_id: contractIds[0],
        client_id: tenantIds[0],
        amount: 2800000,
        amount_paid: 2800000,
        due_date: '2024-10-01',
        payment_date: '2024-09-29',
        payment_type: 'rent',
        payment_method: 'bank_transfer',
        status: 'paid',
        transaction_reference: 'TRX-2024-10-001',
        late_fee_applied: 0,
        notes: 'Pago octubre 2024 - A tiempo'
      },
      {
        contract_id: contractIds[0],
        client_id: tenantIds[0],
        amount: 2800000,
        amount_paid: 2800000,
        due_date: '2024-11-01',
        payment_date: '2024-10-31',
        payment_type: 'rent',
        payment_method: 'bank_transfer',
        status: 'paid',
        transaction_reference: 'TRX-2024-11-001',
        late_fee_applied: 0,
        notes: 'Pago noviembre 2024 - A tiempo'
      },
      // Pago de Carlos (CONT-2023-045) - Con mora
      {
        contract_id: contractIds[1],
        client_id: tenantIds[1],
        amount: 3500000,
        amount_paid: 3675000,
        due_date: '2024-10-05',
        payment_date: '2024-10-12',
        payment_type: 'rent',
        payment_method: 'cash',
        status: 'paid',
        transaction_reference: 'TRX-2024-10-002',
        late_fee_applied: 175000,
        notes: 'Pago octubre 2024 - 7 días de retraso. Mora: $175,000'
      },
      // Pago de Laura (CONT-2024-015) - Vencido
      {
        contract_id: contractIds[2],
        client_id: tenantIds[2],
        amount: 1800000,
        amount_paid: 0,
        due_date: '2024-10-01',
        payment_type: 'rent',
        status: 'overdue',
        late_fee_applied: 0,
        notes: 'Pago octubre 2024 - VENCIDO (14 días de retraso)'
      }
    ];
    
    let paymentCount = 0;
    for (const payment of paymentsData) {
      const { data, error } = await supabase
        .from('payments')
        .insert(payment)
        .select();
      
      if (error) {
        console.error(`❌ Error creando pago:`, error.message);
      } else if (data && data[0]) {
        paymentCount++;
        const status = payment.status === 'paid' ? '✅ Pagado' : 
                      payment.status === 'overdue' ? '❌ Vencido' : '⏳ Pendiente';
        console.log(`${status} - $${payment.amount.toLocaleString()} - Vence: ${payment.due_date}`);
      }
    }
    
    console.log(`\n✅ Creados ${paymentCount} pagos`);
    
    // 4. Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DATOS CREADOS EXITOSAMENTE\n');
    console.log('📊 Resumen:');
    console.log(`   • Landlord: Juan Diego Restrepo Bayer`);
    console.log(`   • Inquilinos: ${tenantIds.length}`);
    console.log(`   • Contratos: ${contractIds.length}`);
    console.log(`   • Pagos: ${paymentCount}`);
    console.log('\n💡 Siguiente paso:');
    console.log('   1. Ve al dashboard: http://localhost:5173/admin/clients');
    console.log('   2. Busca a Juan Diego');
    console.log('   3. Abre el modal (ícono del ojo)');
    console.log('   4. Verás Contratos (3) y Pagos (5)');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestData();
