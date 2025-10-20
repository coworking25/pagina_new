// =====================================================
// SCRIPT: Generar Hash de Contraseña con bcrypt
// =====================================================
// Uso: node generate_password_hash.cjs
// =====================================================

const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'Cliente123';
  const saltRounds = 10;
  
  console.log('🔐 Generando hash para contraseña: Cliente123\n');
  
  const hash = await bcrypt.hash(password, saltRounds);
  
  console.log('✅ Hash generado:\n');
  console.log(hash);
  console.log('\n📋 SQL para actualizar en Supabase:\n');
  console.log(`UPDATE client_credentials`);
  console.log(`SET password_hash = '${hash}'`);
  console.log(`WHERE email = 'diegorpo9608@gmail.com';`);
  console.log('\n🧪 Verificando que el hash funciona...\n');
  
  const isValid = await bcrypt.compare(password, hash);
  console.log(`Resultado de bcrypt.compare('Cliente123', hash): ${isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
}

generateHash().catch(console.error);
