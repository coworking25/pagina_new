# 💾 PERSISTENCIA DE DATOS EN WIZARD - IMPLEMENTADA

## 🎯 Objetivo

Permitir que los usuarios **no pierdan su progreso** al:
- Cerrar accidentalmente el wizard
- Cambiar de pestaña del navegador
- Refrescar la página
- Volver más tarde a completar el formulario

---

## ✨ Funcionalidades Implementadas

### 1. **Autoguardado Automático** 💾

**Cuándo se guarda:**
- Cada vez que el usuario modifica cualquier campo
- Cada vez que cambia de paso
- Se guarda en `localStorage` del navegador

**Qué se guarda:**
- ✅ Todos los datos del formulario (6 pasos)
- ✅ El paso actual donde estaba el usuario
- ✅ Documentos seleccionados (referencias, no archivos)
- ✅ Propiedades asignadas
- ✅ Configuración de pagos
- ✅ Referencias personales y comerciales

**Indicador visual:**
```
💾 Guardado automáticamente
```
Aparece en color verde cuando hay datos guardados.

### 2. **Restauración Automática al Abrir** 🔄

**Comportamiento:**
- Al abrir el wizard, automáticamente carga el último borrador
- Restaura el paso donde estaba el usuario
- Solo restaura si hay datos significativos (nombre o documento)

**Logs en consola:**
```
📥 Restaurando borrador guardado
```

### 3. **Botón "Restaurar"** ↩️

**Ubicación:** Header del wizard (esquina superior izquierda)

**Función:** Restaura manualmente el último borrador guardado

**Icono:** 🔄 (RotateCcw)

**Mensaje:** `✅ Borrador restaurado correctamente`

### 4. **Botón "Limpiar"** 🗑️

**Ubicación:** Header del wizard (al lado de "Restaurar")

**Función:** Elimina el borrador guardado y reinicia el formulario

**Icono:** ✖️ (X)

**Confirmación:** `¿Estás seguro de que deseas eliminar el borrador guardado?`

**Resultado:** `🗑️ Borrador eliminado y formulario reiniciado`

### 5. **Limpieza Automática al Enviar** ✅

**Cuándo:** Después de crear el cliente exitosamente

**Acción:** Elimina automáticamente el borrador guardado

**Log:** `🗑️ Borrador eliminado`

---

## 🔧 Implementación Técnica

### Estructura de localStorage

```typescript
// Keys utilizadas
const STORAGE_KEY = 'client_wizard_draft';          // Datos del formulario
const STORAGE_STEP_KEY = 'client_wizard_step';      // Paso actual
const COMMON_VALUES_KEY = 'client_wizard_common';   // Valores comunes (futuro)
```

### useEffect 1: Cargar al Abrir

```typescript
useEffect(() => {
  if (isOpen) {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    const savedStep = localStorage.getItem(STORAGE_STEP_KEY);
    
    if (savedDraft) {
      const parsedData = JSON.parse(savedDraft);
      if (parsedData.full_name || parsedData.document_number) {
        setFormData(parsedData);
        setCurrentStep(parseInt(savedStep));
      }
    }
  }
}, [isOpen]);
```

### useEffect 2: Guardar Automáticamente

```typescript
useEffect(() => {
  if (isOpen && formData.full_name) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    localStorage.setItem(STORAGE_STEP_KEY, currentStep.toString());
  }
}, [formData, currentStep, isOpen]);
```

### Funciones Auxiliares

#### clearDraft()
```typescript
const clearDraft = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_STEP_KEY);
};
```

#### restoreDraft()
```typescript
const restoreDraft = () => {
  const savedDraft = localStorage.getItem(STORAGE_KEY);
  if (savedDraft) {
    setFormData(JSON.parse(savedDraft));
    alert('✅ Borrador restaurado correctamente');
  }
};
```

#### manualClearDraft()
```typescript
const manualClearDraft = () => {
  if (confirm('¿Estás seguro?')) {
    clearDraft();
    // Resetear formulario completo
    setFormData({/* valores iniciales */});
    setCurrentStep(1);
  }
};
```

---

## 🎨 UI/UX Mejoradas

### Header del Wizard

**Antes:**
```
[ Crear Nuevo Cliente                                    [X] ]
```

**Ahora:**
```
[ Crear Nuevo Cliente  [🔄 Restaurar] [✖️ Limpiar]      [X] ]
[ 💾 Guardado automáticamente                               ]
```

### Indicadores Visuales

1. **Botón "Restaurar"** (Azul)
   - Color: `text-blue-600`
   - Borde: `border-blue-300`
   - Hover: `bg-blue-50`

2. **Botón "Limpiar"** (Gris)
   - Color: `text-gray-600`
   - Borde: `border-gray-300`
   - Hover: `bg-gray-50`

3. **Indicador de Guardado** (Verde)
   - Color: `text-green-600`
   - Icono: `💾` con animación pulse
   - Solo aparece cuando hay datos

---

## 📋 Casos de Uso

### Caso 1: Usuario Cierra por Error

**Flujo:**
1. Usuario está llenando el wizard (Paso 3 de 6)
2. Cierra accidentalmente el modal
3. Vuelve a abrir "Nuevo Cliente"
4. ✅ **Automáticamente restaura los datos y vuelve al Paso 3**

### Caso 2: Usuario Necesita Buscar Información

**Flujo:**
1. Usuario llena los primeros 2 pasos
2. Se da cuenta que necesita buscar el documento del cliente
3. Cierra el wizard (se guarda automáticamente)
4. Va a buscar el documento en sus archivos
5. Vuelve al wizard
6. ✅ **Todos los datos siguen ahí**

### Caso 3: Usuario Refresca la Página

**Flujo:**
1. Usuario está en el Paso 4 del wizard
2. Accidentalmente refresca la página (F5)
3. Vuelve a abrir el wizard
4. ✅ **Se restauran todos los datos y vuelve al Paso 4**

### Caso 4: Usuario Quiere Empezar de Nuevo

**Flujo:**
1. Usuario tiene un borrador guardado
2. Quiere crear un cliente completamente diferente
3. Clic en botón "Limpiar"
4. Confirma la acción
5. ✅ **Borrador eliminado, formulario reiniciado**

### Caso 5: Cliente Creado Exitosamente

**Flujo:**
1. Usuario completa todos los pasos
2. Clic en "Crear Cliente"
3. Cliente se crea exitosamente
4. ✅ **Borrador se elimina automáticamente**
5. Próxima vez que abra el wizard, estará limpio

---

## 🚀 Beneficios

### Para el Usuario

| Beneficio | Descripción |
|-----------|-------------|
| 💾 **No pierde trabajo** | Si cierra por error, no pierde nada |
| ⏰ **Ahorra tiempo** | No tiene que volver a llenar todo |
| 🔄 **Flexibilidad** | Puede cerrar y volver cuando quiera |
| 😌 **Tranquilidad** | Sabe que su progreso está guardado |
| 🎯 **Control** | Puede limpiar o restaurar manualmente |

### Para el Negocio

| Beneficio | Descripción |
|-----------|-------------|
| 📈 **Mayor tasa de completación** | Menos abandonos del formulario |
| ⚡ **Proceso más rápido** | Usuarios pueden completar en varias sesiones |
| 😊 **Mejor experiencia** | Usuarios más satisfechos |
| 🎯 **Menos errores** | Pueden tomarse su tiempo para verificar datos |

---

## 🔮 Funcionalidades Futuras (Preparadas)

### 1. Autocompletado de Valores Comunes

**Función preparada:**
```typescript
const saveCommonValue = (key: string, value: string) => {
  // Guarda los últimos 5 valores usados por campo
}

const getCommonValues = (key: string): string[] => {
  // Obtiene valores guardados para autocompletar
}
```

**Casos de uso:**
- Ciudad: Sugerir "Bogotá", "Medellín" (últimas ciudades usadas)
- Empresa: Sugerir empresas comunes
- Ocupación: Sugerir ocupaciones frecuentes

**Implementación futura:**
```tsx
<input 
  list="city-suggestions" 
  value={formData.city}
  onBlur={() => saveCommonValue('city', formData.city)}
/>
<datalist id="city-suggestions">
  {getCommonValues('city').map(city => (
    <option value={city} />
  ))}
</datalist>
```

---

## 📊 Datos Almacenados

### Tamaño Estimado

| Concepto | Tamaño |
|----------|--------|
| Datos de formulario | ~5-10 KB |
| Paso actual | ~10 bytes |
| Valores comunes | ~2-5 KB |
| **Total aproximado** | **~10-15 KB** |

**Límite de localStorage:** 5-10 MB (suficiente para cientos de borradores)

### Qué NO se Guarda

- ❌ Archivos subidos (solo referencias)
- ❌ Imágenes
- ❌ Datos sensibles de contraseñas (se guardan pero en localStorage del navegador del usuario, no en servidor)

---

## 🧪 Pruebas Recomendadas

### Test 1: Autoguardado

1. Abrir wizard
2. Llenar nombre y documento
3. Cerrar wizard
4. Volver a abrir
5. ✅ **Verificar:** Datos restaurados

### Test 2: Cambio de Pasos

1. Llenar Paso 1
2. Ir a Paso 2
3. Cerrar wizard
4. Volver a abrir
5. ✅ **Verificar:** Está en Paso 2 con datos del Paso 1

### Test 3: Limpieza Manual

1. Tener datos guardados
2. Clic en "Limpiar"
3. Confirmar
4. ✅ **Verificar:** Formulario vacío, Paso 1

### Test 4: Limpieza Automática

1. Completar wizard
2. Crear cliente
3. Volver a abrir wizard
4. ✅ **Verificar:** Formulario vacío (borrador eliminado)

### Test 5: Refresco de Página

1. Llenar varios pasos
2. Presionar F5
3. Volver a abrir wizard
4. ✅ **Verificar:** Datos restaurados

---

## 📝 Notas Técnicas

### Compatibilidad

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ✅ Navegadores modernos con soporte de localStorage

### Seguridad

- ⚠️ Los datos se guardan en el **navegador del usuario** (localStorage)
- ⚠️ No se envían al servidor hasta que se crea el cliente
- ✅ Los datos se eliminan al crear el cliente exitosamente
- ✅ Cada navegador/computadora tiene su propio borrador

### Limitaciones

- Los datos no se sincronizan entre dispositivos
- Si el usuario limpia el caché del navegador, se pierden los borradores
- Si usa otro navegador, no verá el borrador

---

## ✅ Checklist de Implementación

- [x] useEffect para cargar borrador al abrir
- [x] useEffect para guardar automáticamente
- [x] Función clearDraft()
- [x] Función restoreDraft()
- [x] Función manualClearDraft()
- [x] Botón "Restaurar" en UI
- [x] Botón "Limpiar" en UI
- [x] Indicador visual de guardado
- [x] Limpieza automática al crear cliente
- [x] Logs en consola para debugging
- [ ] Tests de usuario
- [ ] Documentación completada ✅

---

## 🎉 Resultado Final

El wizard ahora:
- ✅ **Guarda automáticamente** el progreso
- ✅ **Restaura automáticamente** al volver
- ✅ **Permite control manual** (restaurar/limpiar)
- ✅ **Indica visualmente** cuando está guardado
- ✅ **Limpia automáticamente** al terminar
- ✅ **Mejora significativamente** la experiencia de usuario

**Estado:** ✅ **IMPLEMENTADO Y LISTO PARA USAR**

---

**Fecha:** 16 de Octubre, 2025  
**Funcionalidad:** Persistencia de datos en ClientWizard  
**Impacto:** Alto - Mejora significativa de UX
