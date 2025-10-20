# 🗑️ Cómo Eliminar un Cliente

## ⚠️ IMPORTANTE: Cambios Recientes
Acabamos de agregar la funcionalidad de eliminar desde el modal de detalles.

## 🔄 Pasos para Asegurarte que Funcione

### 1️⃣ Recargar Completamente el Navegador
```
Presiona: Ctrl + Shift + R (Windows)
O: Ctrl + F5
```
Esto **limpia el caché** y recarga todo el código nuevo.

### 2️⃣ Verificar que Vite esté Corriendo
En la terminal debes ver:
```
✓ ready in XXX ms
```

Si no está corriendo, ejecuta:
```powershell
npm run dev
```

### 3️⃣ Abrir DevTools para Ver Errores
```
Presiona: F12
Ve a la pestaña: Console
```
Si hay errores, aparecerán aquí.

---

## 📋 Proceso de Eliminación

### ✅ Método 1: Desde el Modal de Detalles (NUEVO)

1. **Abre la lista de clientes** en `localhost:5173/admin/clients`

2. **Haz clic en el ícono de OJO** 👁️ del cliente que quieres eliminar
   - Esto abre el modal "Detalles del Cliente"

3. **En el header del modal verás:**
   ```
   [Editar Cliente] [Eliminar Cliente] [X]
                    ^^^^^^^^^^^^^^^^
                    (botón ROJO)
   ```

4. **Haz clic en "Eliminar Cliente"**

5. **Aparecerá una confirmación:**
   ```
   ¿Estás seguro de que quieres eliminar al cliente [NOMBRE]?

   ⚠️ Esta acción eliminará PERMANENTEMENTE:
   - Todos los documentos
   - Todas las credenciales del portal
   - Todos los pagos y contratos
   - Todas las propiedades asignadas
   - Todas las comunicaciones

   Esta acción NO se puede deshacer.
   ```

6. **Si confirmas:**
   - ✅ Cliente se elimina de la base de datos
   - ✅ Modal se cierra automáticamente
   - ✅ Lista se actualiza (cliente desaparece)
   - ✅ Mensaje de éxito

---

## 🐛 Troubleshooting

### Problema: "No veo el botón Eliminar Cliente"

**Solución 1:** Recarga con Ctrl + Shift + R

**Solución 2:** Verifica que Vite esté corriendo
```powershell
# Si no está corriendo:
npm run dev
```

**Solución 3:** Verifica en el código que se guardó
```powershell
# Buscar onDelete en el archivo:
Get-Content "src\components\ClientDetailsEnhanced.tsx" | Select-String "onDelete"
```

Deberías ver 4 líneas con "onDelete"

---

### Problema: "El cliente se elimina pero sigue apareciendo"

Esto significa que:
- ✅ La base de datos SÍ eliminó el cliente
- ❌ El frontend NO actualizó la lista

**Solución:** Recarga la página completa (F5)

---

### Problema: "Me da error al eliminar"

**Revisa en la consola (F12):**

1. Si dice `403 Forbidden`:
   - Problema: RLS policies
   - Solución: Ya ejecutaste el SQL correcto, pero verifica en Supabase

2. Si dice `foreign key constraint`:
   - Problema: Falta CASCADE
   - Solución: Ya ejecutaste FIX_DELETE_CASCADE_CLIENTS.sql
   - Verifica: Abre Supabase SQL Editor y ejecuta:
     ```sql
     SELECT constraint_name, delete_rule 
     FROM information_schema.referential_constraints 
     WHERE constraint_name LIKE '%client%';
     ```
   - Todas deben tener `delete_rule = 'CASCADE'`

3. Si dice `Cannot read properties of null`:
   - Problema: El cliente ya fue eliminado pero el modal no se cerró
   - Solución: Cierra el modal manualmente y recarga (F5)

---

## 🔍 Verificar que Todo Funciona

### Test Completo:

```
1. ✅ Abrir lista de clientes
2. ✅ Click en ojo de "Juan Bayer"
3. ✅ Se abre modal con 9 tabs
4. ✅ Ver botón rojo "Eliminar Cliente" en header
5. ✅ Click en "Eliminar Cliente"
6. ✅ Aparece confirmación detallada
7. ✅ Click en "Aceptar"
8. ✅ Modal se cierra automáticamente
9. ✅ Cliente desaparece de la lista
10. ✅ Mensaje: "✅ Cliente eliminado correctamente"
```

---

## 💾 Cambios en el Código

### Archivos Modificados:

1. **`src/components/ClientDetailsEnhanced.tsx`**
   - ✅ Agregado prop `onDelete?: (clientId: string) => void`
   - ✅ Agregada función `handleDelete()`
   - ✅ Agregado botón "Eliminar Cliente" (rojo)

2. **`src/pages/AdminClients.tsx`**
   - ✅ Agregado callback `onDelete` en `<ClientDetailsEnhanced>`
   - ✅ Actualiza estado `clients` después de eliminar
   - ✅ Cierra modal automáticamente
   - ✅ Limpia `selectedClient`

3. **Base de Datos (Supabase)**
   - ✅ Ejecutado `FIX_DELETE_CASCADE_CLIENTS.sql`
   - ✅ 10 foreign keys con `ON DELETE CASCADE`
   - ✅ Permite eliminación sin errores

---

## 📊 Estado Actual

| Feature | Estado |
|---------|--------|
| Wizard de Creación | ✅ Funciona |
| Modal Ver Detalles (9 tabs) | ✅ Funciona |
| Modal de Edición | ✅ Funciona |
| Eliminar desde Modal | ✅ **NUEVO** |
| Subir comprobantes de pago | ✅ Funciona |
| Ver propiedades asignadas | ✅ Funciona |
| RLS Policies | ✅ Corregidas |
| Foreign Keys CASCADE | ✅ Corregidas |

---

## 🎯 Próximos Pasos

1. **Recarga el navegador** (Ctrl + Shift + R)
2. **Abre el modal de detalles** del cliente
3. **Busca el botón rojo** "Eliminar Cliente"
4. **Prueba la eliminación**

Si después de recargar el navegador aún no ves el botón, avísame y revisaremos juntos.
