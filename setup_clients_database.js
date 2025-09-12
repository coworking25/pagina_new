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

async function executeSchema() {
    try {
        console.log('🚀 Iniciando creación del schema de clientes...\n');
        
        // Leer el archivo SQL
        const sqlFilePath = path.join(__dirname, 'create_clients_schema.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        
        // Dividir el SQL en comandos individuales
        const sqlCommands = sqlContent
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
        
        console.log(`📄 Se ejecutarán ${sqlCommands.length} comandos SQL\n`);
        
        let successCount = 0;
        let errorCount = 0;
        
        // Ejecutar cada comando SQL
        for (let i = 0; i < sqlCommands.length; i++) {
            const command = sqlCommands[i];
            
            // Saltar comentarios y comandos vacíos
            if (command.startsWith('/*') || command.length < 10) {
                continue;
            }
            
            try {
                console.log(`⚡ Ejecutando comando ${i + 1}/${sqlCommands.length}...`);
                
                // Log del tipo de comando
                if (command.toLowerCase().includes('create table')) {
                    const tableName = command.match(/create table (\w+)/i)?.[1];
                    console.log(`   📋 Creando tabla: ${tableName}`);
                } else if (command.toLowerCase().includes('create index')) {
                    const indexName = command.match(/create index (\w+)/i)?.[1];
                    console.log(`   📊 Creando índice: ${indexName}`);
                } else if (command.toLowerCase().includes('create trigger')) {
                    const triggerName = command.match(/create trigger (\w+)/i)?.[1];
                    console.log(`   ⚡ Creando trigger: ${triggerName}`);
                } else if (command.toLowerCase().includes('create function')) {
                    const functionName = command.match(/create (?:or replace )?function (\w+)/i)?.[1];
                    console.log(`   🔧 Creando función: ${functionName}`);
                } else if (command.toLowerCase().includes('create view')) {
                    const viewName = command.match(/create view (\w+)/i)?.[1];
                    console.log(`   👁️ Creando vista: ${viewName}`);
                } else if (command.toLowerCase().includes('alter table')) {
                    console.log(`   🔧 Modificando tabla`);
                } else if (command.toLowerCase().includes('create policy')) {
                    console.log(`   🔐 Creando política RLS`);
                }
                
                const { data, error } = await supabase.rpc('exec_sql', {
                    sql_query: command + ';'
                });
                
                if (error) {
                    console.error(`   ❌ Error: ${error.message}`);
                    errorCount++;
                } else {
                    console.log(`   ✅ Ejecutado correctamente`);
                    successCount++;
                }
                
            } catch (err) {
                console.error(`   ❌ Error inesperado: ${err.message}`);
                errorCount++;
            }
            
            // Pequeña pausa entre comandos
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('\n📊 RESUMEN DE EJECUCIÓN:');
        console.log(`✅ Comandos exitosos: ${successCount}`);
        console.log(`❌ Comandos con error: ${errorCount}`);
        console.log(`📈 Total procesados: ${successCount + errorCount}`);
        
        if (errorCount === 0) {
            console.log('\n🎉 ¡Schema creado exitosamente!');
            
            // Verificar las tablas creadas
            await verifyTables();
            
        } else {
            console.log('\n⚠️  Se completó con algunos errores. Revisar los logs.');
        }
        
    } catch (error) {
        console.error('💥 Error fatal:', error.message);
        process.exit(1);
    }
}

async function verifyTables() {
    console.log('\n🔍 Verificando tablas creadas...');
    
    const expectedTables = [
        'clients',
        'contracts', 
        'payments',
        'client_communications',
        'client_documents',
        'client_alerts'
    ];
    
    for (const table of expectedTables) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('count', { count: 'exact', head: true });
                
            if (error) {
                console.log(`   ❌ ${table}: No existe o error`);
            } else {
                console.log(`   ✅ ${table}: Tabla creada correctamente`);
            }
        } catch (err) {
            console.log(`   ❌ ${table}: Error al verificar`);
        }
    }
    
    console.log('\n📋 Verificando vistas...');
    
    // Verificar vistas
    try {
        const { data, error } = await supabase
            .from('clients_summary')
            .select('count', { count: 'exact', head: true });
            
        if (!error) {
            console.log('   ✅ clients_summary: Vista creada correctamente');
        }
    } catch (err) {
        console.log('   ❌ clients_summary: Error al verificar vista');
    }
    
    try {
        const { data, error } = await supabase
            .from('upcoming_payments')
            .select('count', { count: 'exact', head: true });
            
        if (!error) {
            console.log('   ✅ upcoming_payments: Vista creada correctamente');
        }
    } catch (err) {
        console.log('   ❌ upcoming_payments: Error al verificar vista');
    }
}

// Función alternativa para ejecutar SQL directo
async function executeDirectSQL() {
    console.log('🔄 Intentando ejecución directa del SQL...\n');
    
    try {
        const sqlFilePath = path.join(__dirname, 'create_clients_schema.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        
        // Ejecutar todo el SQL de una vez
        const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: sqlContent
        });
        
        if (error) {
            console.error('❌ Error ejecutando SQL:', error.message);
            return false;
        } else {
            console.log('✅ SQL ejecutado correctamente');
            await verifyTables();
            return true;
        }
        
    } catch (err) {
        console.error('💥 Error:', err.message);
        return false;
    }
}

// Ejecutar el script
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('🏗️  CREADOR DE SCHEMA - SISTEMA DE CLIENTES');
    console.log('==========================================\n');
    
    // Primero intentar ejecución por comandos
    executeSchema().catch(async (error) => {
        console.log('\n🔄 Intentando método alternativo...');
        const success = await executeDirectSQL();
        if (!success) {
            console.log('\n💡 INSTRUCCIONES MANUALES:');
            console.log('1. Abrir Supabase Dashboard');
            console.log('2. Ir a SQL Editor');
            console.log('3. Copiar el contenido de create_clients_schema.sql');
            console.log('4. Ejecutar el script completo');
        }
    });
}

export { executeSchema, verifyTables };
