// TEST SÚPER SIMPLE - Solo copia y pega esta línea en la consola

// Opción 1: Test con fetch directo (más confiable)
fetch('https://gfczfjpyyyyvteyrvhgt.supabase.co/rest/v1/service_inquiries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMzA0NjIsImV4cCI6MjA3MTkwNjQ2Mn0.ngCP1rv5jLYnJlNnuEtshyHsa1FILqBq89bcjv9pshY',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMzA0NjIsImV4cCI6MjA3MTkwNjQ2Mn0.ngCP1rv5jLYnJlNnuEtshyHsa1FILqBq89bcjv9pshY',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify({
    client_name: 'Test Consola Simple',
    client_phone: '+57 300 999 8888',
    service_type: 'arrendamientos',
    urgency: 'normal',
    details: 'Test desde consola con fetch directo',
    source: 'console_fetch_test'
  })
}).then(r => r.json()).then(d => console.log('✅ ÉXITO:', d)).catch(e => console.error('❌ ERROR:', e));

// Opción 2: Test con cliente Supabase (si está disponible)
// if (window.supabase) {
//   window.supabase.from('service_inquiries').insert([{
//     client_name: 'Test Global',
//     client_phone: '+57 300 777 6666',
//     service_type: 'ventas',
//     urgency: 'normal',
//     details: 'Test con cliente global',
//     source: 'global_test'
//   }]).select().then(r => console.log('✅ RESULTADO:', r)).catch(e => console.error('❌ ERROR:', e));
// }
