# Guía Rápida de Desarrollo

Esta guía proporciona comandos y procedimientos comunes para el desarrollo del proyecto.

## 🚀 Inicio Rápido

### Primera vez configurando el proyecto
```bash
# 1. Clonar repositorio
git clone https://github.com/coworking25/pagina_new.git
cd pagina_new

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# 4. Iniciar servidor de desarrollo
npm run dev
```

## 📝 Comandos Comunes

### Desarrollo
```bash
# Iniciar servidor de desarrollo (puerto 5173)
npm run dev

# Verificar tipos de TypeScript
npm run type-check

# Ejecutar linter
npm run lint

# Corregir automáticamente problemas de linting
npm run lint:fix
```

### Build y Deploy
```bash
# Build para producción
npm run build

# Preview del build de producción
npm run preview

# Build con análisis de tamaño
npm run build:analyze
```

### Seguridad
```bash
# Ver vulnerabilidades de seguridad
npm run security:audit

# Intentar corregir vulnerabilidades automáticamente
npm run security:fix

# Actualizar base de datos de navegadores
npm run update:browserslist
```

### Mantenimiento
```bash
# Limpiar e reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Actualizar dependencias
npm update

# Ver dependencias desactualizadas
npm outdated
```

## 🔧 Tareas Comunes

### Agregar una Nueva Propiedad (via UI)
1. Ir a `/admin/properties`
2. Click en "Nueva Propiedad"
3. Completar el formulario
4. Subir imágenes
5. Seleccionar imagen de portada
6. Guardar

### Crear un Nuevo Cliente
1. Ir a `/admin/clients`
2. Click en "Nuevo Cliente"
3. Seguir el wizard de 6 pasos
4. Asignar propiedades (opcional)
5. Guardar

### Agendar una Cita
1. Ir a `/admin/calendar`
2. Click en un slot de tiempo disponible
3. Seleccionar cliente y propiedad
4. Confirmar detalles
5. Guardar

## 🐛 Solución de Problemas

### El servidor no inicia
```bash
# Verificar que el puerto 5173 esté disponible
lsof -ti:5173 | xargs kill -9  # Linux/Mac
netstat -ano | findstr :5173   # Windows

# Reinstalar dependencias
rm -rf node_modules
npm install
```

### Errores de TypeScript
```bash
# Verificar errores específicos
npm run type-check

# Limpiar caché de TypeScript
rm -rf node_modules/.vite
```

### Errores de Build
```bash
# Limpiar y rebuild
rm -rf dist
npm run build

# Verificar configuración de Vite
cat vite.config.ts
```

### Problemas de Autenticación
1. Verificar variables de entorno en `.env`
2. Verificar configuración de Supabase
3. Revisar políticas RLS en Supabase
4. Limpiar localStorage del navegador

## 📁 Estructura de Archivos Clave

```
src/
├── App.tsx                 # Componente principal y rutas
├── main.tsx               # Punto de entrada
├── components/
│   ├── Admin*/            # Componentes del panel admin
│   ├── Client*/           # Componentes del portal cliente
│   ├── Calendar/          # Sistema de calendario
│   └── Home/              # Componentes públicos
├── services/
│   ├── supabase.ts        # Cliente de Supabase
│   ├── clientsApi.ts      # API de clientes
│   └── analytics.ts       # Servicio de analytics
├── store/
│   └── authStore.ts       # Estado global de autenticación
└── types/
    └── index.ts           # Definiciones de tipos TypeScript
```

## 🔑 Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima

# Opcional: Google Calendar (si usas integración)
VITE_GOOGLE_CLIENT_ID=tu-client-id
VITE_GOOGLE_API_KEY=tu-api-key
```

## 🔐 Roles y Permisos

### Admin
- ✅ Acceso completo a todas las funcionalidades
- ✅ Gestión de propiedades, clientes, asesores
- ✅ Visualización de analytics
- ✅ Configuración del sistema

### Advisor (Asesor)
- ✅ Gestión de propiedades
- ✅ Gestión de clientes asignados
- ✅ Calendario y citas
- ✅ Consultas
- ❌ Gestión de otros asesores
- ❌ Configuración del sistema

### Client (Cliente)
- ✅ Portal personal
- ✅ Ver propiedades asignadas
- ✅ Descargar documentos
- ✅ Ver pagos y extractos
- ❌ Acceso al panel admin

## 📊 Base de Datos

### Conectar a Supabase
```typescript
import { supabase } from './services/supabase';

// Ejemplo de consulta
const { data, error } = await supabase
  .from('properties')
  .select('*')
  .eq('status', 'Disponible');
```

### Tablas Principales
- `properties` - Propiedades
- `clients` - Clientes
- `advisors` - Asesores
- `appointments` - Citas
- `inquiries` - Consultas
- `client_documents` - Documentos de clientes
- `client_payments` - Pagos de clientes

## 🎨 Estilos y Temas

### Tailwind CSS
El proyecto usa Tailwind CSS para estilos. Ver `tailwind.config.js` para configuración.

### Dark Mode
Dark mode está implementado pero puede necesitar ajustes:
```typescript
// Cambiar tema
document.documentElement.classList.toggle('dark');
```

### Colores Principales
```css
/* Ver src/index.css para colores personalizados */
--primary: #3b82f6
--secondary: #10b981
--accent: #f59e0b
```

## 🧪 Testing (Pendiente)

Actualmente no hay tests implementados. Plan recomendado:
```bash
# Instalar dependencias de testing (futuro)
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Ejecutar tests (futuro)
npm test
```

## 📱 Responsive Design

El proyecto está optimizado para:
- ✅ Desktop (1920px+)
- ✅ Laptop (1024px-1919px)
- ✅ Tablet (768px-1023px)
- ✅ Mobile (320px-767px)

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Deploy a producción
vercel --prod
```

### Variables de Entorno en Vercel
1. Ir a Project Settings > Environment Variables
2. Agregar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
3. Redeploy

## 📚 Recursos Útiles

- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Supabase Docs](https://supabase.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Docs](https://vitejs.dev)

## 💡 Tips y Mejores Prácticas

### Performance
- Usa `React.lazy()` para code splitting
- Optimiza imágenes antes de subirlas
- Usa `useMemo` y `useCallback` para componentes pesados

### Seguridad
- Nunca commits credenciales en el código
- Usa variables de entorno para datos sensibles
- Revisa políticas RLS en Supabase regularmente

### Code Quality
- Ejecuta `npm run lint:fix` antes de commit
- Verifica tipos con `npm run type-check`
- Sigue la estructura de carpetas existente
- Agrega comentarios para lógica compleja

## 🆘 Obtener Ayuda

1. Revisar documentación en `/docs/`
2. Ver `PROJECT_ANALYSIS_AND_RECOMMENDATIONS.md`
3. Consultar con el equipo de desarrollo
4. Revisar issues en GitHub

---

*Última actualización: Noviembre 2025*
