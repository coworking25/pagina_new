import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbqweovdzqddzkgojytn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNicXdlb3ZkenFkZHprZ29qeXRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNTAzNTg2NCwiZXhwIjoyMDQwNjExODY0fQ.rMN_OkJhBb8CjfuYN6W5OTHlQwu7R1tXKCGH3L4_LgA';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Verificando conexión a Supabase...\n');

async function testConnection() {
    try {
        // Probar conexión básica
        const { data, error } = await supabase
            .from('advisors')
            .select('count', { count: 'exact', head: true });
            
        if (error) {
            console.log(`❌ Error de conexión: ${error.message}`);
            return false;
        } else {
            console.log('✅ Conexión a Supabase exitosa');
            console.log(`📊 Tabla advisors tiene registros`);
            return true;
        }
    } catch (err) {
        console.log(`❌ Error de conexión: ${err.message}`);
        return false;
    }
}

async function createClientsTable() {
    console.log('\n📋 Creando tabla CLIENTS...');
    
    try {
        // Intentar crear la tabla directamente
        const { data, error } = await supabase
            .from('clients')
            .select('count', { count: 'exact', head: true });
            
        if (error && error.message.includes('relation "clients" does not exist')) {
            console.log('   ℹ️  La tabla no existe, intentando crearla...');
            
            // La tabla no existe, vamos a mostrar las instrucciones para crearla manualmente
            console.log('\n📝 INSTRUCCIONES PARA CREAR LA TABLA MANUALMENTE:');
            console.log('1. Ir a Supabase Dashboard: https://supabase.com/dashboard');
            console.log('2. Seleccionar el proyecto');
            console.log('3. Ir a "SQL Editor"');
            console.log('4. Ejecutar el siguiente SQL:\n');
            
            const createTableSQL = `
-- Crear tabla CLIENTS
CREATE TABLE clients (
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

-- Crear índices
CREATE INDEX idx_clients_client_type ON clients(client_type);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_advisor ON clients(assigned_advisor_id);

-- Habilitar RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Política básica (ajustar según necesidades)
CREATE POLICY "Users can view all clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Users can insert clients" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update clients" ON clients FOR UPDATE USING (true);
CREATE POLICY "Users can delete clients" ON clients FOR DELETE USING (true);
            `;
            
            console.log(createTableSQL);
            
        } else if (error) {
            console.log(`   ❌ Error: ${error.message}`);
        } else {
            console.log('   ✅ La tabla CLIENTS ya existe');
            return true;
        }
        
    } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
    }
    
    return false;
}

async function main() {
    const connected = await testConnection();
    
    if (connected) {
        await createClientsTable();
        
        console.log('\n💡 PRÓXIMOS PASOS:');
        console.log('1. Crear las tablas manualmente en Supabase Dashboard');
        console.log('2. Usar el archivo create_clients_schema.sql como referencia');
        console.log('3. Una vez creadas, podemos proceder con las interfaces TypeScript');
    } else {
        console.log('\n❌ No se pudo conectar a Supabase');
        console.log('   Verificar credenciales y conexión a internet');
    }
}

main().catch(console.error);
