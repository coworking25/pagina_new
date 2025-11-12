# 🔍 DIAGNÓSTICO: Portal de Clientes No Permite Ingreso

## ✅ Validaciones Realizadas

### 1. **Código de Autenticación** ✅
- **Archivo**: `src/lib/client-portal/clientAuth.ts`
- **Estado**: Código correcto
- **Funciones principales**:
  - `clientLogin()`: Verifica credenciales y crea sesión
  - `getSession()`: Recupera sesión de localStorage
  - `verifySession()`: Valida sesión activa

### 2. **Componente de Login** ✅
- **Archivo**: `src/pages/Login.tsx`
- **Estado**: Configurado correctamente
- **Flujo**:
  - Usuario selecciona "Cliente"
  - Ingresa email y contraseña
  - Llama a `clientLogin()`
  - Navega a `/cliente/dashboard` si es exitoso

### 3. **Layout de Cliente** ✅
- **Archivo**: `src/components/client-portal/ClientLayout.tsx`
- **Estado**: Con protección de ruta
- **Funcionalidad**:
  - Verifica sesión al cargar
  - Redirige a `/login` si no hay sesión

### 4. **Rutas Configuradas** ✅
- **Archivo**: `src/App.tsx`
- **Rutas del portal**:
  - `/cliente/dashboard`
  - `/cliente/contratos`
  - `/cliente/pagos`
  - `/cliente/extractos`
  - `/cliente/documentos`
  - `/cliente/perfil`
  - `/cliente/cambiar-password`

---

## 🚨 POSIBLES PROBLEMAS

### **Problema 1: Tabla `client_credentials` no existe o está vacía**

**Síntoma**: Error al intentar login o credenciales no encontradas

**Validar**:
```sql
-- Verificar si existe la tabla
SELECT * FROM client_credentials LIMIT 5;

-- Ver estructura
\d client_credentials;
```

**Solución**: Crear la tabla si no existe
```sql
-- Ver archivo: create_client_credentials_table.sql en el proyecto
```

---

### **Problema 2: No hay credenciales de cliente creadas**

**Síntoma**: "Email o contraseña incorrectos" siempre

**Validar**:
```sql
-- Ver si hay clientes con credenciales
SELECT 
  cc.id,
  cc.email,
  cc.is_active,
  c.full_name
FROM client_credentials cc
JOIN clients c ON c.id = cc.client_id
WHERE cc.is_active = true;
```

**Solución**: Crear credenciales para un cliente
```sql
-- Usar el script: src/lib/client-portal/createClientCredentials.ts
-- O crear manualmente desde AdminClients
```

---

### **Problema 3: bcryptjs no está instalado**

**Síntoma**: Error en consola: "Cannot find module 'bcryptjs'"

**Validar**:
```bash
npm list bcryptjs
```

**Solución**:
```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

---

### **Problema 4: Políticas RLS bloqueando acceso**

**Síntoma**: Error 403 o políticas de seguridad

**Validar**:
```sql
-- Ver políticas de client_credentials
SELECT * FROM pg_policies WHERE tablename = 'client_credentials';

-- Ver políticas de clients
SELECT * FROM pg_policies WHERE tablename = 'clients';
```

**Solución**: Asegurar que las políticas permitan lectura
```sql
-- Política para client_credentials
CREATE POLICY "Permitir lectura de credenciales para autenticación"
ON client_credentials FOR SELECT
USING (true);

-- Política para clients (lectura propia)
CREATE POLICY "Clientes pueden ver su propia información"
ON clients FOR SELECT
USING (id IN (
  SELECT client_id FROM client_credentials 
  WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
));
```

---

### **Problema 5: Session Storage/LocalStorage bloqueado**

**Síntoma**: Sesión no se guarda

**Validar en consola del navegador**:
```javascript
// Verificar si localStorage funciona
localStorage.setItem('test', 'value');
console.log(localStorage.getItem('test'));
localStorage.removeItem('test');

// Ver sesión actual del cliente
console.log(localStorage.getItem('client_portal_session'));
```

**Solución**: 
- Habilitar cookies y storage en el navegador
- Revisar configuración de privacidad

---

## 📋 PASOS PARA DIAGNOSTICAR

### **Paso 1: Verificar que exista la tabla**
```bash
# Conectar a Supabase y ejecutar:
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'client_credentials';
```

### **Paso 2: Crear credencial de prueba**
```sql
-- Obtener ID de un cliente existente
SELECT id, full_name, email FROM clients LIMIT 1;

-- Crear credencial (la contraseña será hasheada en el proceso)
-- Usar el AdminClients UI o ejecutar:
-- Hash de "password123": $2a$10$ejemplo...
```

### **Paso 3: Probar login en consola del navegador**
```javascript
// Abrir consola del navegador (F12)
// Ir a /login
// Seleccionar "Cliente"
// Intentar login y ver errores en Network tab
```

### **Paso 4: Revisar Network en DevTools**
- Abrir DevTools (F12)
- Ir a pestaña "Network"
- Intentar login
- Ver la respuesta de la petición
- Buscar errores 400, 403, 500

---

## 🔧 SOLUCIÓN RÁPIDA

### **Si no existe la tabla `client_credentials`:**

1. **Crear la tabla**:
```sql
CREATE TABLE IF NOT EXISTS client_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  must_change_password BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  last_password_change TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  reset_token TEXT,
  reset_token_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_client_credentials_client_id ON client_credentials(client_id);
CREATE INDEX idx_client_credentials_email ON client_credentials(email);

-- Políticas RLS
ALTER TABLE client_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura para autenticación"
ON client_credentials FOR SELECT
USING (true);
```

2. **Crear credencial de prueba desde Admin**:
   - Ir a `/admin/clients`
   - Seleccionar un cliente
   - Hacer clic en "Crear Credenciales"
   - Se generará email y contraseña temporal

3. **Probar login**:
   - Ir a `/login`
   - Seleccionar "Cliente"
   - Usar las credenciales generadas

---

## 🎯 CHECKLIST DE VERIFICACIÓN

- [ ] Tabla `client_credentials` existe
- [ ] Hay al menos 1 credencial activa
- [ ] bcryptjs está instalado
- [ ] LocalStorage funciona en el navegador
- [ ] No hay errores en consola del navegador
- [ ] No hay errores 403/401 en Network tab
- [ ] Las rutas `/cliente/*` están configuradas
- [ ] El componente ClientLayout está importado

---

## 📞 SI EL PROBLEMA PERSISTE

**Información a recopilar**:
1. Error exacto en consola del navegador
2. Respuesta del Network tab al hacer login
3. Resultado de: `SELECT * FROM client_credentials LIMIT 1;`
4. Screenshot del error mostrado

**Con esta información puedo ayudarte a resolver el problema específico.**
