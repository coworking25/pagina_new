# 🎯 ACCIÓN INMEDIATA - ARREGLAR RLS

**Fecha:** 20 de Octubre, 2025  
**Problema:** Solo se guardó 1/7 secciones  
**Causa:** Políticas RLS sin `WITH CHECK`

---

## ⚡ 3 PASOS RÁPIDOS

### **1️⃣ ABRIR SUPABASE**
```
🌐 https://supabase.com/dashboard
→ Login
→ Proyecto: gfczfjpyyyyvteyrvhgt
→ SQL Editor (menú izquierdo)
→ New Query
```

### **2️⃣ COPIAR Y PEGAR ESTE CÓDIGO**

Abre el archivo `FIX_RLS_CLIENT_PROPERTY_RELATIONS.sql` y copia TODO, especialmente la sección final que dice:

```sql
-- ===================================================================
-- FIX COMPLETO PARA TODAS LAS TABLAS (SI NECESARIO)
-- ===================================================================

-- CLIENT_PORTAL_CREDENTIALS
DROP POLICY IF EXISTS "Admins have full access to credentials" ON client_portal_credentials;
CREATE POLICY "Admins have full access to credentials" 
ON client_portal_credentials
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- CLIENT_DOCUMENTS
DROP POLICY IF EXISTS "Admins have full access to documents" ON client_documents;
CREATE POLICY "Admins have full access to documents" 
ON client_documents
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- CLIENT_PAYMENT_CONFIG
DROP POLICY IF EXISTS "Admins have full access to payment configs" ON client_payment_config;
CREATE POLICY "Admins have full access to payment configs" 
ON client_payment_config
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- CLIENT_REFERENCES
DROP POLICY IF EXISTS "Admins have full access to references" ON client_references;
CREATE POLICY "Admins have full access to references" 
ON client_references
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- CLIENT_CONTRACT_INFO
DROP POLICY IF EXISTS "Admins have full access to contract info" ON client_contract_info;
CREATE POLICY "Admins have full access to contract info" 
ON client_contract_info
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- CLIENT_PROPERTY_RELATIONS
DROP POLICY IF EXISTS "Admins have full access to property relations" ON client_property_relations;
CREATE POLICY "Admins have full access to property relations" 
ON client_property_relations
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- CLIENTS (tabla principal)
DROP POLICY IF EXISTS "Admins have full access to clients" ON clients;
CREATE POLICY "Admins have full access to clients" 
ON clients
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));
```

### **3️⃣ EJECUTAR**
```
→ Pegar el código en SQL Editor
→ Click en "Run" ▶️
→ Esperar resultado
```

---

## ✅ RESULTADO ESPERADO

Deberías ver:
```
Success. No rows returned
```

O mensajes como:
```
DROP POLICY
CREATE POLICY
DROP POLICY
CREATE POLICY
...
```

---

## 🧪 PROBAR WIZARD NUEVAMENTE

Después de ejecutar el SQL:

1. **Vuelve a:** http://localhost:5174/admin/clients
2. **Limpia consola:** F12 → 🚫
3. **Crea otro cliente**
4. **Llena TODOS los campos** (especialmente credenciales y contrato)
5. **Observa el resumen final**

---

## 📊 AHORA DEBERÍAS VER

```
==============================================
📊 RESUMEN DE GUARDADO
==============================================
Cliente:       ✅ ID: XXX
Credenciales:  ✅ Email: xxx@example.com
Documentos:    ⚠️ 0/0
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

**Guardado exitosamente: 6-7 de 7 secciones** ✅

---

## ❌ SI SIGUEN APARECIENDO ERRORES

Si después de ejecutar el SQL TODAVÍA ves errores:

### **Error: "relation does not exist"**
→ Esa tabla NO existe en tu BD
→ Elimina esa parte del script
→ Es normal que falte

### **Error: "must be owner of table"**
→ No tienes permisos de administrador
→ Ve a Settings → Database → selecciona rol con más permisos
→ O contacta al dueño del proyecto

### **Error: "policy already exists"**
→ Ya existe esa política
→ Los `DROP POLICY IF EXISTS` deberían haberla eliminado
→ Ejecuta solo la parte de DROP primero, luego CREATE

---

## 📝 REPORTE DESPUÉS DE EJECUTAR

Copia esto y complétalo:

```
✅ RESULTADO DE ARREGLO RLS:

¿Se ejecutó el script sin errores?
[ ] Sí, todo OK
[ ] Sí, pero con advertencias de tablas faltantes (normal)
[ ] No, hay errores: [copia aquí]

Después de probar el Wizard nuevamente:

Guardado exitosamente: ____ de 7 secciones

¿Qué secciones tienen ✅?
[ ] Cliente
[ ] Credenciales
[ ] Documentos (si subiste)
[ ] Pagos
[ ] Referencias
[ ] Contrato
[ ] Propiedades

¿Siguen apareciendo errores 403 Forbidden?
[ ] No, todos se arreglaron ✅
[ ] Sí, en estas tablas: [lista aquí]
```

---

## 🎯 QUÉ ARREGLA ESTE SCRIPT

**ANTES (❌):**
```sql
CREATE POLICY "..." ON table
FOR ALL
USING (...);  -- ❌ Solo USING
```

**Problema:** `USING` solo valida SELECT/UPDATE/DELETE, **NO INSERT**

**DESPUÉS (✅):**
```sql
CREATE POLICY "..." ON table
FOR ALL
USING (...)       -- ✅ Para SELECT/UPDATE/DELETE
WITH CHECK (...); -- ✅ Para INSERT/UPDATE (nuevos valores)
```

**Resultado:** Ahora INSERT funciona ✅

---

**¡Ejecuta el script SQL y repórtame los resultados!** 🚀

---

**Generado por:** GitHub Copilot  
**Fecha:** 20 de Octubre, 2025
