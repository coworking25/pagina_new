# 🔍 GUÍA DE VALIDACIÓN - CONTADOR DE VISITAS NO REFLEJA EN DASHBOARD

## 🎯 Problema Reportado

El contador total de visitas **no se refleja** en el Dashboard panel de reportes.

---

## 📋 CHECKLIST DE VALIDACIÓN

### ✅ PASO 1: Verificar que HAY Vistas Registradas en Supabase

**Ir a Supabase → SQL Editor → Ejecutar:**

```sql
SELECT COUNT(*) as total_vistas FROM property_views;
```

**Resultados posibles:**

| Resultado | Significado | Acción |
|-----------|-------------|--------|
| `total_vistas = 0` | ❌ NO hay vistas registradas | Ir a **PASO 2A** |
| `total_vistas > 0` | ✅ Hay vistas registradas | Ir a **PASO 2B** |

---

### 🔧 PASO 2A: Si NO Hay Vistas (total_vistas = 0)

#### **2A.1 - Verificar Políticas RLS**

```sql
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'property_views';
```

**Debe mostrar:**
- `Anyone can insert views` (INSERT)
- `Only admins can read views` (SELECT)

**Si NO aparecen, crear políticas:**

```sql
-- Permitir INSERT anónimo
CREATE POLICY "Anyone can insert views" ON property_views
FOR INSERT WITH CHECK (true);

-- Permitir SELECT solo a admins
CREATE POLICY "Only admins can read views" ON property_views
FOR SELECT USING (
  auth.role() = 'authenticated' 
  OR auth.jwt() ->> 'role' = 'admin'
);
```

#### **2A.2 - Generar Datos de Prueba**

**Opción A: Manualmente en Supabase**

```sql
-- Insertar 5 vistas de prueba
INSERT INTO property_views (property_id, session_id, device_type, created_at)
SELECT 
  p.id,
  'test_session_' || generate_series || '_' || floor(random() * 1000),
  (ARRAY['desktop', 'mobile', 'tablet'])[floor(random() * 3 + 1)],
  NOW() - (random() * INTERVAL '7 days')
FROM properties p, generate_series(1, 5)
WHERE p.status IN ('available', 'rented', 'sold')
LIMIT 20;

-- Verificar
SELECT COUNT(*) FROM property_views;
```

**Opción B: Navegar por el sitio**

1. Abrir `http://localhost:5173/properties`
2. Click en varias propiedades (mínimo 5)
3. Permanecer 10 segundos en cada una
4. Volver a verificar con el SQL anterior

#### **2A.3 - Verificar Tracking en Navegador**

1. Abrir `http://localhost:5173/properties`
2. Abrir **Consola del navegador** (F12)
3. Click en una propiedad
4. Buscar en consola: `✅ Vista de propiedad registrada`

**Si NO aparece:**
- Verificar que `PropertyDetailsModal.tsx` tiene `trackPropertyView()`
- Ver si hay errores en consola

---

### 🔍 PASO 2B: Si HAY Vistas pero Dashboard NO las Muestra

#### **2B.1 - Verificar Query del Dashboard**

```sql
-- Esta es la query que usa getDashboardAnalytics()
SELECT 
  COUNT(DISTINCT pl.id) as total_likes,
  COUNT(DISTINCT pv.id) as total_views,  -- ← Este debería tener valor
  COUNT(DISTINCT pc.id) as total_contacts,
  COUNT(DISTINCT pv.session_id) as unique_visitors
FROM properties p
LEFT JOIN property_likes pl ON p.id = pl.property_id 
LEFT JOIN property_views pv ON p.id = pv.property_id 
LEFT JOIN property_contacts pc ON p.id = pc.property_id;
```

**Si `total_views` tiene valor aquí pero NO en el dashboard:**
→ El problema está en el **código del frontend**

#### **2B.2 - Verificar getDashboardAnalytics() en Código**

**Abrir:** `src/lib/analytics.ts`

**Buscar:**
```typescript
export const getDashboardAnalytics = async (
  filters?: AnalyticsFilters
): Promise<DashboardAnalytics | null> => {
```

**Verificar que tenga:**
```typescript
const [likesCount, viewsCount, contactsCount] = await Promise.all([
  supabase.from('property_likes').select('*', { count: 'exact', head: true }),
  supabase.from('property_views').select('*', { count: 'exact', head: true }), // ← Importante
  supabase.from('property_contacts').select('*', { count: 'exact', head: true })
]);
```

**Y que retorne:**
```typescript
return {
  totalProperties: 0,
  totalLikes: likesCount.count || 0,
  totalViews: viewsCount.count || 0,  // ← Importante
  totalContacts: contactsCount.count || 0,
  uniqueVisitors: 0,
  topProperties,
  recentActivity: [],
  chartData
};
```

#### **2B.3 - Verificar ReportsModal**

**Abrir:** `src/components/Modals/ReportsModal.tsx`

**Verificar que use:**
```typescript
const loadAnalytics = async () => {
  setIsLoading(true);
  try {
    const [analyticsData, topPropsData] = await Promise.all([
      getDashboardAnalytics(),  // ← Esta función
      getTopProperties(10, dateRange)
    ]);
    
    setAnalytics(analyticsData);
    setTopProperties(topPropsData);
  } catch (error) {
    console.error('Error cargando analytics:', error);
  } finally {
    setIsLoading(false);
  }
};
```

**Y que muestre el conteo:**
```typescript
const OverviewTab: React.FC<{ analytics: DashboardAnalytics | null }> = ({ analytics }) => {
  const stats = [
    { label: 'Total Likes', value: analytics?.totalLikes || 0, icon: Heart },
    { label: 'Total Vistas', value: analytics?.totalViews || 0, icon: Eye }, // ← Aquí
    { label: 'Total Contactos', value: analytics?.totalContacts || 0, icon: Phone },
  ];
```

#### **2B.4 - Probar en Consola del Navegador**

1. Abrir Dashboard Admin
2. Click en "Ver Reportes"
3. Abrir Consola (F12)
4. Ejecutar:

```javascript
// Importar función
import { getDashboardAnalytics } from './src/lib/analytics';

// Obtener datos
const analytics = await getDashboardAnalytics();
console.log('Analytics:', analytics);
console.log('Total Vistas:', analytics?.totalViews);
```

**Si `totalViews` tiene valor:**
→ El problema está en cómo ReportsModal muestra los datos

**Si `totalViews` es 0 o null:**
→ El problema está en `getDashboardAnalytics()`

---

## 🧪 SCRIPT DE VALIDACIÓN AUTOMÁTICA

### **Opción 1: SQL en Supabase**

```sql
-- Copiar y pegar en SQL Editor de Supabase
\i VALIDAR_CONTADOR_VISITAS.sql
```

Este script:
- ✅ Verifica tabla `property_views`
- ✅ Cuenta registros totales
- ✅ Muestra últimas vistas
- ✅ Simula query del dashboard
- ✅ Verifica políticas RLS
- ✅ Da diagnóstico automático

### **Opción 2: JavaScript en Navegador**

```bash
# En la raíz del proyecto
cat validar_tracking_navegador.js
```

Copiar el código y pegarlo en la consola del navegador

---

## 🔧 SOLUCIONES COMUNES

### **Problema 1: Vistas NO se registran**

**Causa:** Tracking no implementado o políticas RLS bloqueando

**Solución:**
```typescript
// En PropertyDetailsModal.tsx
import { trackPropertyView } from '../../lib/analytics';
import { useRef, useEffect } from 'react';

const PropertyDetailsModal = ({ property, isOpen, onClose }) => {
  const viewStartTime = useRef<number>(Date.now());
  
  useEffect(() => {
    if (property && isOpen) {
      viewStartTime.current = Date.now();
      
      return () => {
        const duration = Math.floor((Date.now() - viewStartTime.current) / 1000);
        trackPropertyView(String(property.id), duration).catch(console.error);
      };
    }
  }, [property, isOpen]);
  
  // ... rest
};
```

### **Problema 2: Dashboard muestra 0 vistas**

**Causa:** `getDashboardAnalytics()` no cuenta correctamente

**Solución:**
```typescript
// En src/lib/analytics.ts
export const getDashboardAnalytics = async (): Promise<DashboardAnalytics | null> => {
  try {
    // Contar vistas directamente
    const { count: viewsCount, error: viewsError } = await supabase
      .from('property_views')
      .select('*', { count: 'exact', head: true });
    
    if (viewsError) throw viewsError;
    
    console.log('📊 Total Vistas:', viewsCount); // Debug
    
    return {
      totalProperties: 0,
      totalLikes: 0,
      totalViews: viewsCount || 0,  // ← Asegurar que se asigna
      totalContacts: 0,
      uniqueVisitors: 0,
      topProperties: [],
      recentActivity: [],
      chartData: []
    };
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
};
```

### **Problema 3: ReportsModal no muestra datos**

**Causa:** Componente no actualiza estado o no renderiza

**Solución:**
```typescript
// En ReportsModal.tsx
const OverviewTab = ({ analytics }) => {
  // Debug
  useEffect(() => {
    console.log('📊 Analytics en OverviewTab:', analytics);
    console.log('📊 Total Vistas:', analytics?.totalViews);
  }, [analytics]);
  
  const stats = [
    {
      label: 'Total Vistas',
      value: analytics?.totalViews || 0,  // ← Verificar que está aquí
      icon: Eye,
      color: 'text-blue-500'
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map(stat => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="stat-card">
            <Icon className={`w-8 h-8 ${stat.color}`} />
            <h3 className="text-3xl font-bold">{stat.value}</h3>
            <p>{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
};
```

---

## ✅ CHECKLIST FINAL

Antes de reportar como bug, verificar:

- [ ] Hay vistas en `property_views` (SQL: `SELECT COUNT(*) FROM property_views`)
- [ ] Políticas RLS permiten INSERT anónimo
- [ ] `trackPropertyView()` se ejecuta al abrir propiedades
- [ ] Consola muestra `✅ Vista de propiedad registrada`
- [ ] `getDashboardAnalytics()` retorna `totalViews > 0`
- [ ] `ReportsModal` llama a `getDashboardAnalytics()`
- [ ] OverviewTab recibe y muestra `analytics.totalViews`

---

## 🚀 SIGUIENTE PASO

**Ejecuta este comando para diagnóstico completo:**

```sql
-- En Supabase SQL Editor
SELECT 
  'Total Vistas' as metrica,
  COUNT(*) as valor,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ NO HAY VISTAS - Ejecuta INSERT_DATOS_PRUEBA.sql'
    WHEN COUNT(*) < 10 THEN '⚠️ POCAS VISTAS - Navega más por el sitio'
    ELSE '✅ OK'
  END as estado
FROM property_views
UNION ALL
SELECT 
  'Dashboard Query',
  COUNT(DISTINCT pv.id) as valor,
  CASE 
    WHEN COUNT(DISTINCT pv.id) = 0 THEN '❌ QUERY DEL DASHBOARD NO FUNCIONA'
    ELSE '✅ OK'
  END
FROM properties p
LEFT JOIN property_views pv ON p.id = pv.property_id;
```

**Comparte el resultado para diagnóstico específico.**

---

## 📝 ARCHIVOS CREADOS PARA VALIDACIÓN

1. **VALIDAR_CONTADOR_VISITAS.sql** - Diagnóstico SQL completo
2. **validar_tracking_navegador.js** - Validación en navegador
3. **VALIDACION_CONTADOR_VISITAS.md** - Esta guía

**Uso:**
1. Ejecutar SQL en Supabase
2. Ejecutar JS en navegador
3. Seguir esta guía según resultados
