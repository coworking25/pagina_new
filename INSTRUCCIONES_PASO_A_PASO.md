# 📋 INSTRUCCIONES PASO A PASO - CORRECCIÓN DE ESTADOS

## 🎯 Objetivo
Corregir el problema de estados de propiedades en la página web para que muestren correctamente "En Venta", "En Arriendo", o "En Venta y Arriendo".

---

## ✅ PASO 1: VERIFICAR CÓDIGO (YA COMPLETADO)

Los siguientes archivos ya fueron modificados:

- ✅ `src/pages/Properties.tsx` (Líneas 264-284)
- ✅ `src/components/Properties/PropertyFilters.tsx` (Líneas 140-154)
- ✅ `src/components/Properties/PropertyCard.tsx` (Líneas 164-196, 263)
- ✅ `src/lib/supabase.ts` (Líneas 1681-1699)

**No necesitas hacer nada en este paso, el código ya está corregido.**

---

## ⚠️ PASO 2: EJECUTAR SCRIPT SQL (CRÍTICO)

### **¿Por qué es necesario?**
Algunas propiedades en la base de datos pueden tener inconsistencias:
- `availability_type='both'` pero `status='available'` (debería ser `status='both'`)
- Propiedades que dicen "ARRIENDO" en el título pero están marcadas como `sale`
- Precios faltantes según el tipo de disponibilidad

### **Cómo ejecutar:**

1. **Abrir Supabase Dashboard:**
   - Ir a: https://supabase.com/dashboard
   - Seleccionar tu proyecto

2. **Ir al SQL Editor:**
   - En el menú lateral, click en "SQL Editor"
   - Click en "New query"

3. **Copiar el script:**
   - Abrir: `sql/VALIDAR_Y_CORREGIR_ESTADOS_PROPIEDADES.sql`
   - Copiar todo el contenido

4. **Pegar y ejecutar:**
   - Pegar el script en el editor SQL
   - Click en "Run" (o presionar Ctrl+Enter)

5. **Revisar resultados:**
   - El script mostrará varias tablas con estadísticas
   - Buscar mensajes que digan "⚠️" o "✅"
   - Tomar nota de cualquier propiedad que requiera revisión manual

### **Qué hace el script:**

✅ **Paso 1:** Muestra todas las combinaciones actuales de `availability_type` y `status`

✅ **Paso 2:** Detecta propiedades con datos inconsistentes

✅ **Paso 3:** Corrige automáticamente:
- Propiedades con `availability_type='both'` → Cambia `status` a `'both'`
- Propiedades con "ARRIENDO" en título pero tipo `sale` → Cambia a `rent`
- Propiedades con "VENTA" en título pero tipo `rent` → Cambia a `sale`

✅ **Paso 4:** Lista propiedades que necesitan atención manual (precios faltantes)

✅ **Paso 5:** Muestra estadísticas finales

✅ **Paso 6:** Lista propiedades para revisar manualmente

### **Resultado esperado:**

Deberías ver algo como:
```
📊 RESUMEN POST-CORRECCIÓN
availability_type | status    | cantidad
both             | both      | 15
sale             | available | 45
sale             | sold      | 12
rent             | available | 38
rent             | rented    | 8
...

✅ 85 propiedades disponibles en la web
🔒 20 propiedades no disponibles (vendidas/arrendadas)
```

---

## 🧪 PASO 3: PROBAR EN NAVEGADOR

### **3.1 - Iniciar el servidor de desarrollo:**

```bash
# En la terminal, asegúrate de estar en la carpeta del proyecto
cd "C:\Users\Usuario\OneDrive\Escritorio\COWORKING\PAGINA WEB FINAL"

# Instalar dependencias si no lo has hecho
npm install

# Iniciar servidor
npm run dev
```

### **3.2 - Ir a la página de propiedades:**

1. Abrir navegador
2. Ir a: `http://localhost:5173/properties`
3. Esperar a que carguen las propiedades

### **3.3 - Verificar badges de estado:**

Revisar que las propiedades muestren correctamente:

| Tipo de Propiedad | Badge Esperado |
|-------------------|----------------|
| Solo Venta | "En Venta" 💰 |
| Solo Arriendo | "En Arriendo" 🏠 |
| Venta y Arriendo | "En Venta y Arriendo" 🔄 |
| Vendida | "Vendido" ✅ |
| Arrendada | "Arrendado" 🔒 |

**✅ Correcto:** Badge muestra tipo de transacción específico
**❌ Incorrecto:** Badge muestra solo "Disponible" para todo

### **3.4 - Probar filtros:**

#### **Filtro "Arriendo":**
1. Click en "Filtros Avanzados"
2. En "Tipo de Transacción", seleccionar "Arriendo"
3. **Debe mostrar:**
   - Propiedades con `availability_type='rent'`
   - Propiedades con `availability_type='both'`
4. **NO debe mostrar:**
   - Propiedades solo de venta (`availability_type='sale'`)

#### **Filtro "Venta":**
1. En "Tipo de Transacción", seleccionar "Venta"
2. **Debe mostrar:**
   - Propiedades con `availability_type='sale'`
   - Propiedades con `availability_type='both'`
3. **NO debe mostrar:**
   - Propiedades solo de arriendo (`availability_type='rent'`)

#### **Filtro "Venta y Arriendo":**
1. En "Tipo de Transacción", seleccionar "Venta y Arriendo"
2. **Debe mostrar:**
   - SOLO propiedades con `availability_type='both'`
3. **NO debe mostrar:**
   - Propiedades solo de venta o solo de arriendo

### **3.5 - Verificar que propiedades vendidas/arrendadas NO aparezcan:**

1. Ir al dashboard de admin
2. Cambiar una propiedad a estado "Vendido"
3. Volver a `/properties`
4. **Verificar:** La propiedad vendida NO debe aparecer en la lista

---

## 🔍 PASO 4: VALIDAR DASHBOARD

### **4.1 - Ir al dashboard de admin:**
```
http://localhost:5173/admin/properties
```

### **4.2 - Verificar estadísticas:**

Las tarjetas superiores deben mostrar:
- **En Venta:** Cantidad correcta de propiedades `availability_type='sale'` o `'both'`
- **En Arriendo:** Cantidad correcta de propiedades `availability_type='rent'` o `'both'`
- **Destacadas:** Cantidad de propiedades con `featured=true`

### **4.3 - Verificar filtros del dashboard:**

1. Click en "En Venta" → Debe filtrar correctamente
2. Click en "En Arriendo" → Debe filtrar correctamente
3. Click en "Destacadas" → Debe mostrar solo destacadas

**✅ El dashboard NO debe tener cambios, debe seguir funcionando igual que antes.**

---

## 📊 PASO 5: REVISAR CONSOLA DEL NAVEGADOR

1. Abrir DevTools (F12)
2. Ir a la pestaña "Console"
3. Buscar mensajes de error (rojo)
4. **Debe haber:**
   - ✅ Mensajes de carga de propiedades
   - ✅ Logs de filtros aplicados
5. **NO debe haber:**
   - ❌ Errores de TypeScript
   - ❌ Warnings sobre campos faltantes

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **Problema 1: Badges siguen mostrando "Disponible"**

**Causa posible:** No se ejecutó el script SQL o los datos siguen inconsistentes.

**Solución:**
1. Volver a PASO 2 y ejecutar script SQL
2. Verificar en Supabase que `availability_type` esté correcto
3. Limpiar caché del navegador (Ctrl+Shift+R)

---

### **Problema 2: Filtros no funcionan**

**Causa posible:** Código no se actualizó correctamente.

**Solución:**
1. Reiniciar servidor de desarrollo:
   ```bash
   # Ctrl+C para detener
   npm run dev
   ```
2. Limpiar caché del navegador
3. Verificar que los archivos se hayan guardado correctamente

---

### **Problema 3: Error en consola sobre `availability_type`**

**Causa posible:** Propiedad no tiene `availability_type` en la BD.

**Solución:**
Ejecutar este SQL en Supabase:
```sql
-- Asignar availability_type por defecto a propiedades sin este campo
UPDATE properties
SET availability_type = 'sale'
WHERE availability_type IS NULL
  AND deleted_at IS NULL;
```

---

### **Problema 4: Dashboard muestra estadísticas incorrectas**

**Causa posible:** Los datos cambiaron después de ejecutar el script SQL.

**Solución:**
1. Refrescar página (F5)
2. Revisar que el script SQL haya corrido correctamente
3. Verificar datos manualmente en Supabase:
   ```sql
   SELECT 
     availability_type,
     status,
     COUNT(*) as total
   FROM properties
   WHERE deleted_at IS NULL
   GROUP BY availability_type, status;
   ```

---

## ✅ CHECKLIST DE VALIDACIÓN

**Antes de considerar completado:**

### **Base de Datos:**
- [ ] Script SQL ejecutado sin errores
- [ ] No hay propiedades con inconsistencias críticas
- [ ] Todas las propiedades `both` tienen ambos precios (o están documentadas para revisar)

### **Página Web (/properties):**
- [ ] Badges muestran "En Venta", "En Arriendo", o "En Venta y Arriendo"
- [ ] Filtro "Arriendo" funciona correctamente
- [ ] Filtro "Venta" funciona correctamente
- [ ] Filtro "Venta y Arriendo" funciona correctamente
- [ ] Propiedades vendidas/arrendadas NO aparecen

### **Dashboard Admin:**
- [ ] Estadísticas siguen siendo correctas
- [ ] Filtros rápidos funcionan
- [ ] No hay errores en consola

### **General:**
- [ ] No hay errores en consola del navegador
- [ ] No hay warnings de TypeScript
- [ ] Performance es aceptable

---

## 🎉 ¡LISTO!

Si todos los puntos del checklist están marcados, **las correcciones están completadas exitosamente**.

---

## 📞 CONTACTO / SOPORTE

Si encuentras algún problema:

1. **Revisar documentación:**
   - `ANALISIS_ESTADOS_PROPIEDADES.md` - Análisis completo
   - `CORRECCIONES_ESTADOS_PROPIEDADES_RESUMEN.md` - Detalles técnicos
   - `ERRORES_ADICIONALES_Y_RECOMENDACIONES.md` - Mejoras futuras

2. **Verificar consola del navegador:**
   - Buscar mensajes de error específicos
   - Copiar el stack trace completo

3. **Revisar datos en Supabase:**
   - SQL Editor → Ejecutar queries de diagnóstico del script

---

## 🔄 PRÓXIMOS PASOS (OPCIONAL)

Después de validar que todo funciona:

### **Mejoras Recomendadas:**
1. **Agregar validación de precios en formularios**
   - Ver: `ERRORES_ADICIONALES_Y_RECOMENDACIONES.md` sección 1

2. **Crear constantes para estados**
   - Ver: `ERRORES_ADICIONALES_Y_RECOMENDACIONES.md` sección 3

3. **Deprecar campo `price`**
   - Ver: `ERRORES_ADICIONALES_Y_RECOMENDACIONES.md` sección 2

---

**¡Buena suerte! 🚀**

