const { createClient } = require('@supabase/supabase-js');

// Usar las credenciales de la BD actual (gfczfjpyyyyvteyrvhgt)
const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createContractsAndPayments() {
  try {
    console.log('📊 CREANDO CONTRATOS Y PAGOS EN BD ACTUAL\n');
    console.log('='.repeat(60));
    console.log('Base de datos: gfczfjpyyyyvteyrvhgt');
    console.log('='.repeat(60));
    
    // 1. Buscar Juan Diego en ESTA base de datos
    console.log('\n1️⃣  Buscando Juan Diego en la BD actual...');
    const { data: juanDiego, error: jdError } = await supabase
      .from('clients')
      .select('*')
      .eq('email', 'diegorpo9608@gmail.com')
      .single();
    
    if (jdError) {
      console.error('❌ Error:', jdError.message);
      console.log('\n💡 Juan Diego no existe en esta BD. Creándolo...');
      
      // Crear Juan Diego
      const { data: newJuanDiego, error: createError } = await supabase
        .from('clients')
        .insert({
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
          created_at: '2023-06-01T00:00:00Z'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creando Juan Diego:', createError.message);
        return;
      }
      
      landlordId = newJuanDiego.id;
      console.log('✅ Juan Diego creado:', newJuanDiego.full_name);
    } else {
      landlordId = juanDiego.id;
      console.log('✅ Juan Diego encontrado:', juanDiego.full_name);
    }
    
    console.log('   ID:', landlordId);
    
    // 2. Crear inquilinos
    console.log('\n2️⃣  Creando 3 inquilinos...');
    
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
        console.log(`✅ ${tenant.full_name}`);
      }
    }
    
    if (tenantIds.length !== 3) {
      console.error('❌ No se pudieron crear todos los inquilinos');
      return;
    }
    
    // 3. Crear contratos
    console.log('\n3️⃣  Creando 3 contratos...');
    
    const contractsData = [
      {
        contract_number: 'CONT-2024-001',
        client_id: tenantIds[0],
        landlord_id: landlordId,
        contract_type: 'rental',
        status: 'active',
        start_date: '2024-01-01',
        end_date: '2025-01-01',
        monthly_rent: 2800000,
        deposit_amount: 2800000,
        payment_day: 1,
        notes: 'Apartamento Premium Poblado. 3 hab, 2 baños, 85m². El Poblado, Medellín.',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        contract_number: 'CONT-2023-045',
        client_id: tenantIds[1],
        landlord_id: landlordId,
        contract_type: 'rental',
        status: 'active',
        start_date: '2023-09-01',
        end_date: '2024-09-01',
        monthly_rent: 3500000,
        deposit_amount: 3500000,
        payment_day: 5,
        notes: 'Casa Familiar Laureles. 4 hab, 3 baños, 150m². Laureles, Medellín.',
        created_at: '2023-09-01T00:00:00Z'
      },
      {
        contract_number: 'CONT-2024-015',
        client_id: tenantIds[2],
        landlord_id: landlordId,
        contract_type: 'rental',
        status: 'active',
        start_date: '2024-03-01',
        end_date: '2025-03-01',
        monthly_rent: 1800000,
        deposit_amount: 1800000,
        payment_day: 1,
        notes: 'Apartaestudio Moderno Envigado. 1 hab, 1 baño, 45m². Centro, Envigado.',
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
        console.error(`❌ Error: ${contract.contract_number}:`, error.message);
      } else if (data && data[0]) {
        contractIds.push(data[0].id);
        console.log(`✅ ${contract.contract_number} - $${contract.monthly_rent.toLocaleString()}/mes`);
      }
    }
    
    if (contractIds.length !== 3) {
      console.error('❌ No se pudieron crear todos los contratos');
      return;
    }
    
    // 4. Crear pagos
    console.log('\n4️⃣  Creando pagos...');
    
    const paymentsData = [
      // María - 3 pagos pagados
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
        notes: 'Septiembre 2024'
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
        notes: 'Octubre 2024'
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
        notes: 'Noviembre 2024'
      },
      // Carlos - 1 pago con mora
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
        notes: 'Octubre 2024 - 7 días mora'
      },
      // Laura - 1 vencido
      {
        contract_id: contractIds[2],
        client_id: tenantIds[2],
        amount: 1800000,
        amount_paid: 0,
        due_date: '2024-10-01',
        payment_type: 'rent',
        status: 'overdue',
        late_fee_applied: 0,
        notes: 'Octubre 2024 - VENCIDO'
      }
    ];
    
    let paymentCount = 0;
    for (const payment of paymentsData) {
      const { error } = await supabase
        .from('payments')
        .insert(payment);
      
      if (error) {
        console.error(`❌ Error:`, error.message);
      } else {
        paymentCount++;
        const emoji = payment.status === 'paid' ? '✅' : '❌';
        console.log(`${emoji} $${payment.amount.toLocaleString()} - ${payment.status}`);
      }
    }
    
    console.log(`\n✅ Total pagos creados: ${paymentCount}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 COMPLETADO\n');
    console.log('📊 Resumen:');
    console.log(`   • Landlord: Juan Diego (${landlordId})`);
    console.log(`   • Inquilinos: ${tenantIds.length}`);
    console.log(`   • Contratos: ${contractIds.length}`);
    console.log(`   • Pagos: ${paymentCount}`);
    console.log('\n🔄 Siguiente paso:');
    console.log('   1. Recarga el dashboard (F5 o Ctrl+Shift+R)');
    console.log('   2. Abre Juan Diego');
    console.log('   3. Ve a Contratos y Pagos');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createContractsAndPayments();
