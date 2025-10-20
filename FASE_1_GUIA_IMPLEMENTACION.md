# 🚀 GUÍA DE IMPLEMENTACIÓN - PORTAL DE CLIENTES
## Versión Completa - Paso a Paso

---

## ✅ FASE 1: BASE DE DATOS (COMPLETADA)

### 📋 Scripts SQL Creados

Todos los scripts están en la carpeta `/sql/`:

1. ✅ `01_client_portal_credentials.sql` - Tabla de credenciales
2. ✅ `02_extend_payments_table.sql` - Extender tabla payments
3. ✅ `03_row_level_security.sql` - Seguridad RLS
4. ✅ `04_extract_functions.sql` - Funciones de extractos
5. ✅ `05_storage_buckets.sql` - Configuración de storage

---

## 🔧 PASO 1: EJECUTAR SCRIPTS EN SUPABASE

### Instrucciones:

1. **Abrir Supabase Dashboard**
   - Ve a: https://supabase.com/dashboard
   - Selecciona tu proyecto
   - Click en "SQL Editor" en el menú lateral

2. **Ejecutar Script 1: Credenciales**
   ```
   - Abrir: sql/01_client_portal_credentials.sql
   - Copiar TODO el contenido
   - Pegar en SQL Editor
   - Click en "Run" (▶️)
   - Verificar que dice: "Success. No rows returned"
   ```

3. **Ejecutar Script 2: Payments**
   ```
   - Abrir: sql/02_extend_payments_table.sql
   - Copiar TODO el contenido
   - Pegar en SQL Editor
   - Click en "Run" (▶️)
   - Verificar éxito
   ```

4. **Ejecutar Script 3: RLS**
   ```
   - Abrir: sql/03_row_level_security.sql
   - Copiar TODO el contenido
   - Pegar en SQL Editor
   - Click en "Run" (▶️)
   - Verificar políticas creadas
   ```

5. **Ejecutar Script 4: Funciones**
   ```
   - Abrir: sql/04_extract_functions.sql
   - Copiar TODO el contenido
   - Pegar en SQL Editor
   - Click en "Run" (▶️)
   - Verificar funciones creadas
   ```

6. **Configurar Storage (Manual)**
   ```
   - Click en "Storage" en menú lateral
   - Click "Create a new bucket"
   
   Crear 3 buckets:
   
   a) Nombre: client-documents
      - Public: NO
      - File size limit: 10 MB
      - Allowed mime types: application/pdf,image/*
   
   b) Nombre: client-contracts
      - Public: NO
      - File size limit: 20 MB
      - Allowed mime types: application/pdf
   
   c) Nombre: payment-receipts
      - Public: NO
      - File size limit: 5 MB
      - Allowed mime types: application/pdf,image/*
   ```

---

## 📊 VERIFICACIÓN DE LA BASE DE DATOS

### Ejecutar en SQL Editor:

```sql
-- 1. Verificar que la tabla client_credentials existe
SELECT COUNT(*) FROM client_credentials;

-- 2. Verificar columnas nuevas en payments
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'payments' 
  AND column_name IN ('recipient_type', 'payment_direction');

-- 3. Verificar políticas RLS
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 4. Verificar funciones
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%client%' OR routine_name LIKE '%extract%';

-- 5. Verificar buckets
SELECT name FROM storage.buckets;
```

### ✅ Resultados Esperados:
- client_credentials: existe (0 rows)
- payments: tiene recipient_type y payment_direction
- Políticas: ~16 políticas creadas
- Funciones: 6 funciones creadas
- Buckets: 3 buckets creados

---

## 🎯 PRÓXIMO PASO: FASE 2 - BACKEND

Una vez completada la verificación de base de datos, continuaremos con:

1. Crear `src/lib/clientAuth.ts` - Sistema de autenticación
2. Crear `src/lib/clientPortalApi.ts` - APIs del portal
3. Crear `src/lib/clientReports.ts` - Generación de reportes
4. Crear `src/types/clientPortal.ts` - Tipos TypeScript

---

## 📝 CHECKLIST DE COMPLETITUD

### Base de Datos:
- [ ] Script 1 ejecutado: client_credentials ✓
- [ ] Script 2 ejecutado: extend payments ✓
- [ ] Script 3 ejecutado: RLS policies ✓
- [ ] Script 4 ejecutado: extract functions ✓
- [ ] Script 5 ejecutado: storage config ✓
- [ ] Buckets creados en Storage ✓
- [ ] Verificación SQL ejecutada ✓

### Una vez completado todo lo anterior, marca como completo:
- [ ] **FASE 1: BASE DE DATOS** ✅

---

## ⚠️ PROBLEMAS COMUNES

### Error: "relation already exists"
**Solución:** La tabla ya existe. Continúa con el siguiente script.

### Error: "permission denied"
**Solución:** Verifica que estás usando el rol correcto en Supabase.

### Error en políticas RLS
**Solución:** Si hay error, elimina las políticas antiguas primero:
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

---

## 🆘 SOPORTE

Si encuentras algún error durante la ejecución:

1. Copia el mensaje de error completo
2. Anota en qué script ocurrió (01, 02, 03, 04, o 05)
3. Comparte el error para ayudarte a resolverlo

---

## ✅ CONFIRMACIÓN FINAL

**Antes de continuar con FASE 2, confirma:**
- ✅ Todos los scripts SQL ejecutados sin errores
- ✅ Buckets de storage creados
- ✅ Verificación SQL ejecutada correctamente
- ✅ 0 errores en la consola

**¿Todo correcto? → Proceder a FASE 2: Backend APIs**

---

**Última actualización:** 15 Octubre 2025
