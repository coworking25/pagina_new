// Generador de hash bcrypt para la contraseña
const bcrypt = require('bcryptjs');

const password = 'Test123456!';
const rounds = 10;

console.log('🔐 Generando hash bcrypt...');
console.log('Password:', password);
console.log('Rounds:', rounds);
console.log('');

// Generar hash
bcrypt.hash(password, rounds, (err, hash) => {
  if (err) {
    console.error('❌ Error:', err);
    return;
  }

  console.log('✅ Hash generado:');
  console.log(hash);
  console.log('');
  console.log('📋 SQL para actualizar en Supabase:');
  console.log('');
  console.log(`UPDATE client_credentials`);
  console.log(`SET password_hash = '${hash}',`);
  console.log(`    failed_login_attempts = 0,`);
  console.log(`    locked_until = NULL,`);
  console.log(`    updated_at = NOW()`);
  console.log(`WHERE email = 'carlos.propietario@test.com'`);
  console.log(`RETURNING id, email, is_active;`);
  console.log('');

  // Verificar que funciona
  bcrypt.compare(password, hash, (err, match) => {
    if (err) {
      console.error('❌ Error al verificar:', err);
      return;
    }
    console.log('🧪 Auto-verificación:', match ? '✅ Válido' : '❌ Error');
  });
});
