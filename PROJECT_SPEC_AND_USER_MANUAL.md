# Especificación del Proyecto y Manual de Usuario

Fecha: 2025-09-17
Repositorio: pagina_new (branch: main)
Propósito: Documento centralizado que agrupa requisitos funcionales y no funcionales, manual de usuario, guía rápida de desarrollo, pruebas y mantenimiento del proyecto.

---

## 1. Resumen del Proyecto

Este proyecto es una plataforma web para administración inmobiliaria construida con React + TypeScript y Supabase como backend. Proporciona gestión de propiedades, clientes, asesores, citas/agenda, contratos y operaciones relacionadas con imágenes, importaciones y migraciones.

Stack principal:
- Frontend: React + TypeScript, Vite
- Backend (BaaS): Supabase (Postgres, storage)
- Estado: React useState/useEffect, modales y formularios personalizados
- Librerías notables: lucide-react (iconos), framer-motion

---

## 2. Alcance actual (funcionalidades implementadas y en progreso)

Resumen de módulos principales:
- Administración de Propiedades (CRUD, imágenes, estado, dashboard)
- Administración de Clientes (CRUD, relaciones cliente-propiedad, contratos)
- Administración de Asesores (CRUD, asignación a propiedades)
- Agenda y Citas (reservas, calendario, notificaciones)
- Importaciones/Migraciones (scripts para migrar datos a Supabase)
- Panel administrativo (dashboards, estadísticas, filtros)

---

## 3. Requerimientos Funcionales (70+) - Versión extensa

Nota: Los requisitos están numerados para facilitar trazabilidad a historias de usuario.

1. Autenticación de usuarios administradores.
2. Autorización basada en roles (admin, advisor, viewer).
3. Listado de propiedades con paginación.
4. Búsqueda de propiedades por texto.
5. Filtros por ciudad, estado, número de habitaciones, baños.
6. Ordenamiento por precio, fecha de creación y visitas.
7. Ver detalles completos de una propiedad.
8. Crear nueva propiedad con datos básicos (titulo, descripción, precio).
9. Editar propiedad existente.
10. Eliminar propiedad.
11. Subir multiple imágenes para una propiedad.
12. Establecer imagen de portada (cover) de una propiedad.
13. Eliminar imágenes asociadas a propiedades.
14. Generar código único de propiedad automático.
15. Cambiar estado de propiedad (available, rented, maintenance, pending).
16. Liberar propiedad (cierre de contrato asociado).
17. Registrar actividad histórica por propiedad.
18. Obtener estadísticas de una propiedad (views, inquiries, appointments).
19. Registrar y aumentar contador de vistas de propiedad.
20. Registrar consultas (inquiries) de usuarios interesados.
21. Crear cliente (CRUD cliente).
22. Editar información del cliente.
23. Eliminar cliente.
24. Buscar cliente por documento o nombre.
25. Registrar relaciones cliente-propiedad (interested, owner, tenant).
26. Asignar propiedades a clientes mediante relaciones.
27. Crear contratos para inquilinos (rental) y compradores (sale).
28. Generar pagos y cronograma para contratos.
29. Registrar pagos y marcar pagos como pagados.
30. Gestionar tipo y estado de contrato (draft, active, expired).
31. Registrar inquilinos activos por propiedad.
32. Buscar contratos por cliente, propiedad o estado.
33. Crear y obtener comunicaciones (llamadas, emails) por cliente.
34. Generar y mostrar alertas/recordatorios para clientes.
35. Panel de estadísticas (dashboard) con métricas clave.
36. Asignar asesores a propiedades.
37. Listado y CRUD de asesores.
38. Ver foto y perfil de asesor.
39. Notificar a asesor de nuevas consultas/visitas.
40. Calendario de citas (vista mensual/semanal/día).
41. Crear cita para visita a propiedad.
42. Confirmar o cancelar citas.
43. Enviar recordatorios automáticos por email/SMS (opcional).
44. Reportar actividad reciente (timeline) por propiedad y cliente.
45. Importar propiedades desde CSV/planillas.
46. Exportar reportes (CSV/JSON) de propiedades y clientes.
47. Gestión de usuarios del sistema (alta, baja, roles).
48. Subir imágenes masivamente (bulk upload).
49. Validación de datos en formularios (cliente, propiedad, contrato).
50. Logs de operaciones críticas (crear, actualizar, eliminar).
51. Gestión de tokens/keys para integraciones externas.
52. Funcionamiento offline básico (cache de datos recientes) - opcional.
53. Mapa de geolocalización para propiedades.
54. Mostrar número de imágenes y navegación entre imágenes.
55. Permitir marcar propiedades como favoritas.
56. Filtrar por asesor asignado.
57. Auditoría de cambios (quién modificó qué y cuándo).
58. Subida y verificación de fotos de asesores.
59. Notificaciones internas en el panel (toasts, alerts).
60. Manejo de consentimientos y privacidad de datos.
61. Soporte para múltiples monedas (visualización) - opcional.
62. Internacionalización (i18n) para interfaz - opcional.
63. Roles con permisos finos por acción (crear, editar, eliminar).
64. Detección y manejo de duplicados (clientes, propiedades).
65. Herramienta de búsqueda avanzada (filtros compuestos).
66. Relación cliente-contrato con fechas y duración.
67. Validación y normalización de direcciones.
68. Capacidad de programar tareas/migraciones automáticas.
69. Gestión de backups y restauración básica de datos.
70. Registro y manejo de errores para soporte/telemetría.
71. Permitir comentarios y notas internas en propiedades.
72. Integración con sistema de almacenamiento (Supabase Storage).
73. Permitir re-asignar propiedades entre asesores.
74. Gestión de precios históricos por propiedad.
75. Interfaz para revisar historial de cambios por propiedad/cliente.
76. Etiquetado/categorías de propiedades.
77. Gestión de amenities (servicios) por propiedad.
78. Filtrado por disponibilidad de fecha para reservas.
79. Panel de control para operaciones masivas (bulk edit).
80. Capacidad de revertir cambios recientes (undo simple).

> Observación: los requisitos 52, 61, 62 son opcionales/avanzados y su implementación depende del roadmap.

---

## 4. Requerimientos No Funcionales (30+)

1. Código tipado con TypeScript en frontend y definiciones claras de tipos.
2. Arquitectura modular (componentes, servicios, lib).
3. Alta cobertura de pruebas unitarias (ideal >70%).
4. Linting y formateo consistente (ESLint, Prettier).
5. Build reproducible con `npm run build`.
6. Despliegue automatizado (CI) para `main`.
7. Seguridad en el backend: uso de roles/row-level security en Supabase.
8. Protección de claves y secretos mediante variables de entorno.
9. Logs de servidor y cliente (con niveles).
10. Respuesta de UI rápida (<200ms para cargas simples) en condiciones normales.
11. Soporte para navegadores modernos (Chrome, Edge, Firefox, Safari).
12. Gestión de errores amigable para el usuario (mensajes claros).
13. Accesibilidad básica (WCAG AA) para componentes críticos.
14. Almacenamiento de archivos eficiente (uso de Supabase Storage con límites).
15. Escalabilidad para la base de datos (índices en columnas de búsqueda).
16. Backup regular de la base de datos.
17. Monitorización y alertas (integración futura con Sentry/Datadog).
18. Manejo de concurrencia en operaciones críticas (locks o transacciones).
19. Internacionalización preparada (i18n) aunque no implementada en UI.
20. Compatibilidad con resoluciones móviles (responsive design).
21. Tolerancia a fallos en integraciones externas (reintentos/backoff).
22. Políticas de retención de datos y eliminación segura.
23. Rendimiento aceptable para listas grandes (virtualization/pagination).
24. Uso eficiente de memoria en el cliente (limpieza de listeners).
25. Dependencias actualizadas y escaneo de vulnerabilidades.
26. Documentación mínima de APIs y contratos de datos.
27. Procedimiento para migraciones de esquema y datos.
28. Control de versiones para entregas y migraciones.
29. Testing end-to-end para flujos críticos (opcional)
30. Latencia de consultas a Supabase optimizada con índices.
31. Configuración centralizada de límites y parámetros (feature flags).

---

## 5. Manual de Usuario (Guía rápida en Español)

Este manual cubre el flujo principal para administradores y asesores.

### 5.1. Inicio de sesión
1. Accede a la URL de la aplicación.
2. Ingresa tus credenciales (email/contraseña) o usa el sistema de autenticación configurado.
3. Si no tienes cuenta, contacta al administrador.

### 5.2. Dashboard
- El dashboard muestra métricas: total de propiedades, consultas, citas próx., y rendimiento de asesores.
- Usa filtros para acotar por rango de fechas o por asesor.

### 5.3. Gestión de Propiedades
- Para crear: botón "Crear Propiedad" → completa formulario → subir imágenes → guardar.
- Para editar: seleccionar propiedad → editar campos → guardar.
- Para eliminar: seleccionar propiedad → botón eliminar (confirmación requerida).
- Para cambiar estado: desde la tarjeta o detalle, seleccionar nuevo estado.
- Para liberar propiedad: desde el detalle/acción, usar "Liberar" (cerra contrato asociado).

### 5.4. Gestión de Clientes
- Crear cliente: botón "Crear Cliente" → completar datos personales → guardar.
- Asignar propiedades: seleccionar propiedades en el formulario de creación o desde el cliente.
- Crear contrato: si el cliente es inquilino/comprador, usar el botón "Crear Contrato" y completar fechas y montos.
- Consultas y comunicaciones: ver el historial desde la ficha del cliente.

### 5.5. Agenda y Citas
- Crear cita: en la vista de propiedades o en el calendario → seleccionar fecha/hora → asignar asesor.
- Confirmar/cancelar: desde detalles de la cita.
- Enviar recordatorio: si está habilitado, el sistema envía recordatorios automáticamente.

### 5.6. Asesores
- Ver lista de asesores, asignar propiedades y ver su perfil.
- Subir foto de asesor desde la ficha.

### 5.7. Importaciones y Migraciones
- Ejecutar scripts desde la carpeta raíz `migration_script.js` o `run_client_migration.js` según la migración.
- Ver README de migraciones para instrucciones detalladas.

### 5.8. Notas de Operaciones
- Antes de eliminar datos críticos, exporta un backup.
- Las acciones destructivas requieren confirmación.

---

## 6. Guía de Desarrollo Rápida

- Instalar dependencias: `npm install`
- Levantar ambiente de desarrollo: `npm run dev`
- Compilar para producción: `npm run build`
- Ejecutar linter: `npx eslint src`

Estructura importante:
- `src/pages` → rutas principales
- `src/components` → UI y modales
- `src/lib` → integraciones con Supabase y utilidades
- `src/types` → definiciones de tipos TypeScript

---

## 7. Pruebas y Calidad

- Recomendado: añadir pruebas unitarias con Jest/React Testing Library.
- End-to-end: Cypress o Playwright para flujos clave (crear propiedad, crear cliente, generar contrato).
- Configurar CI (GitHub Actions) para ejecutar linter y tests en cada PR.

---

## 8. Mantenimiento y Migraciones

- Mantener una carpeta `migration_scripts/` con scripts versionados.
- Cada cambio de schema requiere migración y rollout plan.

---

## 9. Troubleshooting (problemas comunes)

- Build falla: ejecutar `npx tsc --noEmit` y revisar errores de tipos.
- Problemas con imágenes: verificar permisos en Supabase Storage.
- Problemas de autenticación: revisar variables de entorno `SUPABASE_URL` y `SUPABASE_ANON_KEY`.

---

## 10. Próximos pasos recomendados

1. Añadir pruebas unitarias básicas.
2. Crear pipeline CI para lint/build/tests.
3. Implementar i18n (soporte multi-idioma) si se requiere.
4. Documentar API endpoints y contratos.
5. Añadir validaciones y guard rails para imports masivos.

---

## 11. Anexos

- Archivos de migración: `migration_script.js`, `run_client_migration.js`.
- Scripts de utilidades disponibles en la raíz.

---

Si quieres, puedo:
- Añadir un índice navegable con enlaces al README.
- Generar tickets (issues) con los 70 requisitos priorizados en el repositorio.
- Exportar este documento en español e inglés.

Fin del documento.
