# 🎯 ARQUITECTURA DE PERMISOS - ADMIN CON ACCESO TOTAL

**Fecha:** 20 de Octubre, 2025  
**Sistema:** Panel de Administración - Coworking

---

## 🏗️ **ARQUITECTURA DEL SISTEMA:**

```
┌─────────────────────────────────────────────────────────┐
│                  USUARIOS DEL SISTEMA                    │
└─────────────────────────────────────────────────────────┘
                           │
                           ├─────────────────┬──────────────┐
                           │                 │              │
                    ┌──────▼──────┐   ┌─────▼─────┐  ┌────▼─────┐
                    │   ADMINS    │   │  CLIENTS  │  │  PUBLIC  │
                    │  (advisors) │   │  (portal) │  │  (web)   │
                    └──────┬──────┘   └─────┬─────┘  └────┬─────┘
                           │                │              │
                           │                │              │
                  ┌────────▼────────┐      │              │
                  │  ACCESO TOTAL   │      │              │
                  │  - Ver todo     │      │              │
                  │  - Crear todo   │      │              │
                  │  - Editar todo  │      │              │
                  │  - Eliminar todo│      │              │
                  └─────────────────┘      │              │
                                           │              │
                              ┌────────────▼──────┐       │
                              │  SOLO SUS DATOS   │       │
                              │  - Ver sus docs   │       │
                              │  - Ver sus citas  │       │
                              │  - Ver su contrato│       │
                              └───────────────────┘       │
                                                           │
                                              ┌────────────▼──────┐
                                              │  SOLO LECTURA     │
                                              │  - Ver propiedades│
                                              │  - Enviar consulta│
                                              └───────────────────┘
```

---

## 🔑 **SISTEMA DE AUTENTICACIÓN:**

### **1. Tabla: advisors (ADMINISTRADORES)**

```sql
CREATE TABLE advisors (
  id UUID PRIMARY KEY,           -- ← Mismo que auth.uid() de Supabase Auth
  full_name TEXT,
  email TEXT,
  phone TEXT,
  active BOOLEAN,                -- ← true = tiene acceso, false = bloqueado
  role TEXT,                     -- 'admin', 'advisor', 'viewer', etc.
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Flujo de Autenticación:**

```
1. Usuario ingresa email + password
   ↓
2. Supabase Auth valida credenciales
   ↓
3. Genera token JWT con auth.uid()
   ↓
4. Cada request incluye el token
   ↓
5. RLS verifica: ¿Este auth.uid() existe en advisors?
   ↓
   SÍ → Acceso total ✅
   NO → Bloqueado ❌
```

---

## 🔒 **ROW LEVEL SECURITY (RLS):**

### **Concepto:**

RLS es una **capa de seguridad a nivel de base de datos** que filtra automáticamente qué filas puede ver/modificar cada usuario.

### **Ejemplo práctico:**

```sql
-- Política para la tabla "clients"
CREATE POLICY "Advisors have full access to clients" 
ON clients
FOR ALL                           -- ← SELECT, INSERT, UPDATE, DELETE
USING (                           -- ← ¿Qué filas puedo VER/MODIFICAR/ELIMINAR?
  EXISTS (
    SELECT 1 
    FROM advisors 
    WHERE id = auth.uid()         -- ← Mi usuario está en advisors?
    AND active = true             -- ← Y está activo?
  )
)
WITH CHECK (                      -- ← ¿Qué filas puedo CREAR/ACTUALIZAR?
  EXISTS (
    SELECT 1 
    FROM advisors 
    WHERE id = auth.uid() 
    AND active = true
  )
);
```

### **¿Qué hace esto?**

```typescript
// FRONTEND: Intentar ver clientes
const { data } = await supabase.from('clients').select('*');

// SUPABASE INTERNAMENTE:
if (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid() AND active = true)) {
  // ✅ Usuario es admin activo
  return SELECT * FROM clients; // Devuelve TODOS los clientes
} else {
  // ❌ Usuario NO es admin
  return []; // Devuelve lista vacía (sin error)
}
```

---

## 🎯 **TU PROBLEMA ESPECÍFICO:**

### **Síntoma:**
```
- Eliminar cliente → "Cliente eliminado correctamente"
- Refrescar (F5) → Cliente vuelve a aparecer
```

### **Causa:**
```
auth.uid() = "abc123..."        ← Tu ID de sesión
advisors.id = "xyz789..."       ← IDs en la tabla

auth.uid() ≠ advisors.id        ← ¡NO COINCIDEN!

Resultado: RLS bloquea el DELETE
```

### **Solución:**
```sql
-- Agregar tu auth.uid() a la tabla advisors
INSERT INTO advisors (id, ...) VALUES (auth.uid(), ...);

Ahora:
auth.uid() = "abc123..."
advisors.id = "abc123..."       ← ¡COINCIDEN!

Resultado: RLS permite el DELETE ✅
```

---

## 📊 **TABLAS DEL SISTEMA Y SUS POLÍTICAS:**

### **Grupo 1: CLIENTES**
```
✅ clients                      → Acceso total para advisors
✅ client_portal_credentials    → Acceso total para advisors
✅ client_documents             → Acceso total para advisors
✅ client_payment_config        → Acceso total para advisors
✅ client_references            → Acceso total para advisors
✅ client_contract_info         → Acceso total para advisors
✅ client_property_relations    → Acceso total para advisors
```

### **Grupo 2: PROPIEDADES**
```
✅ properties                   → Acceso total para advisors
✅ property_images              → Acceso total para advisors
```

### **Grupo 3: OPERACIONES**
```
✅ appointments                 → Acceso total para advisors
✅ inquiries                    → Acceso total para advisors
```

### **Grupo 4: ANALYTICS**
```
✅ analytics_page_views         → Acceso total para advisors
✅ analytics_property_views     → Acceso total para advisors
```

---

## 🔧 **COMANDOS Y PERMISOS:**

### **FOR ALL incluye 4 comandos:**

| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| **SELECT** | Ver/Leer datos | `SELECT * FROM clients` |
| **INSERT** | Crear nuevos registros | `INSERT INTO clients (...)` |
| **UPDATE** | Modificar registros | `UPDATE clients SET ... WHERE id = ...` |
| **DELETE** | Eliminar registros | `DELETE FROM clients WHERE id = ...` |

### **USING vs WITH CHECK:**

```sql
USING (...)      → Filtra qué filas puedes VER/MODIFICAR/ELIMINAR
WITH CHECK (...)  → Valida qué filas puedes CREAR/ACTUALIZAR

Ejemplo:
- USING = "Solo admins pueden ver TODOS los clientes"
- WITH CHECK = "Solo admins pueden crear/modificar clientes"
```

---

## 🛡️ **SEGURIDAD MULTI-NIVEL:**

```
Nivel 1: SUPABASE AUTH
├─ Usuario debe estar autenticado
├─ Token JWT válido
└─ auth.uid() identificado

Nivel 2: TABLA ADVISORS
├─ auth.uid() debe existir en advisors
├─ active = true
└─ role = 'admin' (opcional)

Nivel 3: ROW LEVEL SECURITY (RLS)
├─ Cada tabla tiene sus políticas
├─ Verifica USING y WITH CHECK
└─ Filtra automáticamente los datos

Nivel 4: FRONTEND (opcional)
├─ Validación adicional en UI
├─ Roles y permisos visuales
└─ Protección de rutas
```

---

## 🎓 **EJEMPLOS DE POLÍTICAS:**

### **Política Básica (Admin ve todo):**
```sql
CREATE POLICY "admin_all_access" 
ON clients FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));
```

### **Política por Rol:**
```sql
CREATE POLICY "admin_delete_only" 
ON clients FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM advisors 
    WHERE id = auth.uid() 
    AND role = 'admin'           -- ← Solo role='admin' puede eliminar
  )
);
```

### **Política Cliente (solo sus datos):**
```sql
CREATE POLICY "clients_own_data" 
ON client_documents FOR SELECT
USING (client_id = auth.uid());  -- ← Solo ve sus propios documentos
```

---

## ✅ **CHECKLIST DE CONFIGURACIÓN:**

```
📋 CONFIGURACIÓN COMPLETA DEL ADMIN:

1. [ ] Usuario creado en Supabase Auth
2. [ ] Usuario agregado a tabla "advisors"
3. [ ] active = true en advisors
4. [ ] role = 'admin' en advisors (opcional)
5. [ ] Políticas RLS creadas para todas las tablas
6. [ ] Políticas usan "FOR ALL"
7. [ ] Políticas verifican advisors.id = auth.uid()
8. [ ] RLS habilitado en todas las tablas
9. [ ] FOREIGN KEYS con ON DELETE CASCADE
10. [ ] Probado: CRUD completo funciona
```

---

## 🚀 **SIGUIENTE ACCIÓN:**

### **Ejecuta el script:**
```sql
-- Archivo: CONFIGURACION_ADMIN_ACCESO_TOTAL.sql
```

### **Esto hará:**
1. ✅ Te registra como advisor (admin)
2. ✅ Crea/actualiza todas las políticas RLS
3. ✅ Te da acceso total a TODAS las tablas
4. ✅ Verifica que todo funcione

### **Después:**
1. Refresca tu aplicación (F5)
2. Prueba eliminar un cliente
3. El cliente debe desaparecer permanentemente ✅

---

## 📚 **RECURSOS:**

- **Supabase RLS Docs:** https://supabase.com/docs/guides/auth/row-level-security
- **PostgreSQL Policies:** https://www.postgresql.org/docs/current/sql-createpolicy.html
- **auth.uid():** https://supabase.com/docs/guides/auth/auth-helpers/auth-ui

---

**ESTADO:** ⏳ **Listo para ejecutar**  
**TIEMPO ESTIMADO:** < 2 minutos  
**IMPACTO:** Acceso total como administrador en todo el sistema
