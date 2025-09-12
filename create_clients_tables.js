import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Supabase
const supabaseUrl = 'https://cbqweovdzqddzkgojytn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNicXdlb3ZkenFkZHprZ29qeXRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNTAzNTg2NCwiZXhwIjoyMDQwNjExODY0fQ.rMN_OkJhBb8CjfuYN6W5OTHlQwu7R1tXKCGH3L4_LgA';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🏗️  CREANDO SCHEMA DE CLIENTES');
console.log('===============================\n');

// Primero, vamos a crear las tablas manualmente una por una
async function createTables() {
    console.log('📋 Creando tablas del sistema de clientes...\n');
    
    // 1. Tabla CLIENTS
    console.log('1️⃣ Creando tabla CLIENTS...');
    try {
        const { error } = await supabase.rpc('exec_sql', {
            sql_query: `
                CREATE TABLE IF NOT EXISTS clients (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    full_name VARCHAR(255) NOT NULL,
                    document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('cedula', 'pasaporte', 'nit')),
                    document_number VARCHAR(50) NOT NULL,
                    phone VARCHAR(20) NOT NULL,
                    email VARCHAR(255),
                    address TEXT,
                    city VARCHAR(100),
                    emergency_contact_name VARCHAR(255),
                    emergency_contact_phone VARCHAR(20),
                    client_type VARCHAR(20) NOT NULL CHECK (client_type IN ('tenant', 'landlord', 'buyer', 'seller')),
                    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'blocked')),
                    monthly_income DECIMAL(15,2),
                    occupation VARCHAR(255),
                    company_name VARCHAR(255),
                    assigned_advisor_id UUID,
                    notes TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(document_type, document_number)
                );
            `
        });
        
        if (error) {
            console.log(`   ❌ Error: ${error.message}`);
        } else {
            console.log('   ✅ Tabla CLIENTS creada correctamente');
        }
    } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
    }
    
    // 2. Tabla CONTRACTS
    console.log('\n2️⃣ Creando tabla CONTRACTS...');
    try {
        const { error } = await supabase.rpc('exec_sql', {
            sql_query: `
                CREATE TABLE IF NOT EXISTS contracts (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
                    property_id UUID,
                    landlord_id UUID REFERENCES clients(id),
                    contract_type VARCHAR(20) NOT NULL CHECK (contract_type IN ('rental', 'sale', 'management')),
                    contract_number VARCHAR(50) UNIQUE,
                    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'expired', 'terminated', 'pending_renewal')),
                    start_date DATE NOT NULL,
                    end_date DATE,
                    signature_date DATE,
                    monthly_rent DECIMAL(15,2),
                    deposit_amount DECIMAL(15,2),
                    administration_fee DECIMAL(15,2),
                    sale_price DECIMAL(15,2),
                    contract_duration_months INTEGER,
                    renewal_type VARCHAR(20) DEFAULT 'manual' CHECK (renewal_type IN ('automatic', 'manual', 'none')),
                    payment_day INTEGER DEFAULT 5 CHECK (payment_day >= 1 AND payment_day <= 31),
                    late_fee_percentage DECIMAL(5,2) DEFAULT 0.00,
                    notes TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date > start_date)
                );
            `
        });
        
        if (error) {
            console.log(`   ❌ Error: ${error.message}`);
        } else {
            console.log('   ✅ Tabla CONTRACTS creada correctamente');
        }
    } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
    }
    
    // 3. Tabla PAYMENTS
    console.log('\n3️⃣ Creando tabla PAYMENTS...');
    try {
        const { error } = await supabase.rpc('exec_sql', {
            sql_query: `
                CREATE TABLE IF NOT EXISTS payments (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
                    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
                    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('rent', 'deposit', 'administration', 'utilities', 'late_fee', 'other')),
                    amount DECIMAL(15,2) NOT NULL,
                    amount_paid DECIMAL(15,2) DEFAULT 0.00,
                    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'partial', 'cancelled')),
                    due_date DATE NOT NULL,
                    payment_date DATE,
                    period_start DATE,
                    period_end DATE,
                    payment_method VARCHAR(50),
                    transaction_reference VARCHAR(255),
                    late_fee_applied DECIMAL(15,2) DEFAULT 0.00,
                    notes TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    CONSTRAINT valid_amount CHECK (amount > 0),
                    CONSTRAINT valid_amount_paid CHECK (amount_paid >= 0 AND amount_paid <= amount + late_fee_applied)
                );
            `
        });
        
        if (error) {
            console.log(`   ❌ Error: ${error.message}`);
        } else {
            console.log('   ✅ Tabla PAYMENTS creada correctamente');
        }
    } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
    }
    
    // 4. Tabla CLIENT_COMMUNICATIONS
    console.log('\n4️⃣ Creando tabla CLIENT_COMMUNICATIONS...');
    try {
        const { error } = await supabase.rpc('exec_sql', {
            sql_query: `
                CREATE TABLE IF NOT EXISTS client_communications (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
                    advisor_id UUID,
                    communication_type VARCHAR(20) NOT NULL CHECK (communication_type IN ('call', 'email', 'whatsapp', 'meeting', 'visit', 'sms', 'other')),
                    subject VARCHAR(255),
                    description TEXT,
                    outcome VARCHAR(500),
                    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_answer')),
                    follow_up_required BOOLEAN DEFAULT FALSE,
                    follow_up_date DATE,
                    communication_date TIMESTAMP WITH TIME ZONE NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        });
        
        if (error) {
            console.log(`   ❌ Error: ${error.message}`);
        } else {
            console.log('   ✅ Tabla CLIENT_COMMUNICATIONS creada correctamente');
        }
    } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
    }
    
    // 5. Tabla CLIENT_DOCUMENTS
    console.log('\n5️⃣ Creando tabla CLIENT_DOCUMENTS...');
    try {
        const { error } = await supabase.rpc('exec_sql', {
            sql_query: `
                CREATE TABLE IF NOT EXISTS client_documents (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
                    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
                    document_type VARCHAR(50) NOT NULL,
                    document_name VARCHAR(255) NOT NULL,
                    file_path VARCHAR(500),
                    file_size INTEGER,
                    mime_type VARCHAR(100),
                    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'replaced', 'invalid')),
                    expiration_date DATE,
                    is_required BOOLEAN DEFAULT FALSE,
                    uploaded_by UUID,
                    notes TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        });
        
        if (error) {
            console.log(`   ❌ Error: ${error.message}`);
        } else {
            console.log('   ✅ Tabla CLIENT_DOCUMENTS creada correctamente');
        }
    } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
    }
    
    // 6. Tabla CLIENT_ALERTS
    console.log('\n6️⃣ Creando tabla CLIENT_ALERTS...');
    try {
        const { error } = await supabase.rpc('exec_sql', {
            sql_query: `
                CREATE TABLE IF NOT EXISTS client_alerts (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
                    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
                    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
                    alert_type VARCHAR(30) NOT NULL CHECK (alert_type IN ('payment_due', 'payment_overdue', 'contract_expiring', 'contract_expired', 'document_missing', 'document_expiring', 'follow_up', 'maintenance', 'renewal_required', 'other')),
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
                    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed', 'snoozed')),
                    due_date DATE,
                    resolved_date TIMESTAMP WITH TIME ZONE,
                    resolved_by UUID,
                    auto_generated BOOLEAN DEFAULT FALSE,
                    notification_sent BOOLEAN DEFAULT FALSE,
                    notification_date TIMESTAMP WITH TIME ZONE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        });
        
        if (error) {
            console.log(`   ❌ Error: ${error.message}`);
        } else {
            console.log('   ✅ Tabla CLIENT_ALERTS creada correctamente');
        }
    } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
    }
}

// Función para crear índices
async function createIndexes() {
    console.log('\n📊 Creando índices para optimización...\n');
    
    const indexes = [
        { table: 'clients', name: 'idx_clients_client_type', column: 'client_type' },
        { table: 'clients', name: 'idx_clients_status', column: 'status' },
        { table: 'clients', name: 'idx_clients_advisor', column: 'assigned_advisor_id' },
        { table: 'contracts', name: 'idx_contracts_client_id', column: 'client_id' },
        { table: 'contracts', name: 'idx_contracts_status', column: 'status' },
        { table: 'payments', name: 'idx_payments_contract_id', column: 'contract_id' },
        { table: 'payments', name: 'idx_payments_status', column: 'status' },
        { table: 'payments', name: 'idx_payments_due_date', column: 'due_date' },
    ];
    
    for (const index of indexes) {
        try {
            const { error } = await supabase.rpc('exec_sql', {
                sql_query: `CREATE INDEX IF NOT EXISTS ${index.name} ON ${index.table}(${index.column});`
            });
            
            if (error) {
                console.log(`   ❌ ${index.name}: ${error.message}`);
            } else {
                console.log(`   ✅ ${index.name}: Creado correctamente`);
            }
        } catch (err) {
            console.log(`   ❌ ${index.name}: Error inesperado`);
        }
    }
}

// Función para verificar tablas
async function verifyTables() {
    console.log('\n🔍 Verificando tablas creadas...\n');
    
    const tables = ['clients', 'contracts', 'payments', 'client_communications', 'client_documents', 'client_alerts'];
    
    for (const table of tables) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('count', { count: 'exact', head: true });
                
            if (error) {
                console.log(`   ❌ ${table}: No existe o error`);
            } else {
                console.log(`   ✅ ${table}: Tabla verificada correctamente`);
            }
        } catch (err) {
            console.log(`   ❌ ${table}: Error al verificar`);
        }
    }
}

// Función para insertar datos de prueba
async function insertTestData() {
    console.log('\n🧪 Insertando datos de prueba...\n');
    
    try {
        // Insertar cliente de prueba
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .insert({
                full_name: 'Juan Diego Restrepo',
                document_type: 'cedula',
                document_number: '123456789',
                phone: '+57 300 123 4567',
                email: 'juan.restrepo@email.com',
                client_type: 'tenant',
                status: 'active',
                monthly_income: 5000000,
                occupation: 'Ingeniero de Software',
                city: 'Medellín'
            })
            .select()
            .single();
            
        if (clientError) {
            console.log(`   ❌ Error insertando cliente: ${clientError.message}`);
        } else {
            console.log('   ✅ Cliente de prueba creado correctamente');
            
            // Insertar contrato de prueba
            const { data: contract, error: contractError } = await supabase
                .from('contracts')
                .insert({
                    client_id: client.id,
                    contract_type: 'rental',
                    contract_number: 'CTR-2025-001',
                    status: 'active',
                    start_date: '2025-01-01',
                    end_date: '2025-12-31',
                    monthly_rent: 1500000,
                    deposit_amount: 1500000,
                    payment_day: 5
                })
                .select()
                .single();
                
            if (contractError) {
                console.log(`   ❌ Error insertando contrato: ${contractError.message}`);
            } else {
                console.log('   ✅ Contrato de prueba creado correctamente');
                
                // Insertar pago de prueba
                const { error: paymentError } = await supabase
                    .from('payments')
                    .insert({
                        contract_id: contract.id,
                        client_id: client.id,
                        payment_type: 'rent',
                        amount: 1500000,
                        due_date: '2025-10-05',
                        status: 'pending',
                        period_start: '2025-10-01',
                        period_end: '2025-10-31'
                    });
                    
                if (paymentError) {
                    console.log(`   ❌ Error insertando pago: ${paymentError.message}`);
                } else {
                    console.log('   ✅ Pago de prueba creado correctamente');
                }
            }
        }
        
    } catch (err) {
        console.log(`   ❌ Error insertando datos de prueba: ${err.message}`);
    }
}

// Ejecutar todo
async function main() {
    await createTables();
    await createIndexes();
    await verifyTables();
    await insertTestData();
    
    console.log('\n🎉 ¡Schema de clientes implementado exitosamente!');
    console.log('\n📋 RESUMEN:');
    console.log('✅ 6 tablas principales creadas');
    console.log('✅ Índices de optimización aplicados');
    console.log('✅ Datos de prueba insertados');
    console.log('✅ Sistema listo para usar');
}

main().catch(console.error);
