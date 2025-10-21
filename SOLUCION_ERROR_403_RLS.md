# 🔧 SOLUCIÓN AL ERROR 403 FORBIDDEN

**Fecha:** 20 de Octubre, 2025  
**Problema:** Solo se guardó 1/7 secciones del Wizard  
**Causa:** Políticas RLS (Row Level Security) bloqueando las inserciones

---

## 🚨 PROBLEMA IDENTIFICADO

### **Error en consola:**
```
POST https://.../rest/v1/client_property_relations 403 (Forbidden)

❌ Error: new row violates row-level security policy for table "client_property_relations"
```

### **Resultado:**
```
✅ Guardado exitosamente (1/7 secciones)

⚠️ Secciones con advertencias:
- Credenciales del portal no configuradas
- Configuración de pagos no guardada
- Referencias no agregadas
- Información del contrato no guardada
- Propiedades no asignadas
```

---

## 🔍 CAUSA RAÍZ

**Row Level Security (RLS)** en Supabase está bloqueando las inserciones en las siguientes tablas:

1. ❌ `client_portal_credentials`
2. ❌ `client_payment_config`
3. ❌ `client_references`
4. ❌ `client_contract_info`
5. ❌ `client_property_relations`
6. ❌ `client_documents`

Solo funcionó:
- ✅ `clients` (tabla principal)

---

## ✅ SOLUCIÓN - PASO A PASO

### **PASO 1: Abrir Supabase Dashboard**

1. Ve a: https://supabase.com/dashboard
2. Inicia sesión
3. Selecciona tu proyecto: `gfczfjpyyyyvteyrvhgt`

---

### **PASO 2: Ir al SQL Editor**

1. En el menú lateral, click en **"SQL Editor"**
2. Click en **"New query"**
3. Copia y pega el contenido del archivo: **`FIX_RLS_CLIENT_PROPERTY_RELATIONS.sql`**

**⚠️ IMPORTANTE:** Usa `FIX_RLS_CLIENT_PROPERTY_RELATIONS.sql` (no el otro archivo), ya que este:
- ✅ Incluye TODAS las tablas de clientes
- ✅ Usa `EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid())` para validar admins
- ✅ Tiene `WITH CHECK` necesario para INSERT

---

### **PASO 3: Ejecutar el script SQL**

1. **Copia TODO el contenido** del archivo `FIX_RLS_CLIENT_PROPERTY_RELATIONS.sql`
2. **Pega en SQL Editor** de Supabase
3. **Descomenta la sección final** (líneas 160-215) que dice "FIX COMPLETO PARA TODAS LAS TABLAS"
4. Click en **"Run"** (▶️) en la esquina inferior derecha
5. Espera a que termine (debería tomar ~10 segundos)

---

### **PASO 4: Verificar que no haya errores**

**✅ ÉXITO - Deberías ver:**
```
Success. No rows returned
```

**❌ ERROR - Si ves algo como:**
```
ERROR: relation "client_payment_config" does not exist
```

**Significa que esa tabla NO existe en tu base de datos.**

---

## 🔍 ¿QUÉ HACE EL SCRIPT?

El script SQL hace lo siguiente:

```sql
-- Para cada tabla relacionada con clientes:

1. Elimina políticas RLS antiguas/restrictivas
2. Crea una nueva política permisiva que permite:
   - ✅ INSERT (crear registros)
   - ✅ SELECT (leer registros)
   - ✅ UPDATE (actualizar registros)
   - ✅ DELETE (eliminar registros)
   
3. Para usuarios autenticados (TO authenticated)
4. Sin restricciones (USING true, WITH CHECK true)
```

---

## 📋 CHECKLIST DE EJECUCIÓN

- [ ] Supabase Dashboard abierto
- [ ] SQL Editor abierto
- [ ] Script `fix_rls_policies_clients.sql` copiado
- [ ] Script pegado en el editor
- [ ] Click en "Run" ▶️
- [ ] Sin errores en el resultado
- [ ] Políticas verificadas (ver consultas al final del script)

---

## 🧪 PROBAR NUEVAMENTE EL WIZARD

Después de ejecutar el script SQL:

1. **Vuelve a la aplicación:** http://localhost:5174/admin/clients
2. **Limpia la consola:** F12 → Click en 🚫
3. **Crea un nuevo cliente** con el Wizard
4. **Llena todos los campos** (especialmente):
   - ✅ Email y contraseña en Credenciales
   - ✅ Fecha de inicio en Contrato
   - ✅ Referencias personales/comerciales
   - ✅ Asignar al menos 1 propiedad (si tienes)

5. **Revisa la consola**

---

## 📊 RESULTADO ESPERADO

Después de arreglar RLS, deberías ver:

```
==============================================
📊 RESUMEN DE GUARDADO
==============================================
Cliente:       ✅ ID: 123
Credenciales:  ✅ Email: juan@example.com
Documentos:    ⚠️ 0/0 (si no subiste documentos)
Pagos:         ✅ 
Referencias:   ✅ P:2 C:1
Contrato:      ✅
Propiedades:   ✅ 1
==============================================
```

**Y el alert:**
```
✅ Cliente creado exitosamente con TODOS los datos!

📊 Resumen:
- Cliente: ✅ Creado
- Credenciales: ✅ Configuradas
- Documentos: ✅ 0 subidos
- Pagos: ✅ Configurados
- Referencias: ✅ 3 agregadas
- Contrato: ✅ Configurado
- Propiedades: ✅ 1 asignadas
```

---

## ⚠️ SI ALGUNA TABLA NO EXISTE

Si al ejecutar el script ves errores como:

```
ERROR: relation "client_payment_config" does not exist
```

**Significa que esa tabla NO está creada en tu base de datos.**

### **Opciones:**

**OPCIÓN A: Ignorar esas tablas**
- Comenta las líneas de esas tablas en el script SQL
- El Wizard mostrará ⚠️ para esas secciones (es normal)

**OPCIÓN B: Crear las tablas faltantes**
- Usa los scripts de creación de tablas que están en tu workspace
- Busca archivos como: `create_*.sql` o `*_migration.sql`

---

## 🔍 VERIFICAR POLÍTICAS ACTUALES

Para ver las políticas RLS actuales, ejecuta en SQL Editor:

```sql
SELECT 
  tablename,
  policyname,
  cmd as operacion,
  roles
FROM pg_policies
WHERE tablename LIKE 'client_%'
ORDER BY tablename, policyname;
```

Deberías ver políticas con nombres como:
- `admin_full_access_client_property_relations`
- `admin_full_access_client_portal_credentials`
- etc.

---

## 🎯 SIGUIENTE PASO

Después de ejecutar el script SQL:

1. **Prueba el Wizard nuevamente**
2. **Reporta los resultados:**
   ```
   ✅ DESPUÉS DE ARREGLAR RLS:
   
   Guardado exitosamente: ____ de 7 secciones
   
   Secciones con ✅:
   [ ] Cliente
   [ ] Credenciales
   [ ] Documentos
   [ ] Pagos
   [ ] Referencias
   [ ] Contrato
   [ ] Propiedades
   
   ¿Siguen apareciendo errores?
   [ ] No, todo funciona
   [ ] Sí, estos errores: [copia aquí]
   ```

---

## 📚 ARCHIVOS CREADOS

1. **`fix_rls_policies_clients.sql`** ← **EJECUTA ESTE EN SUPABASE**
2. **Este documento** - Instrucciones paso a paso

---

**¡Ejecuta el script SQL y dime cómo te va!** 🚀

---

**Generado por:** GitHub Copilot  
**Fecha:** 20 de Octubre, 2025
