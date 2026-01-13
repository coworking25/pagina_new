# 📰 Sistema de Noticias Inmobiliarias - Documentación Completa

## 📋 Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Base de Datos](#base-de-datos)
4. [API Functions](#api-functions)
5. [Componentes Frontend](#componentes-frontend)
6. [Panel de Administración](#panel-de-administración)
7. [Guía de Uso](#guía-de-uso)
8. [Casos de Uso](#casos-de-uso)

---

## 📝 Descripción General

Sistema de noticias inmobiliarias con burbujas flotantes animadas que muestra noticias actualizadas sobre el mercado inmobiliario de Medellín. Las noticias se organizan por categorías, importancia y tienen tracking de vistas y clics.

### ✨ Características Principales
- ✅ Burbujas flotantes animadas con Framer Motion
- ✅ 6 categorías de noticias (Mercado, Construcción, Economía, Urbanismo, Legal, Tendencias)
- ✅ Sistema de importancia (1-5) que afecta el tamaño de burbujas
- ✅ Tracking de vistas y clics
- ✅ Panel de administración completo (CRUD)
- ✅ Filtros por categoría, estado y búsqueda
- ✅ Expiración automática de noticias
- ✅ Colores siguiendo el branding (verde principal)
- ✅ RLS (Row Level Security) en Supabase

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐       ┌────────────────────┐     │
│  │ FloatingNews     │       │   AdminNews.tsx     │     │
│  │ Bubbles.tsx      │       │  (Panel Admin)      │     │
│  │ (Página Home)    │       │                     │     │
│  └──────────────────┘       └────────────────────┘     │
│           │                           │                  │
│           └───────────┬───────────────┘                  │
│                       │                                  │
├───────────────────────┼──────────────────────────────────┤
│                  API LAYER                               │
├───────────────────────┼──────────────────────────────────┤
│  src/lib/supabase.ts  │                                  │
│  ┌────────────────────▼────────────────────────┐        │
│  │ - getActiveRealEstateNews()                 │        │
│  │ - getAllRealEstateNews()                    │        │
│  │ - createRealEstateNews()                    │        │
│  │ - updateRealEstateNews()                    │        │
│  │ - deleteRealEstateNews()                    │        │
│  │ - incrementNewsViews()                      │        │
│  │ - incrementNewsClicks()                     │        │
│  │ - toggleNewsStatus()                        │        │
│  └─────────────────────────────────────────────┘        │
│                       │                                  │
├───────────────────────┼──────────────────────────────────┤
│                  SUPABASE                                │
├───────────────────────┼──────────────────────────────────┤
│  ┌────────────────────▼────────────────────────┐        │
│  │  Tabla: real_estate_news                    │        │
│  │  ┌──────────────────────────────────┐       │        │
│  │  │ • id (PK)                        │       │        │
│  │  │ • title, summary, content        │       │        │
│  │  │ • category, importance           │       │        │
│  │  │ • location, source               │       │        │
│  │  │ • views, clicks                  │       │        │
│  │  │ • is_active, expires_at          │       │        │
│  │  └──────────────────────────────────┘       │        │
│  │                                              │        │
│  │  Funciones RPC:                              │        │
│  │  • increment_news_views(news_id)            │        │
│  │  • increment_news_clicks(news_id)           │        │
│  │  • deactivate_expired_news()                │        │
│  │                                              │        │
│  │  View: active_real_estate_news              │        │
│  └─────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Base de Datos

### Tabla: `real_estate_news`

```sql
CREATE TABLE real_estate_news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('market', 'construction', 'economy', 'urbanism', 'legal', 'trends')),
  importance INTEGER NOT NULL DEFAULT 3 CHECK (importance BETWEEN 1 AND 5),
  location VARCHAR(200) DEFAULT 'Medellín',
  source VARCHAR(200) NOT NULL,
  source_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
```

### Categorías Disponibles

| Categoría      | Descripción                     | Color          | Icono         |
|----------------|---------------------------------|----------------|---------------|
| `market`       | Noticias del mercado inmobiliario | Verde          | TrendingUp    |
| `construction` | Proyectos de construcción        | Naranja        | Building2     |
| `economy`      | Economía y finanzas             | Azul           | DollarSign    |
| `urbanism`     | Urbanismo y desarrollo urbano   | Púrpura        | MapPin        |
| `legal`        | Aspectos legales                | Rojo           | Scale         |
| `trends`       | Tendencias del sector           | Rosa           | Sparkles      |

### Nivel de Importancia (1-5)

La importancia afecta:
- Tamaño de la burbuja flotante
- Orden de visualización (más importante = primero)

| Nivel | Tamaño Burbuja | Descripción   |
|-------|----------------|---------------|
| 1     | 64px (w-16)    | Muy Baja      |
| 2     | 80px (w-20)    | Baja          |
| 3     | 96px (w-24)    | Media         |
| 4     | 112px (w-28)   | Alta          |
| 5     | 128px (w-32)   | Muy Alta      |

### Índices para Performance

```sql
CREATE INDEX idx_news_active_published ON real_estate_news(is_active, published_at DESC);
CREATE INDEX idx_news_category ON real_estate_news(category);
CREATE INDEX idx_news_importance ON real_estate_news(importance DESC);
CREATE INDEX idx_news_expires ON real_estate_news(expires_at);
CREATE INDEX idx_news_location ON real_estate_news(location);
CREATE INDEX idx_news_created_by ON real_estate_news(created_by);
```

### RLS (Row Level Security)

```sql
-- Lectura pública de noticias activas
CREATE POLICY "Noticias activas son visibles públicamente" 
ON real_estate_news FOR SELECT 
USING (is_active = true);

-- Admins pueden ver todas las noticias
CREATE POLICY "Admins pueden ver todas las noticias" 
ON real_estate_news FOR SELECT 
USING (auth.role() = 'authenticated');

-- Admins pueden crear noticias
CREATE POLICY "Admins pueden crear noticias" 
ON real_estate_news FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Admins pueden actualizar noticias
CREATE POLICY "Admins pueden actualizar noticias" 
ON real_estate_news FOR UPDATE 
USING (auth.role() = 'authenticated');
```

### Funciones Auxiliares

#### 1. Incrementar Vistas
```sql
CREATE OR REPLACE FUNCTION increment_news_views(news_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE real_estate_news 
  SET views = views + 1 
  WHERE id = news_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 2. Incrementar Clics
```sql
CREATE OR REPLACE FUNCTION increment_news_clicks(news_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE real_estate_news 
  SET clicks = clicks + 1 
  WHERE id = news_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 3. Desactivar Noticias Expiradas
```sql
CREATE OR REPLACE FUNCTION deactivate_expired_news()
RETURNS void AS $$
BEGIN
  UPDATE real_estate_news
  SET is_active = false
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW() 
    AND is_active = true;
END;
$$ LANGUAGE plpgsql;
```

### Triggers

#### 1. Actualizar `updated_at`
```sql
CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON real_estate_news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 2. Desactivar Noticias Expiradas (Automático)
```sql
CREATE TRIGGER auto_deactivate_expired_news
  BEFORE SELECT ON real_estate_news
  FOR EACH STATEMENT
  EXECUTE FUNCTION deactivate_expired_news();
```

### Vista: `active_real_estate_news`

```sql
CREATE VIEW active_real_estate_news AS
SELECT * FROM real_estate_news
WHERE is_active = true
  AND (expires_at IS NULL OR expires_at > NOW())
ORDER BY importance DESC, published_at DESC;
```

---

## 🔌 API Functions

### Ubicación
`src/lib/supabase.ts`

### Interface TypeScript

```typescript
export interface RealEstateNews {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: 'market' | 'construction' | 'economy' | 'urbanism' | 'legal' | 'trends';
  importance: number; // 1-5 scale
  location: string;
  source: string;
  source_url?: string;
  published_at: string;
  expires_at?: string;
  is_active: boolean;
  views: number;
  clicks: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}
```

### Funciones Disponibles

#### 1. `getActiveRealEstateNews(maxItems?: number): Promise<RealEstateNews[]>`
Obtiene noticias activas para mostrar en las burbujas flotantes.

```typescript
const news = await getActiveRealEstateNews(6); // Obtener 6 noticias
```

**Características:**
- Solo noticias con `is_active = true`
- Excluye noticias expiradas
- Ordena por importancia y fecha
- Limit configurable (default: 10)

---

#### 2. `getAllRealEstateNews(): Promise<RealEstateNews[]>`
Obtiene todas las noticias para el panel de administración.

```typescript
const allNews = await getAllRealEstateNews();
```

**Características:**
- Incluye activas e inactivas
- Incluye expiradas
- Ordenadas por fecha de publicación

---

#### 3. `getRealEstateNewsById(id: number): Promise<RealEstateNews | null>`
Obtiene una noticia específica por ID.

```typescript
const newsItem = await getRealEstateNewsById(123);
```

---

#### 4. `createRealEstateNews(newsData): Promise<RealEstateNews | null>`
Crea una nueva noticia.

```typescript
const newNews = await createRealEstateNews({
  title: 'Nueva noticia',
  summary: 'Resumen breve',
  content: 'Contenido completo...',
  category: 'market',
  importance: 4,
  location: 'El Poblado',
  source: 'El Colombiano',
  source_url: 'https://...',
  published_at: '2024-01-20',
  is_active: true
});
```

---

#### 5. `updateRealEstateNews(id: number, newsData): Promise<RealEstateNews | null>`
Actualiza una noticia existente.

```typescript
const updated = await updateRealEstateNews(123, {
  title: 'Título actualizado',
  importance: 5
});
```

---

#### 6. `deleteRealEstateNews(id: number): Promise<boolean>`
Elimina una noticia (soft delete - la marca como inactiva).

```typescript
const success = await deleteRealEstateNews(123);
```

---

#### 7. `toggleNewsStatus(id: number, isActive: boolean): Promise<boolean>`
Activa o desactiva una noticia.

```typescript
await toggleNewsStatus(123, false); // Desactivar
await toggleNewsStatus(123, true);  // Activar
```

---

#### 8. `incrementNewsViews(id: number): Promise<void>`
Incrementa el contador de vistas (llamado al abrir modal).

```typescript
await incrementNewsViews(123);
```

---

#### 9. `incrementNewsClicks(id: number): Promise<void>`
Incrementa el contador de clics (llamado al hacer clic en enlace externo).

```typescript
await incrementNewsClicks(123);
```

---

## 🎨 Componentes Frontend

### 1. FloatingNewsBubbles

**Ubicación:** `src/components/FloatingNewsBubbles.tsx`

**Props:**
```typescript
interface FloatingNewsBubblesProps {
  maxBubbles?: number;    // Número máximo de burbujas (default: 8)
  className?: string;     // Clases CSS adicionales
}
```

**Uso:**
```tsx
import FloatingNewsBubbles from '../components/FloatingNewsBubbles';

<FloatingNewsBubbles maxBubbles={6} />
```

**Características:**
- Burbujas flotantes con animación
- Hover con escala y glow
- Modal con detalles completos
- Tracking de vistas/clics
- Colores por categoría
- Iconos específicos por categoría
- Partículas decorativas
- Responsive design

**Integración en Home:**
```tsx
<div className="fixed top-20 right-4 z-40 pointer-events-none">
  <div className="pointer-events-auto">
    <FloatingNewsBubbles maxBubbles={6} />
  </div>
</div>
```

---

### 2. AdminNews

**Ubicación:** `src/pages/AdminNews.tsx`

**Ruta:** `/admin/news`

**Características:**
- ✅ Tabla con todas las noticias
- ✅ Filtros por categoría, estado y búsqueda
- ✅ Stats dashboard (total, activas, vistas, clics)
- ✅ Crear/Editar/Eliminar noticias
- ✅ Toggle activar/desactivar
- ✅ Modal de confirmación para eliminar
- ✅ Badges de categoría con colores
- ✅ Indicadores de importancia
- ✅ Estadísticas de engagement

**Formulario de Creación/Edición:**
- Título (requerido)
- Resumen (requerido)
- Contenido completo (requerido)
- Categoría (select)
- Importancia 1-5 (select)
- Ubicación (requerido)
- Fuente (requerido)
- URL de fuente (opcional)
- Fecha de publicación (requerido)
- Fecha de expiración (opcional)
- Estado activo/inactivo (checkbox)

---

## 📖 Guía de Uso

### Para Administradores

#### 1. Crear una Nueva Noticia

1. Ir a `/admin/news`
2. Clic en "Nueva Noticia"
3. Llenar el formulario:
   - **Título:** Conciso y llamativo
   - **Resumen:** Máximo 100 caracteres (aparece en burbuja)
   - **Contenido:** Información completa
   - **Categoría:** Seleccionar apropiada
   - **Importancia:** Evaluar relevancia (1-5)
   - **Ubicación:** Zona de Medellín o "Medellín" general
   - **Fuente:** Medio de comunicación
   - **URL:** Link a la noticia original (opcional)
   - **Fechas:** Publicación y expiración
4. Marcar "Activar inmediatamente" si quieres que aparezca ahora
5. Clic en "Crear Noticia"

#### 2. Editar una Noticia

1. Buscar la noticia en la tabla
2. Clic en el ícono de editar (✏️)
3. Modificar campos necesarios
4. Clic en "Guardar Cambios"

#### 3. Activar/Desactivar Noticia

- Clic en el badge de estado (Activa/Inactiva)
- Toggle instantáneo

#### 4. Eliminar Noticia

1. Clic en el ícono de eliminar (🗑️)
2. Confirmar en modal
3. La noticia se marca como inactiva (soft delete)

#### 5. Monitorear Performance

En el dashboard superior verás:
- Total de noticias
- Noticias activas
- Noticias inactivas
- Total de vistas
- Total de clics

**Métricas por noticia:**
- Vistas: Cuántas veces se abrió el modal
- Clics: Cuántas veces se hizo clic en "Leer más"

---

### Para Usuarios Finales

#### Interacción con Burbujas

1. **Ver burbujas flotantes:**
   - Aparecen en la parte derecha de la página principal
   - Colores y tamaños indican categoría e importancia

2. **Leer una noticia:**
   - Clic en cualquier burbuja
   - Se abre modal con contenido completo
   - Info: categoría, ubicación, fuente, fecha

3. **Ver noticia completa:**
   - Clic en "Leer más" (si hay URL)
   - Abre la fuente externa en nueva pestaña

4. **Cerrar modal:**
   - Clic en X
   - Clic fuera del modal

---

## 💡 Casos de Uso

### Caso 1: Noticia de Mercado Urgente
```
📊 Categoría: market
⭐ Importancia: 5
📍 Ubicación: El Poblado
🏢 Fuente: La República
📅 Publicación: Hoy
⏰ Expiración: 7 días

Título: "Precios en El Poblado suben 18% en el último trimestre"
Resumen: "Zona premium registra mayor valorización de Medellín"
```

**Resultado:** 
- Burbuja grande (importancia 5)
- Color verde (mercado)
- Aparece primero en la lista
- Visible por 7 días

---

### Caso 2: Actualización Legal
```
⚖️ Categoría: legal
⭐ Importancia: 3
📍 Ubicación: Medellín
🏢 Fuente: Ámbito Jurídico
📅 Publicación: Hoy
⏰ Expiración: 30 días

Título: "Nuevos requisitos para escrituración"
Resumen: "Cambios en POT afectan licencias"
```

**Resultado:**
- Burbuja mediana (importancia 3)
- Color rojo (legal)
- Visible por 30 días
- Útil para asesores y clientes

---

### Caso 3: Tendencia de Diseño
```
✨ Categoría: trends
⭐ Importancia: 2
📍 Ubicación: Medellín
🏢 Fuente: El Colombiano
📅 Publicación: Hoy
⏰ Expiración: Sin fecha

Título: "Apartamentos con terrazas, lo más buscado"
Resumen: "Espacios al aire libre ganan popularidad"
```

**Resultado:**
- Burbuja pequeña (importancia 2)
- Color rosa (tendencias)
- Sin expiración (siempre visible si está activa)
- Contenido informativo general

---

## 🎯 Mejores Prácticas

### Para Contenido

1. **Títulos:**
   - Máximo 60 caracteres
   - Claros y descriptivos
   - Evitar clickbait

2. **Resúmenes:**
   - Máximo 100 caracteres
   - Información clave
   - Sin puntos suspensivos

3. **Contenido:**
   - Completo pero conciso
   - Citar fuentes
   - Incluir datos relevantes

4. **Categorización:**
   - Usar la categoría más específica
   - No mezclar temas

5. **Importancia:**
   - Reservar 5 para urgentes/críticas
   - Usar 3 para noticias regulares
   - 1-2 para información general

6. **Expiración:**
   - Noticias de mercado: 7-14 días
   - Legales: 30-60 días
   - Tendencias: sin expiración o 90 días
   - Eventos: fecha del evento + 1 día

### Para Performance

1. **Límite de burbujas:** 6-8 máximo para evitar saturación
2. **Revisar estadísticas:** Analizar vistas/clics semanalmente
3. **Desactivar noticias viejas:** Mantener contenido fresco
4. **Verificar expiración:** Asegurar que fechas sean correctas

---

## 🔧 Mantenimiento

### Tareas Rutinarias

#### Diarias
- Revisar noticias urgentes (importancia 5)
- Responder a consultas relacionadas con noticias

#### Semanales
- Crear 2-3 noticias nuevas
- Revisar estadísticas de engagement
- Desactivar noticias obsoletas

#### Mensuales
- Análisis completo de métricas
- Ajustar estrategia de contenido
- Limpiar noticias expiradas

### Monitoreo de Métricas

**KPIs Importantes:**
- CTR (Click Through Rate): clics / vistas
- Tasa de interacción: vistas / visitas a la página
- Categoría más popular: basado en vistas
- Importancia óptima: basado en engagement

**Ejemplo de Análisis:**
```
📊 Análisis Semanal:
- Total vistas: 450
- Total clics: 89
- CTR: 19.7%
- Categoría más vista: Mercado (180 vistas)
- Importancia promedio: 3.8
```

---

## 📁 Archivos del Sistema

```
real_estate_news_system/
├── 📄 CREATE_REAL_ESTATE_NEWS.sql      # Script de creación de BD
├── 📄 src/lib/supabase.ts              # Funciones API (líneas finales)
├── 📄 src/components/
│   └── FloatingNewsBubbles.tsx         # Componente de burbujas
├── 📄 src/pages/
│   ├── Home.tsx                        # Integración en Home
│   └── AdminNews.tsx                   # Panel de administración
├── 📄 src/App.tsx                      # Ruta /admin/news
├── 📄 src/components/Layout/
│   └── AdminLayout.tsx                 # Menú lateral con "Noticias"
└── 📄 SISTEMA_NOTICIAS_DOCUMENTACION.md # Este archivo
```

---

## 🚀 Instalación Rápida

### 1. Ejecutar SQL en Supabase

```sql
-- Copiar y ejecutar CREATE_REAL_ESTATE_NEWS.sql completo
```

### 2. Verificar en Supabase Dashboard

- Ir a Table Editor
- Verificar que existe `real_estate_news`
- Verificar datos de ejemplo (8 noticias)

### 3. Probar en la Aplicación

1. **Como Admin:**
   - Login en `/admin`
   - Ir a "Noticias" en menú
   - Verificar que aparecen las 8 noticias de ejemplo

2. **Como Usuario:**
   - Ir a página principal `/`
   - Verificar burbujas flotantes en lado derecho
   - Hacer clic en una burbuja
   - Verificar modal con detalles

---

## 🎉 ¡Sistema Completo!

El sistema de noticias inmobiliarias está listo para usar. Incluye:

✅ Base de datos completa  
✅ Funciones API  
✅ Componente de burbujas flotantes  
✅ Panel de administración  
✅ Tracking de métricas  
✅ Sistema de categorías  
✅ Colores del branding  
✅ Animaciones profesionales  

**Contacto de Soporte:** Documentación técnica actualizada al 2024-01-20
