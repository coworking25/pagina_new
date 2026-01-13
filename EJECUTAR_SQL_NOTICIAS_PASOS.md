# ⚠️ IMPORTANTE: Ejecutar SQL para que funcionen las Burbujas

## 🔴 Problema Actual
Las burbujas NO aparecen porque **la tabla de noticias no existe en la base de datos**.

## ✅ Solución (3 minutos)

### Paso 1: Abrir Supabase
1. Ve a: https://app.supabase.com
2. Selecciona tu proyecto

### Paso 2: Ir al SQL Editor
1. En el menú lateral izquierdo, busca **"SQL Editor"**
2. Haz clic en **"+ New Query"**

### Paso 3: Copiar el SQL
1. Abre el archivo: `CREATE_REAL_ESTATE_NEWS.sql`
2. Selecciona TODO el contenido (Ctrl+A)
3. Copia (Ctrl+C)

### Paso 4: Pegar y Ejecutar
1. Pega en el editor SQL de Supabase (Ctrl+V)
2. Haz clic en **"Run"** (botón verde en esquina inferior derecha)
3. Espera 5 segundos...
4. Deberías ver: ✅ **"Success. No rows returned"**

### Paso 5: Verificar
Ejecuta esta consulta para verificar:

```sql
SELECT COUNT(*) FROM real_estate_news;
```

**Resultado esperado:** `8` (8 noticias de ejemplo)

### Paso 6: Refrescar la Página
1. Vuelve a tu aplicación: `http://localhost:5173`
2. Refresca la página (F5)
3. **¡Ahora deberías ver las burbujas en el lado derecho!**

---

## 🎯 ¿Qué hace el SQL?

✅ Crea la tabla `real_estate_news`  
✅ Agrega 6 índices para performance  
✅ Configura políticas de seguridad (RLS)  
✅ Crea funciones para tracking (vistas/clics)  
✅ Inserta 8 noticias de ejemplo de Medellín  

---

## 🐛 Si aún no aparecen las burbujas

1. **Abre la consola del navegador** (F12)
2. Busca errores en rojo
3. Ve a la pestaña "Network" y busca llamadas a Supabase
4. Comparte el error exacto conmigo

---

## 📞 Checklist Rápido

- [ ] ✅ SQL ejecutado en Supabase
- [ ] ✅ Verificado: `SELECT COUNT(*) FROM real_estate_news;` = 8
- [ ] ✅ Página refrescada (F5)
- [ ] ✅ Burbujas visibles en lado derecho

**Si completaste estos 4 pasos y aún no funciona, hay otro problema que resolveremos.**
