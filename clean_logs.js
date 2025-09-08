import fs from 'fs';

// Leer el archivo
const filePath = './src/lib/supabase.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Eliminar todas las líneas que empiecen con console.log pero preservar console.error
const lines = content.split('\n');
const cleanLines = lines.filter(line => {
  const trimmedLine = line.trim();
  return !trimmedLine.startsWith('console.log(');
});

// Escribir el archivo limpio
fs.writeFileSync(filePath, cleanLines.join('\n'));

console.log('✅ Archivo limpio de console.log');
