import bcrypt from 'bcryptjs';

const password = 'test123Nuevo*';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('Password:', password);
console.log('Hash:', hash);

// Verificar que funciona
const isValid = bcrypt.compareSync(password, hash);
console.log('Verification:', isValid);
