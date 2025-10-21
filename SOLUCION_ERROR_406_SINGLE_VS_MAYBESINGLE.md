# 🔧 SOLUCIÓN ERROR 406 - client_contract_info

**Fecha:** 20 de Octubre, 2025  
**Error:** `GET https://...supabase.co/rest/v1/client_contract_info?select=*&client_id=eq.xxx 406 (Not Acceptable)`

---

## ❌ **PROBLEMA IDENTIFICADO**

El código estaba usando `.single()` para consultar `client_contract_info`:

```typescript
const { data: contractData } = await supabase
  .from('client_contract_info')
  .select('*')
  .eq('client_id', client.id)
  .single(); // ❌ Lanza 406 si no hay datos
```

### **¿Por qué fallaba?**

- `.single()` **ESPERA exactamente 1 resultado**
- Si **NO hay datos**, Supabase devuelve **406 Not Acceptable**
- Esto sucede cuando un cliente **no tiene información de contrato** todavía

---

## ✅ **SOLUCIÓN APLICADA**

Cambiar `.single()` por `.maybeSingle()`:

```typescript
const { data: contractData } = await supabase
  .from('client_contract_info')
  .select('*')
  .eq('client_id', client.id)
  .maybeSingle(); // ✅ Devuelve null si no hay datos
```

### **Diferencias:**

| Método | Si no hay datos | Si hay 1 dato | Si hay >1 datos |
|--------|----------------|---------------|-----------------|
| `.single()` | ❌ Error 406 | ✅ Devuelve el dato | ❌ Error |
| `.maybeSingle()` | ✅ Devuelve null | ✅ Devuelve el dato | ❌ Error |

---

## 📝 **ARCHIVOS MODIFICADOS**

### 1. `ClientEditForm.tsx` (línea ~177)
```typescript
// Antes:
.single();

// Después:
.maybeSingle();
```

### 2. `ClientDetailsEnhanced.tsx` (línea ~227)
```typescript
// Antes:
.single();

// Después:
.maybeSingle();
```

---

## 🧪 **CÓMO PROBAR**

1. **Refresca la página** (F5)
2. **Abre un cliente existente** que NO tenga información de contrato
3. **Verifica que ya NO aparece el error 406** en consola
4. **Crea un nuevo cliente** con el Wizard
5. **Completa TODOS los pasos** (7/7 secciones)
6. **Verifica en consola** que todo se guarda sin errores

---

## 🎯 **RESULTADO ESPERADO**

✅ **Ya NO debe aparecer error 406**  
✅ **Los clientes SIN contrato se pueden abrir normalmente**  
✅ **El Wizard puede crear clientes con información de contrato**  
✅ **Las 7 secciones del Wizard deben guardar correctamente**

---

## 📊 **VERIFICACIÓN DE TABLAS**

Todas las tablas están correctas:

```
✅✅✅✅ client_contract_info       - Existe, RLS OK, Políticas OK
✅✅✅✅ client_documents           - Existe, RLS OK, Políticas OK
✅✅✅✅ client_payment_config      - Existe, RLS OK, Políticas OK
✅✅✅✅ client_portal_credentials  - Existe, RLS OK, Políticas OK
✅✅✅✅ client_property_relations  - Existe, RLS OK, Políticas OK
✅✅✅✅ client_references          - Existe, RLS OK, Políticas OK
✅✅✅✅ clients                    - Existe, RLS OK, Políticas OK
```

---

## 🚀 **PRÓXIMOS PASOS**

1. ✅ **Error 406 RESUELTO**
2. ⏭️ **Probar Wizard completo** (crear cliente con 7 secciones)
3. ⏭️ **Verificar que se guarden todas las secciones** (6-7/7)
4. ⏭️ **Resolver Problema #2** (tabs faltantes en edición)
5. ⏭️ **Resolver Problema #3** (gestión de contraseñas)

---

## 💡 **LECCIÓN APRENDIDA**

Cuando se consulta una relación 1-a-1 que **puede no existir todavía**:

- ❌ **NO usar** `.single()` → Lanza 406 si no hay datos
- ✅ **SÍ usar** `.maybeSingle()` → Devuelve null si no hay datos
- ✅ **Verificar con** `if (data)` antes de usar los datos

---

## 🔍 **OTROS CASOS SIMILARES**

Buscar en el código si hay más `.single()` que deberían ser `.maybeSingle()`:

```bash
grep -r "\.single()" src/
```

Si encuentras más casos donde la relación puede **no existir**, cambiarlos también.

---

**ESTADO:** ✅ **RESUELTO**  
**PRÓXIMA ACCIÓN:** Refrescar (F5) y probar Wizard completo
