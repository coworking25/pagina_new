// Script simple para probar conectividad con Supabase
const https = require('https');

const SUPABASE_URL = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMzA0NjIsImV4cCI6MjA3MTkwNjQ2Mn0.ngCP1rv5jLYnJlNnuEtshyHsa1FILqBq89bcjv9pshY';

console.log('🔧 Probando conectividad con Supabase...');

const options = {
  hostname: 'gfczfjpyyyyvteyrvhgt.supabase.co',
  port: 443,
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
  }
};

const req = https.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  console.log(`✅ Headers: ${JSON.stringify(res.headers, null, 2)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Respuesta recibida exitosamente');
    console.log('📊 Tamaño de datos:', data.length, 'bytes');
    if (res.statusCode === 200) {
      console.log('🎉 Conectividad con Supabase EXITOSA');
    } else {
      console.log('❌ Error en respuesta:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error de conexión:', e.message);
});

req.setTimeout(10000, () => {
  console.error('❌ Timeout: La conexión tardó más de 10 segundos');
  req.destroy();
});

req.end();
