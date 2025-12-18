# 🔍 DIAGNÓSTICO: Login de Cliente Carlos

**Email:** carlos.propietario@test.com  
**Password:** Test123456!  
**Fecha:** Diciembre 18, 2025

---

## 📋 PASOS PARA DIAGNOSTICAR

### PASO 1: Ejecutar Script SQL de Diagnóstico

Abre el **SQL Editor** en Supabase y ejecuta el archivo:
```
sql/DIAGNOSTICO_CLIENTE_CARLOS.sql
```

Este script verificará:
1. ✅ Si existe el cliente en tabla `clients`
2. ✅ Si existen credenciales en tabla `client_credentials`
3. ✅ Si están relacionados correctamente (client_id)
4. ✅ Si tiene propiedades asignadas
5. ✅ Si el `client_type` es 'owner'
6. ✅ Si `portal_access_enabled` es `true`
7. ✅ Si la cuenta está bloqueada

---

## 🔧 PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: Credencial NO existe
**Síntoma:** La consulta de `client_credentials` no devuelve resultados

**Solución:**
1. Ve a `/admin/clients`
2. Busca al cliente "Carlos"
3. Click en el ícono 👁️ (Ver detalles)
4. Ve a la pestaña **"Credenciales"**
5. Si no tiene credenciales, click en **"Crear Credenciales del Portal"**
6. El sistema generará automáticamente:
   - Email: carlos.propietario@test.com
   - Password temporal: Test123456!
   - Hash bcrypt de la contraseña
   - `portal_access_enabled`: true
   - `must_change_password`: true

---

### Problema 2: Portal Access Disabled
**Síntoma:** `portal_access_enabled = false`

**Solución SQL:**
```sql
UPDATE client_credentials 
SET portal_access_enabled = true,
    updated_at = NOW()
WHERE email = 'carlos.propietario@test.com';
```

---

### Problema 3: Cuenta Bloqueada
**Síntoma:** `account_locked_until` tiene una fecha futura

**Causa:** Más de 5 intentos fallidos de login

**Solución SQL:**
```sql
UPDATE client_credentials 
SET account_locked_until = NULL,
    failed_login_attempts = 0,
    updated_at = NOW()
WHERE email = 'carlos.propietario@test.com';
```

---

### Problema 4: Cliente NO es Propietario
**Síntoma:** `client_type` es 'renter', 'buyer', 'seller', etc. (no 'owner')

**Causa:** Solo los propietarios pueden acceder al portal

**Solución SQL:**
```sql
UPDATE clients 
SET client_type = 'owner',
    updated_at = NOW()
WHERE email = 'carlos.propietario@test.com';
```

---

### Problema 5: Password Hash Incorrecto
**Síntoma:** Login falla incluso con credenciales correctas

**Causa:** El hash de la contraseña no coincide

**Solución:** Regenerar credenciales desde Admin:
1. Ve a `/admin/clients`
2. Abre el cliente
3. Pestaña **"Credenciales"**
4. Click en **"Regenerar Contraseña"**
5. Usa la contraseña: `Test123456!`

---

## 🧪 PRUEBA MANUAL RÁPIDA

### Script SQL para verificar hash de contraseña:

```sql
-- Obtener el hash actual
SELECT 
  email,
  password_hash,
  portal_access_enabled,
  must_change_password,
  failed_login_attempts,
  account_locked_until
FROM client_credentials
WHERE email = 'carlos.propietario@test.com';
```

**Resultado esperado:**
```json
{
  "email": "carlos.propietario@test.com",
  "password_hash": "$2a$10$...", // Hash bcrypt de Test123456!
  "portal_access_enabled": true,
  "must_change_password": true,
  "failed_login_attempts": 0,
  "account_locked_until": null
}
```

---

## 🔐 GENERAR NUEVO HASH MANUALMENTE (Si es necesario)

Si necesitas generar un nuevo hash para la contraseña `Test123456!`:

### Opción A: Desde Node.js (Consola del navegador en /admin)

```javascript
// Pega esto en la consola del navegador (en cualquier página de admin)
import('bcryptjs').then(bcrypt => {
  const password = 'Test123456!';
  bcrypt.hash(password, 10).then(hash => {
    console.log('Hash generado:', hash);
    console.log('Ahora ejecuta este SQL:');
    console.log(`UPDATE client_credentials SET password_hash = '${hash}', updated_at = NOW() WHERE email = 'carlos.propietario@test.com';`);
  });
});
```

### Opción B: Usar herramienta online
1. Ve a: https://bcrypt-generator.com/
2. Ingresa password: `Test123456!`
3. Rounds: `10`
4. Genera el hash
5. Ejecuta el SQL:

```sql
UPDATE client_credentials 
SET password_hash = '$2a$10$TU_HASH_AQUI',
    updated_at = NOW()
WHERE email = 'carlos.propietario@test.com';
```

---

## 📱 FLUJO DE LOGIN COMPLETO

### 1. Usuario ingresa credenciales
```
Email: carlos.propietario@test.com
Password: Test123456!
Tipo: Cliente (botón azul)
```

### 2. Sistema valida (archivo: `clientAuth.ts`)

```typescript
// 1. Buscar credencial en BD
const credential = await supabase
  .from('client_credentials')
  .select('*')
  .eq('email', 'carlos.propietario@test.com')
  .maybeSingle();

// 2. Verificar si está activo
if (!credential.is_active) {
  return { error: 'Cuenta desactivada' };
}

// 3. Verificar si está bloqueado
if (credential.locked_until && new Date(credential.locked_until) > new Date()) {
  return { error: 'Cuenta bloqueada' };
}

// 4. Verificar contraseña con bcrypt
const passwordMatch = await bcrypt.compare(password, credential.password_hash);

// 5. Si coincide, crear sesión
const session = {
  client_id: credential.client_id,
  email: credential.email,
  must_change_password: credential.must_change_password
};

// 6. Guardar en localStorage
localStorage.setItem('client_portal_session', JSON.stringify(session));

// 7. Redirigir
if (must_change_password) {
  navigate('/cliente/cambiar-password');
} else {
  navigate('/cliente/dashboard');
}
```

---

## 🚨 ERRORES COMUNES EN CONSOLA

### Error: "Email o contraseña incorrectos"
**Posibles causas:**
1. Credencial no existe en BD
2. Password hash no coincide
3. Email escrito mal (case-sensitive en BD)

**Verificar en consola del navegador:**
```javascript
// Abrir DevTools (F12)
// Ver mensajes de console.log en clientAuth.ts:
// 🔐 Verificando contraseña...
// Password ingresado: Test123456!
// Hash en BD: $2a$10$...
// ¿Contraseña coincide?: false ❌
```

### Error: "Cuenta bloqueada hasta..."
**Causa:** Más de 5 intentos fallidos

**Solución:** Ejecutar SQL de desbloqueo (ver Problema 3)

### Error: "Tu cuenta está desactivada"
**Causa:** `is_active = false` en client_credentials

**Solución:**
```sql
UPDATE client_credentials 
SET is_active = true 
WHERE email = 'carlos.propietario@test.com';
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

Marca cada punto después de verificar:

- [ ] 1. Cliente existe en tabla `clients`
- [ ] 2. Email es: `carlos.propietario@test.com` (exactamente)
- [ ] 3. `client_type = 'owner'` (Propietario)
- [ ] 4. `status = 'active'` en tabla `clients`
- [ ] 5. Credencial existe en tabla `client_credentials`
- [ ] 6. `portal_access_enabled = true`
- [ ] 7. `is_active = true`
- [ ] 8. `account_locked_until = NULL` (no bloqueado)
- [ ] 9. `failed_login_attempts < 5`
- [ ] 10. Password hash es válido (bcrypt)
- [ ] 11. Tiene propiedades asignadas (opcional pero recomendado)

---

## 🎯 SOLUCIÓN RÁPIDA: SCRIPT COMPLETO

Si todo falla, ejecuta este script para resetear completamente:

```sql
-- 1. Asegurar que el cliente existe y es propietario
UPDATE clients 
SET client_type = 'owner',
    status = 'active',
    updated_at = NOW()
WHERE email = 'carlos.propietario@test.com';

-- 2. Si NO existe credencial, crearla (ajusta el client_id)
-- Primero obtén el client_id:
SELECT id FROM clients WHERE email = 'carlos.propietario@test.com';

-- Luego inserta (reemplaza 'uuid-del-cliente' con el ID real):
INSERT INTO client_credentials (
  client_id,
  email,
  password_hash,
  portal_access_enabled,
  must_change_password,
  is_active
)
VALUES (
  'uuid-del-cliente',
  'carlos.propietario@test.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Hash de Test123456!
  true,
  true,
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  portal_access_enabled = true,
  is_active = true,
  account_locked_until = NULL,
  failed_login_attempts = 0,
  updated_at = NOW();

-- 3. Verificar resultado
SELECT 
  c.id,
  c.full_name,
  c.email,
  c.client_type,
  cc.portal_access_enabled,
  cc.is_active,
  cc.account_locked_until
FROM clients c
LEFT JOIN client_credentials cc ON c.id = cc.client_id
WHERE c.email = 'carlos.propietario@test.com';
```

**Hash incluido:** `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`  
**Password:** `Test123456!`

---

## 📞 PRÓXIMOS PASOS

1. **Ejecuta el script de diagnóstico** → `DIAGNOSTICO_CLIENTE_CARLOS.sql`
2. **Revisa los resultados** y comparte capturas
3. **Aplica la solución** correspondiente según el problema encontrado
4. **Prueba el login** en `/login` seleccionando "Cliente"
5. **Si sigue fallando**, ejecuta el "Script Completo" de arriba

---

## 🎬 VIDEO DE REFERENCIA (Si se creó)

Si existe documentación visual:
- `INSTRUCCIONES_PRUEBA_PORTAL_CLIENTE.md` - Guía paso a paso

---

**Nota:** El hash de contraseña `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy` ya está pre-generado para la contraseña `Test123456!` y puedes usarlo directamente.
