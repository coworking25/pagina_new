# 👁️ SISTEMA DE PROPIEDADES OCULTAS

## 📋 Resumen

Se ha implementado un sistema completo de propiedades ocultas que permite gestionar propiedades que no deben aparecer en la página web pública pero que no deben eliminarse de la base de datos. Es ideal para propiedades arrendadas o vendidas temporalmente.

---

## 🎯 Características Implementadas

### 1. **Campo en Base de Datos**
- ✅ Nueva columna `is_hidden` (boolean) en la tabla `properties`
- ✅ Índices optimizados para consultas rápidas
- ✅ Políticas RLS actualizadas para seguridad
- ✅ Trigger de auditoría automática

### 2. **Funcionalidad Frontend**
- ✅ Botón toggle para ocultar/mostrar propiedades
- ✅ Vista especial "Carpeta de Ocultas"
- ✅ Badge visual en tarjetas de propiedades ocultas
- ✅ Filtros automáticos en consultas públicas
- ✅ Botones de acción rápida en tarjetas

### 3. **API y Consultas**
- ✅ Función `togglePropertyVisibility()` para cambiar estado
- ✅ Función `getHiddenProperties()` para obtener solo ocultas
- ✅ Actualización de `getProperties()` para excluir ocultas
- ✅ Actualización de `getFeaturedProperties()` para excluir ocultas

---

## 📁 Archivos Modificados

### SQL
- **`ADD_IS_HIDDEN_COLUMN.sql`** - Migración completa de base de datos

### TypeScript
- **`src/types/index.ts`** - Añadido campo `is_hidden` al tipo Property
- **`src/lib/supabase.ts`** - Funciones nuevas y actualizadas:
  - `togglePropertyVisibility()`
  - `getHiddenProperties()`
  - Actualización de `getProperties()` con filtro de ocultas
  - Actualización de `getFeaturedProperties()` con filtro de ocultas

### React Components
- **`src/pages/AdminProperties.tsx`** - Implementación completa del UI:
  - Estado `showHidden` para controlar vista
  - Botón toggle en filtros
  - Banner informativo cuando se ven ocultas
  - Badge visual en tarjetas
  - Botón de acción rápida en cada tarjeta
  - Botón en modal de detalles
  - Mensajes personalizados cuando no hay resultados

---

## 🚀 Cómo Usar

### Para Administradores

#### **Ocultar una Propiedad**

**Opción 1: Desde la tarjeta de propiedad**
1. Busca la propiedad en el listado
2. Haz clic en el icono de ojo (👁️) en las acciones de la tarjeta
3. Confirma la acción

**Opción 2: Desde el modal de detalles**
1. Abre los detalles de la propiedad
2. En el panel de acciones, haz clic en "Ocultar de Web"
3. Confirma la acción

#### **Ver Propiedades Ocultas**
1. En la página de Administración de Propiedades
2. Haz clic en el botón "👁️ Ver Ocultas" en los filtros
3. Se mostrará un banner naranja indicando que estás en la carpeta de ocultas
4. Verás solo las propiedades ocultas

#### **Restaurar una Propiedad Oculta**
1. Activa la vista de propiedades ocultas
2. Busca la propiedad que quieres restaurar
3. Haz clic en el icono de ojo (👁️) verde
4. La propiedad volverá a ser visible en la web pública

---

## 🎨 Elementos Visuales

### Badge de Propiedad Oculta
```
┌─────────────────┐
│  👁️ OCULTA     │  ← Badge naranja en esquina superior izquierda
└─────────────────┘
```

### Banner Informativo
```
📂 Carpeta de Propiedades Ocultas
Estás viendo propiedades ocultas que no aparecen en la página web pública.
```

### Botón de Estado
- **Oculta**: Botón verde con ojo normal "Mostrar en Web"
- **Visible**: Botón naranja con ojo tachado "Ocultar de Web"

---

## 🔒 Seguridad y Permisos

### Políticas RLS
- ✅ Usuarios **no autenticados** (web pública): Solo ven propiedades con `is_hidden = false`
- ✅ Usuarios **autenticados** (admin/asesores): Ven todas las propiedades
- ✅ La columna `is_hidden` es consultable por todos pero solo modificable por autenticados

### Auditoría
- ✅ Cada cambio de visibilidad se registra automáticamente en `audit_logs` (si existe)
- ✅ Se guarda: fecha, usuario, acción, y estado anterior/nuevo

---

## 📊 Consultas SQL Útiles

### Ver estadísticas de propiedades ocultas
```sql
SELECT 
  is_hidden,
  status,
  COUNT(*) as total
FROM properties
WHERE deleted_at IS NULL
GROUP BY is_hidden, status
ORDER BY is_hidden, status;
```

### Listar propiedades ocultas
```sql
SELECT 
  code,
  title,
  status,
  is_hidden,
  updated_at
FROM properties
WHERE is_hidden = true
  AND deleted_at IS NULL
ORDER BY updated_at DESC;
```

### Ocultar todas las propiedades vendidas/arrendadas
```sql
UPDATE properties
SET is_hidden = true
WHERE status IN ('sold', 'rented')
  AND is_hidden = false;
```

### Restaurar una propiedad específica
```sql
UPDATE properties
SET is_hidden = false
WHERE code = 'CA-XXX';
```

---

## 🎯 Casos de Uso

### ✅ Caso 1: Propiedad Arrendada Temporalmente
**Situación**: Una propiedad se arrienda pero el contrato es de corto plazo
**Solución**: Ocultar la propiedad en lugar de eliminarla
**Beneficio**: Mantener historial y poder restaurarla fácilmente

### ✅ Caso 2: Propiedad en Mantenimiento
**Situación**: Una propiedad necesita reparaciones antes de poder mostrarse
**Solución**: Ocultarla temporalmente
**Beneficio**: No mostrarla a clientes hasta que esté lista

### ✅ Caso 3: Propiedad Vendida con Posible Reversión
**Situación**: Una venta que podría no concretarse
**Solución**: Ocultar en lugar de eliminar
**Beneficio**: Fácil restauración si la venta se cae

### ✅ Caso 4: Limpieza de Listado Público
**Situación**: Demasiadas propiedades en la web, algunas con poca actividad
**Solución**: Ocultar temporalmente las menos populares
**Beneficio**: Página web más limpia sin perder datos

---

## 🔧 Mantenimiento

### Recomendaciones
1. **Revisar periódicamente** la carpeta de ocultas (mensualmente)
2. **Decidir** qué propiedades se pueden eliminar permanentemente
3. **Restaurar** las que vuelven a estar disponibles
4. **Documentar** el motivo de ocultar propiedades importantes

### Automatización Futura (Opcional)
- Ocultar automáticamente propiedades cuando cambian a estado `sold` o `rented`
- Enviar recordatorio mensual de propiedades ocultas hace más de 6 meses
- Dashboard con métricas de propiedades ocultas vs visibles

---

## 📝 Notas Técnicas

### Performance
- Índices optimizados para consultas de propiedades visibles
- Filtro aplicado a nivel de base de datos, no en frontend
- Consultas públicas excluyen automáticamente propiedades ocultas

### Compatibilidad
- 100% compatible con sistema existente
- No afecta propiedades creadas anteriormente (default `is_hidden = false`)
- Funciona con sistema de soft-delete existente (`deleted_at`)

### Diferencias con Soft Delete
- **Soft Delete** (`deleted_at`): Eliminación lógica, no recuperable desde UI
- **Hidden** (`is_hidden`): Ocultar temporalmente, fácilmente recuperable

---

## ✅ Checklist de Implementación

- [x] Crear migración SQL con columna `is_hidden`
- [x] Añadir índices optimizados
- [x] Actualizar políticas RLS
- [x] Crear trigger de auditoría
- [x] Añadir campo al tipo TypeScript `Property`
- [x] Crear función `togglePropertyVisibility()`
- [x] Crear función `getHiddenProperties()`
- [x] Actualizar `getProperties()` con filtro
- [x] Actualizar `getFeaturedProperties()` con filtro
- [x] Añadir estado `showHidden` en AdminProperties
- [x] Implementar botón toggle en filtros
- [x] Añadir badge visual en tarjetas
- [x] Implementar botón en modal de detalles
- [x] Añadir botón de acción rápida en tarjetas
- [x] Crear banner informativo para carpeta de ocultas
- [x] Personalizar mensaje cuando no hay resultados
- [x] Actualizar lógica de filtrado
- [x] Documentar sistema completo

---

## 🎓 Para Desarrolladores

### Extender Funcionalidad

**Añadir filtro de ocultas en otras vistas:**
```typescript
// En cualquier componente que liste propiedades
const visibleProperties = properties.filter(p => !p.is_hidden);
```

**Verificar si una propiedad está oculta:**
```typescript
if (property.is_hidden) {
  // Mostrar indicador o cambiar comportamiento
}
```

**Ocultar múltiples propiedades:**
```typescript
const propertyIds = [1, 2, 3];
for (const id of propertyIds) {
  await togglePropertyVisibility(id, true);
}
```

---

## 📞 Soporte

Si necesitas ayuda o tienes preguntas sobre el sistema de propiedades ocultas:
- Revisa este documento
- Consulta los comentarios en el código
- Revisa los logs de consola (prefijo 👁️)

---

**Última actualización**: Enero 2026
**Versión**: 1.0.0
