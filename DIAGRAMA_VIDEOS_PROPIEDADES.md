# 🎬 DIAGRAMA: Sistema de Videos y Fotos para Propiedades

## 📊 ARQUITECTURA ACTUAL vs FUTURA

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ESTADO ACTUAL ✅                              │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────────────┐
│   Admin UI   │─────▶│  Supabase    │─────▶│  Supabase Storage   │
│ (Dashboard)  │      │  Database    │      │  property-images/    │
└──────────────┘      └──────────────┘      └──────────────────────┘
                            │                         │
                            │                         ├─ CA-001/
                      ┌─────┴─────┐                   │  ├─ imagen1.jpg
                      │ properties│                   │  ├─ imagen2.jpg
                      │   table   │                   │  └─ imagen3.jpg
                      │           │                   │
                      │ - images  │                   ├─ CA-002/
                      │   (array) │                   │  ├─ imagen1.jpg
                      │           │                   │  └─ imagen2.jpg
                      └───────────┘                   └─ ...


┌─────────────────────────────────────────────────────────────────────┐
│                     ESTADO FUTURO 🎥 ✅                              │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────────────┐
│   Admin UI   │─────▶│  Supabase    │─────▶│  Supabase Storage   │
│ (Dashboard)  │      │  Database    │      │                      │
└──────────────┘      └──────────────┘      │  ┌─ property-images/ │
                            │                │  │  ├─ CA-001/       │
                      ┌─────┴─────┐         │  │  ├─ CA-002/       │
                      │ properties│         │  │                   │
                      │   table   │         │  └─ property-videos/ │
                      │           │         │     ├─ CA-001/       │
                      │ - images  │─────────┼────▶│  ├─ video1.mp4 │
                      │   (array) │         │     │  ├─ thumb1.jpg │
                      │           │         │     │  └─ video2.mp4 │
                      │ - videos  │─────────┼────▶│                │
                      │   (JSONB) │         │     ├─ CA-002/       │
                      │           │         │     │  └─ tour.mp4   │
                      └───────────┘         └─────┴────────────────┘
```

---

## 🔄 FLUJO DE SUBIDA DE VIDEOS

```
┌─────────────────────────────────────────────────────────────────┐
│  1. USUARIO SELECCIONA VIDEO                                    │
└─────────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. VALIDACIONES EN FRONTEND                                    │
│     ✓ Formato (MP4, WebM, MOV)                                  │
│     ✓ Tamaño (< 100MB)                                          │
│     ✓ Tipo de archivo                                           │
└─────────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. UPLOAD A SUPABASE STORAGE                                   │
│     → property-videos/CA-XXX/video-timestamp.mp4                │
│     → Mostrar progreso (%)                                      │
└─────────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. GENERAR THUMBNAIL AUTOMÁTICO                                │
│     → Capturar frame del segundo 1                              │
│     → Guardar como video-timestamp-thumb.jpg                    │
└─────────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────────┐
│  5. GUARDAR METADATA EN DATABASE                                │
│     → Actualizar columna 'videos' (JSONB)                       │
│     → Incluir: url, thumbnail, size, duration                   │
└─────────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────────┐
│  6. ACTUALIZAR UI                                                │
│     → Mostrar video en galería                                  │
│     → Permitir reproducción                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 COMPONENTES UI

```
┌─────────────────────────────────────────────────────────────────┐
│  ADMIN DASHBOARD - Editar Propiedad                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📸 IMÁGENES                            🎥 VIDEOS               │
│  ┌──────────┐ ┌──────────┐            ┌──────────┐            │
│  │  IMG 1   │ │  IMG 2   │            │ ▶ VIDEO1 │            │
│  │  🗑️      │ │  🗑️      │            │  🗑️      │            │
│  └──────────┘ └──────────┘            └──────────┘            │
│                                                                  │
│  [+ Agregar Fotos]                    [+ Agregar Videos]        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────┐
│  PROPERTY DETAIL - Vista Pública                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┬─────────────┐                                 │
│  │   📸 FOTOS  │  🎥 VIDEOS  │  ← TABS                          │
│  └─────────────┴─────────────┘                                 │
│                                                                  │
│  ┌────────────────────────────────────────────────┐            │
│  │                                                 │            │
│  │           ▶  REPRODUCIR VIDEO                  │            │
│  │                                                 │            │
│  │        [Controles: Play/Pause/Mute/Full]       │            │
│  └────────────────────────────────────────────────┘            │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                       │
│  │ ▶ VID 1  │ │ ▶ VID 2  │ │ ▶ VID 3  │                       │
│  │ "Exterior"│ │ "Interior"│ │ "Cocina" │                       │
│  └──────────┘ └──────────┘ └──────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 ESTRUCTURA DE DATOS

### Base de Datos (PostgreSQL)

```sql
properties
├─ id (BIGINT)
├─ code (TEXT) ────────────────┐ "CA-001"
├─ title (TEXT)                │
├─ price (NUMERIC)             │
├─ ...                         │
├─ images (JSONB) ────────────┐│
│  └─ [                       ││
│      "url1.jpg",            ││
│      "url2.jpg"             ││
│     ]                       ││
│                             ││
└─ videos (JSONB) ────────────┼┼─ NUEVO
   └─ [                       ││
       {                      ││
         "url": "...",        ││
         "thumbnail": "...",  ││
         "title": "...",      ││
         "duration": 120,     ││
         "size": 15728640     ││
       }                      ││
      ]                       ││
                              ││
Supabase Storage              ││
                              ││
property-images/ ◄────────────┘│
├─ CA-001/                     │
│  ├─ imagen1.jpg              │
│  └─ imagen2.jpg              │
                               │
property-videos/ ◄─────────────┘
├─ CA-001/
│  ├─ recorrido.mp4
│  └─ recorrido-thumb.jpg
```

---

## 🔐 SEGURIDAD Y PERMISOS

```
┌─────────────────────────────────────────────────────────────────┐
│  ROW LEVEL SECURITY (RLS) - Supabase Storage                    │
└─────────────────────────────────────────────────────────────────┘

Bucket: property-videos
│
├─ SELECT (Lectura) ──────────────────────► 🌍 PÚBLICO
│  "Cualquiera puede ver videos"
│
├─ INSERT (Subida) ───────────────────────► 🔒 AUTH
│  "Solo usuarios autenticados"
│
├─ UPDATE (Modificar) ────────────────────► 🔒 AUTH
│  "Solo usuarios autenticados"
│
└─ DELETE (Eliminar) ─────────────────────► 🔒 AUTH
   "Solo usuarios autenticados"
```

---

## 📈 COMPARACIÓN: IMÁGENES vs VIDEOS

```
┌──────────────────┬─────────────────┬─────────────────────┐
│  CARACTERÍSTICA  │    IMÁGENES     │      VIDEOS         │
├──────────────────┼─────────────────┼─────────────────────┤
│ Bucket           │ property-images │ property-videos     │
│ Formatos         │ JPG, PNG, WebP  │ MP4, WebM, MOV      │
│ Tamaño máximo    │ 5 MB            │ 100 MB              │
│ Marca de agua    │ ✅ Automática    │ ❌ No (futuro)      │
│ Thumbnail        │ La misma imagen │ ✅ Auto-generado    │
│ Organización     │ Por código      │ Por código          │
│ Campo en DB      │ images (array)  │ videos (JSONB)      │
│ Visualización    │ Galería + Modal │ Player + Tabs       │
│ Compresión       │ Automática      │ Manual (por ahora)  │
└──────────────────┴─────────────────┴─────────────────────┘
```

---

## 🎯 CASOS DE USO

### Caso 1: Apartamento con Tour Completo

```
Propiedad: CA-001 "Apartamento en Envigado"

📸 IMÁGENES (12):
├─ Fachada
├─ Sala
├─ Cocina
├─ Habitación 1
├─ Habitación 2
├─ Baño
├─ Balcón
└─ ...

🎥 VIDEOS (3):
├─ "Recorrido Exterior" (2:00 min, 45 MB)
├─ "Recorrido Interior" (3:30 min, 78 MB)
└─ "Vista desde el balcón" (1:00 min, 25 MB)

Total multimedia: 12 fotos + 3 videos = 15 items
Espacio usado: ~12 MB (fotos) + 148 MB (videos) = 160 MB
```

### Caso 2: Casa con Énfasis en Exterior

```
Propiedad: CA-015 "Casa Campestre"

📸 IMÁGENES (18):
├─ 10 fotos exteriores
└─ 8 fotos interiores

🎥 VIDEOS (2):
├─ "Tour del Jardín" (4:00 min, 95 MB)
└─ "Vista aérea con drone" (1:30 min, 55 MB)

Total multimedia: 18 fotos + 2 videos = 20 items
Espacio usado: ~18 MB (fotos) + 150 MB (videos) = 168 MB
```

---

## ⚡ PERFORMANCE

### Tiempos de Carga Estimados

```
┌─────────────────────────────────────────────────────────────┐
│  Conexión: 10 Mbps (Promedio Colombia)                      │
└─────────────────────────────────────────────────────────────┘

Fotos (1 MB cada):
├─ Primera imagen: ~1 segundo
├─ Galería completa (10 fotos): ~3-5 segundos
└─ Con lazy loading: Instantáneo

Videos (50 MB promedio):
├─ Carga de thumbnail: <1 segundo ✅
├─ Inicio de reproducción: 2-3 segundos
├─ Buffer completo: 40-60 segundos
└─ Reproducción: Instantánea después del buffer inicial

Optimizaciones:
✅ Thumbnails pre-cargados
✅ Videos on-demand (no autoplay)
✅ Lazy loading de galería
✅ Compresión de imágenes
```

---

## 💰 COSTOS ESTIMADOS (Supabase)

### Escenario: 50 Propiedades Activas

```
┌─────────────────────────────────────────────────────────────┐
│  CÁLCULO DE STORAGE                                          │
└─────────────────────────────────────────────────────────────┘

Imágenes:
├─ 50 propiedades × 12 fotos × 1 MB = 600 MB
└─ Costo: 600 MB × $0.021/GB = ~$0.01/mes

Videos:
├─ 50 propiedades × 2 videos × 50 MB = 5 GB
└─ Costo: 5 GB × $0.021/GB = ~$0.11/mes

Thumbnails de videos:
├─ 50 propiedades × 2 thumbs × 200 KB = 20 MB
└─ Costo: 20 MB × $0.021/GB = ~$0.001/mes

TOTAL STORAGE: ~$0.12/mes


┌─────────────────────────────────────────────────────────────┐
│  CÁLCULO DE BANDWIDTH (Tráfico)                             │
└─────────────────────────────────────────────────────────────┘

Asumiendo 1000 visitas/mes:
├─ Imágenes vistas: 1000 × 5 fotos × 1 MB = 5 GB
├─ Videos vistos: 200 × 1 video × 50 MB = 10 GB
│   (20% de usuarios ven videos)
└─ Costo: 15 GB × $0.09/GB = ~$1.35/mes

TOTAL MENSUAL: $0.12 (storage) + $1.35 (bandwidth) = ~$1.50/mes
```

### Plan Gratuito de Supabase

```
Límites del Free Tier:
├─ Storage: 1 GB ────────────► Suficiente para inicio ✅
├─ Bandwidth: 2 GB/mes ──────► Puede quedarse corto ⚠️
└─ Database: 500 MB ─────────► Suficiente ✅

Recomendación:
- Iniciar con Free Tier
- Monitorear uso de bandwidth
- Upgrade a Pro ($25/mes) si se necesita:
  ├─ 8 GB storage
  └─ 50 GB bandwidth
```

---

## 🚦 SEMÁFORO DE IMPLEMENTACIÓN

```
┌───────────────────────────────────────────────────────────┐
│  ¿QUÉ TAN DIFÍCIL ES CADA PASO?                           │
└───────────────────────────────────────────────────────────┘

🟢 FÁCIL (15-30 min)
├─ Ejecutar SQL en Supabase
├─ Crear bucket de videos
├─ Actualizar types (TypeScript)
└─ Importar componentes

🟡 MEDIO (30-60 min)
├─ Crear supabase-videos.ts
├─ Crear VideoPlayer.tsx
└─ Testing básico

🔴 REQUIERE ATENCIÓN (1-2 horas)
├─ Actualizar AdminProperties.tsx
├─ Actualizar PropertyDetail.tsx
├─ Generación de thumbnails
└─ Testing completo en producción
```

---

## ✅ VALIDACIÓN FINAL

```
Antes de dar por terminado, verificar:

DATABASE:
☐ Columna 'videos' existe en properties
☐ Columna 'cover_video' existe en properties
☐ Bucket 'property-videos' creado y público
☐ Políticas RLS configuradas

CÓDIGO:
☐ src/types/index.ts actualizado
☐ src/lib/supabase-videos.ts creado
☐ src/components/VideoPlayer.tsx creado
☐ src/pages/AdminProperties.tsx actualizado
☐ src/pages/PropertyDetail.tsx actualizado

FUNCIONALIDAD:
☐ Subir video desde admin ✅
☐ Ver video en detalle ✅
☐ Thumbnail se genera automáticamente ✅
☐ Eliminar video funciona ✅
☐ Responsive en móvil ✅

PERFORMANCE:
☐ Videos no hacen autoplay
☐ Thumbnails cargan rápido
☐ No hay memory leaks
☐ Funciona en Chrome, Firefox, Safari
```

---

**Creado:** 2024-10-08  
**Para:** Sistema de Propiedades - Coworking  
**Versión:** 1.0
