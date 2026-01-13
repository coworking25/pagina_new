# 🚀 GUÍA RÁPIDA: Sistema de Propiedades Ocultas

## ⚡ Instalación en 3 Pasos

### Paso 1: Ejecutar Script SQL
1. Abre [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor**
3. Abre el archivo: `INSTALL_HIDDEN_PROPERTIES.sql`
4. Copia todo el contenido
5. Pégalo en el editor SQL
6. Haz clic en **Run** (Ejecutar)
7. Espera el mensaje: "Migración completada"

### Paso 2: Verificar Instalación
Ejecuta esta consulta en SQL Editor para verificar:
```sql
SELECT 
  'OK' as status,
  COUNT(*) as total_properties,
  COUNT(*) FILTER (WHERE is_hidden = true) as hidden,
  COUNT(*) FILTER (WHERE is_hidden = false) as visible
FROM properties;
```

### Paso 3: ¡Listo! Prueba el Sistema
1. Abre tu panel de administración
2. Ve a **Propiedades**
3. Verás un botón **"👁️ Ver Ocultas"** en los filtros

---

## 🎮 Cómo Usar (Tutorial Visual)

### Para Ocultar una Propiedad

#### Método 1: Desde la Tarjeta (Rápido)
```
┌─────────────────────────┐
│  [Imagen Propiedad]     │
│                         │
│  Casa en Zona Norte     │
│  $ 500,000,000          │
│                         │
│  [⭐][👁️][✏️][🗑️]     │ ← Haz clic en 👁️
└─────────────────────────┘
```

#### Método 2: Desde Detalles (Completo)
```
1. Haz clic en una propiedad para ver detalles
2. En el panel derecho "Acciones Disponibles"
3. Haz clic en "Ocultar de Web"
4. Confirma la acción
```

### Para Ver Propiedades Ocultas
```
1. Ve a Propiedades
2. Haz clic en el botón "👁️ Ver Ocultas"
3. Se mostrará un banner naranja
4. Verás solo las propiedades ocultas
```

### Para Restaurar una Propiedad
```
1. Activa "Ver Ocultas"
2. Encuentra la propiedad que quieres restaurar
3. Haz clic en el ojo 👁️ (ahora verde)
4. ¡Listo! Volverá a aparecer en la web
```

---

## 🎯 Casos de Uso Comunes

### ✅ Cuando una Propiedad se Arrienda
```
ANTES: ❌ Quedaba visible en la web
AHORA: ✅ Ocultar con un clic
       ✅ Mantener en el sistema
       ✅ Restaurar cuando se libere
```

### ✅ Propiedades en Mantenimiento
```
ANTES: ❌ Cambiar estado pero seguía visible
AHORA: ✅ Ocultar mientras se arregla
       ✅ Mostrar cuando esté lista
```

### ✅ Limpiar Catálogo Web
```
ANTES: ❌ Web saturada de propiedades
AHORA: ✅ Ocultar temporalmente las menos populares
       ✅ Web limpia y actualizada
```

---

## 🔍 Identificación Visual

### Propiedad Normal (Visible)
```
┌─────────────────────────┐
│                         │
│  [Imagen]              ⭐│ ← Destacada (opcional)
│                         │
│  Casa Moderna           │
│  $ 500,000,000          │
│  [Acciones]             │
└─────────────────────────┘
```

### Propiedad Oculta
```
┌─────────────────────────┐
│ [👁️ OCULTA]           │ ← Badge naranja
│  [Imagen]               │
│                         │
│  Casa Moderna           │
│  $ 500,000,000          │
│  [Acciones]             │
└─────────────────────────┘
```

---

## ❓ Preguntas Frecuentes

### ¿Las propiedades ocultas se eliminan?
**No.** Las propiedades ocultas siguen en la base de datos. Solo están ocultas de la web pública.

### ¿Los clientes pueden ver propiedades ocultas?
**No.** Solo los administradores y asesores autenticados pueden verlas.

### ¿Puedo ocultar varias propiedades a la vez?
**Actualmente no**, pero puedes hacerlo rápidamente una por una desde las tarjetas.

### ¿Se puede deshacer la acción?
**Sí.** Simplemente vuelve a hacer clic en el botón de ojo para restaurar.

### ¿Afecta el SEO?
**No.** Las propiedades ocultas no aparecen en el sitemap ni son indexadas por Google.

### ¿Cuántas propiedades ocultas puedo tener?
**Ilimitadas.** No hay límite técnico.

---

## 🎨 Personalización

### Cambiar el Comportamiento Automático
Si quieres que las propiedades se oculten automáticamente al venderse/arrendarse:

```sql
-- Descomentar en INSTALL_HIDDEN_PROPERTIES.sql
UPDATE properties
SET is_hidden = true
WHERE status IN ('sold', 'rented')
  AND is_hidden = false;
```

---

## 📊 Consultas Útiles

### Ver Estadísticas
```sql
SELECT 
  CASE WHEN is_hidden THEN 'Ocultas' ELSE 'Visibles' END as tipo,
  COUNT(*) as cantidad
FROM properties
WHERE deleted_at IS NULL
GROUP BY is_hidden;
```

### Listar Propiedades Ocultas
```sql
SELECT code, title, status, updated_at
FROM properties
WHERE is_hidden = true
ORDER BY updated_at DESC;
```

### Ocultar Todas las Vendidas
```sql
UPDATE properties
SET is_hidden = true
WHERE status = 'sold';
```

### Restaurar Todas las Disponibles
```sql
UPDATE properties
SET is_hidden = false
WHERE status = 'available';
```

---

## 🆘 Problemas Comunes

### "No puedo ver el botón Ver Ocultas"
- Recarga la página (F5)
- Verifica que estés en la página de Propiedades
- Limpia caché del navegador

### "La propiedad sigue en la web"
- Verifica que el estado sea `is_hidden = true` en BD
- Espera 1-2 minutos (caché)
- Recarga la página web pública

### "No aparece el badge OCULTA"
- Verifica que el filtro "Ver Ocultas" esté activo
- Verifica que la propiedad tenga `is_hidden = true`

---

## 📱 Atajos de Teclado (Futuro)

En una versión futura podríamos añadir:
- `H` = Ocultar propiedad seleccionada
- `Shift + H` = Ver carpeta de ocultas
- `U` = Deshacer (Unhide)

---

## 🎓 Video Tutorial (Opcional)

**Próximamente**: Video de 2 minutos mostrando:
1. Cómo ocultar una propiedad
2. Cómo ver la carpeta de ocultas
3. Cómo restaurar una propiedad

---

## 📞 Soporte

**¿Necesitas ayuda?**
- 📖 Lee: `SISTEMA_PROPIEDADES_OCULTAS.md` (documentación completa)
- 🔧 Revisa: `RESUMEN_IMPLEMENTACION.md` (detalles técnicos)
- 💻 SQL: `INSTALL_HIDDEN_PROPERTIES.sql` (script instalación)

---

## ✨ Disfruta tu Nuevo Sistema

¡Ahora tienes un control profesional sobre qué propiedades se muestran en tu web!

**Recuerda:**
- 👁️ Ocultar ≠ Eliminar
- 📂 Carpeta de ocultas = Inventario temporal
- ✅ Fácil restauración con un clic
- 🔒 Solo visible para administradores

---

**¡Feliz gestión de propiedades!** 🏠
