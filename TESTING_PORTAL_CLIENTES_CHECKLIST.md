# 🧪 TESTING E2E - PORTAL DE CLIENTES
## Checklist Completo de Validación

**Fecha:** 19 de Diciembre, 2025  
**Usuario de Prueba:** Carlos (carlos.propietario@test.com)  
**Contraseña:** La que ya está configurada en el sistema

---

## 📋 INSTRUCCIONES GENERALES

1. **Abre la consola del navegador** (F12) para ver errores
2. **Prueba en modo escritorio y móvil** (responsive)
3. **Marca ✅ lo que funciona y ❌ lo que falla**
4. **Anota cualquier comportamiento extraño**

---

## 1️⃣ LOGIN Y AUTENTICACIÓN

### Test 1.1: Login Exitoso
- [ ] Ir a `/login`
- [ ] Seleccionar "Cliente" en el selector
- [ ] Ingresar: `carlos.propietario@test.com`
- [ ] Ingresar contraseña correcta
- [ ] Click en "Iniciar Sesión"
- [ ] ✅ **Esperado:** Redirige a `/cliente/dashboard`
- [ ] ✅ **Esperado:** Muestra nombre "Carlos" en topbar

**Resultado:** _______________  
**Errores en consola:** _______________

---

### Test 1.2: Login con Credenciales Incorrectas
- [ ] Intentar login con contraseña incorrecta
- [ ] ✅ **Esperado:** Mensaje de error "Credenciales inválidas"
- [ ] ✅ **Esperado:** No redirige, permanece en login

**Resultado:** _______________

---

### Test 1.3: Persistencia de Sesión
- [ ] Hacer login exitoso
- [ ] Refrescar la página (F5)
- [ ] ✅ **Esperado:** Sigue autenticado, no redirige a login
- [ ] Cerrar pestaña y reabrir
- [ ] ✅ **Esperado:** Sesión persiste (localStorage)

**Resultado:** _______________

---

## 2️⃣ DASHBOARD (ClientDashboard.tsx)

### Test 2.1: Carga de Datos
- [ ] Acceder a `/cliente/dashboard`
- [ ] ✅ **Esperado:** Muestra loading spinner inicial
- [ ] ✅ **Esperado:** Carga datos en menos de 3 segundos
- [ ] ✅ **Esperado:** No hay errores en consola

**Resultado:** _______________  
**Tiempo de carga:** _______ segundos

---

### Test 2.2: Métricas Principales
Verificar que se muestran las 4 tarjetas:

- [ ] 💰 **Pagos Pendientes**
  - Muestra cantidad: _______
  - Muestra monto: $_______ COP

- [ ] ⏰ **Pagos Vencidos**
  - Muestra cantidad: _______
  - Muestra monto: $_______ COP

- [ ] 📅 **Próximo Pago**
  - Muestra fecha: _______
  - Muestra monto: $_______ COP

- [ ] 💸 **Pagado Este Año**
  - Muestra monto: $_______ COP

**Resultado:** _______________

---

### Test 2.3: Gráficas de Analytics
Verificar 4 gráficas:

- [ ] **Gráfica de Barras** (Pagos Mensuales)
  - ✅ Se visualiza correctamente
  - ✅ Muestra últimos 12 meses
  - ✅ Hover muestra valores

- [ ] **Gráfica de Línea** (Tendencia)
  - ✅ Se visualiza correctamente
  - ✅ Línea conectada

- [ ] **Gráfica de Pie** (Distribución)
  - ✅ Se visualiza correctamente
  - ✅ Muestra porcentajes

- [ ] **Gráfica de Comparativa Anual**
  - ✅ Se visualiza correctamente
  - ✅ Muestra últimos 3 años

**Resultado:** _______________

---

### Test 2.4: Contratos Activos
- [ ] ✅ Muestra sección "Mis Contratos Activos"
- [ ] ✅ Muestra 2 contratos (CTR-2024-001, CTR-2025-002)
- [ ] ✅ Muestra alerta amarilla en CTR-2025-002 (expira pronto)
- [ ] Click en "Ver Detalles" de un contrato
- [ ] ✅ **Esperado:** Redirige a `/cliente/contratos`

**Resultado:** _______________

---

### Test 2.5: Accesos Rápidos
- [ ] Click en "Contratos" → Redirige a `/cliente/contratos`
- [ ] Click en "Pagos" → Redirige a `/cliente/pagos`
- [ ] Click en "Extractos" → Redirige a `/cliente/extractos`
- [ ] Click en "Documentos" → Redirige a `/cliente/documentos`
- [ ] Click en "Perfil" → Redirige a `/cliente/perfil`

**Resultado:** _______________

---

## 3️⃣ CONTRATOS (ClientContracts.tsx)

### Test 3.1: Vista de Contratos
- [ ] Acceder a `/cliente/contratos`
- [ ] ✅ Muestra 2 contratos en formato grid
- [ ] ✅ Contrato 1: CTR-2024-001 (badge verde "Activo")
- [ ] ✅ Contrato 2: CTR-2025-002 (banner amarillo "Expira en X días")

**Resultado:** _______________  
**Días restantes CTR-2025-002:** _______

---

### Test 3.2: Modal de Detalles - Contrato 1
- [ ] Click en "Ver Detalles" de CTR-2024-001
- [ ] ✅ Modal se abre con animación suave

**Información del Contrato:**
- [ ] Número: CTR-2024-001
- [ ] Estado: Activo (badge verde)
- [ ] Inicio: 01/01/2024
- [ ] Fin: 31/12/2024
- [ ] Duración: 12 meses

**Información Financiera:**
- [ ] Renta Mensual: $2,800,000 COP
- [ ] Depósito: $5,600,000 COP
- [ ] Administración: $180,000 COP

**Información del Propietario:**
- [ ] Nombre: María González Pérez
- [ ] Teléfono: +57 310 456 7890
- [ ] Email: maria.gonzalez.landlord@test.com

**Términos de Pago:**
- [ ] Día de pago: 5 de cada mes
- [ ] Mora: 1.5%

- [ ] Click en "Cerrar" → Modal se cierra

**Resultado:** _______________

---

### Test 3.3: Modal de Detalles - Contrato 2
- [ ] Click en "Ver Detalles" de CTR-2025-002
- [ ] ✅ Muestra banner amarillo "⚠️ Este contrato expira en X días"
- [ ] ✅ Todas las secciones visibles
- [ ] Fin: 15/01/2025 (debe estar próximo)

**Resultado:** _______________

---

### Test 3.4: Responsive Design
- [ ] Abrir DevTools (F12)
- [ ] Cambiar a vista móvil (iPhone, Android)
- [ ] ✅ Grid se convierte en columna única
- [ ] ✅ Modal se ajusta a pantalla pequeña
- [ ] ✅ Botones accesibles

**Resultado:** _______________

---

## 4️⃣ PAGOS (ClientPayments.tsx)

### Test 4.1: Lista de Pagos
- [ ] Acceder a `/cliente/pagos`
- [ ] ✅ Muestra estadísticas en 4 tarjetas
- [ ] ✅ Muestra lista de pagos

**Estadísticas:**
- [ ] Total Recibido: $_______ COP
- [ ] Pendientes: _______
- [ ] Vencidos: _______
- [ ] Promedio Mensual: $_______ COP

**Resultado:** _______________

---

### Test 4.2: Filtros de Pagos
- [ ] **Filtro por Estado:**
  - [ ] Seleccionar "Pagados" → Lista se actualiza
  - [ ] Seleccionar "Pendientes" → Lista se actualiza
  - [ ] Seleccionar "Vencidos" → Lista se actualiza
  - [ ] Volver a "Todos" → Muestra todos

- [ ] **Filtro por Periodo:**
  - [ ] Seleccionar "Este Mes" → Filtra correctamente
  - [ ] Seleccionar "Este Trimestre" → Filtra correctamente
  - [ ] Seleccionar "Este Año" → Filtra correctamente

- [ ] **Búsqueda:**
  - [ ] Escribir concepto de pago
  - [ ] ✅ Lista se filtra en tiempo real

**Resultado:** _______________

---

### Test 4.3: Vista de Calendario
- [ ] Click en "Ver Calendario"
- [ ] ✅ Cambia a vista de calendario mensual
- [ ] ✅ Pagos marcados en fechas
- [ ] ✅ Colores diferentes por estado (verde=pagado, rojo=vencido, amarillo=pendiente)
- [ ] Click en "Ver Lista" → Regresa a vista lista

**Resultado:** _______________

---

### Test 4.4: Detalles de Pago
- [ ] Click en un pago de la lista
- [ ] ✅ Se expande mostrando detalles
- [ ] ✅ Muestra fecha, monto, concepto, estado
- [ ] ✅ Botón "Descargar Comprobante" visible
- [ ] Click en "Descargar Comprobante"
  - **Si hay URL:** Descarga archivo
  - **Si no hay URL:** Muestra mensaje apropiado

**Resultado:** _______________

---

## 5️⃣ EXTRACTOS (ClientExtractos.tsx)

### Test 5.1: Lista de Extractos
- [ ] Acceder a `/cliente/extractos`
- [ ] ✅ Muestra estadísticas (Total Pagos, Completados, Pendientes, Total Pagado)
- [ ] ✅ Muestra lista de pagos históricos

**Estadísticas:**
- [ ] Total Pagos: _______
- [ ] Completados: _______
- [ ] Pendientes: _______
- [ ] Total Pagado: $_______ COP

**Resultado:** _______________

---

### Test 5.2: Filtros de Extractos
- [ ] **Búsqueda:**
  - [ ] Escribir código de propiedad
  - [ ] ✅ Lista se filtra

- [ ] **Fecha Desde:**
  - [ ] Seleccionar fecha inicial
  - [ ] ✅ Filtra pagos desde esa fecha

- [ ] **Fecha Hasta:**
  - [ ] Seleccionar fecha final
  - [ ] ✅ Filtra pagos hasta esa fecha

- [ ] **Filtro por Propiedad:**
  - [ ] Seleccionar propiedad del dropdown
  - [ ] ✅ Muestra solo pagos de esa propiedad

**Resultado:** _______________

---

### Test 5.3: Desglose de Pago
Si algún pago tiene desglose:
- [ ] ✅ Muestra sección "Desglose del Pago"
- [ ] ✅ Muestra: Monto Pagado (azul)
- [ ] ✅ Muestra: Administración (naranja, con signo -)
- [ ] ✅ Muestra: Comisión Agencia (morado, con signo -)
- [ ] ✅ Muestra: Monto al Propietario (verde, neto)
- [ ] ✅ Muestra nota explicativa

**Resultado:** _______________

---

### Test 5.4: Descarga de Extractos
- [ ] **Extracto Individual:**
  - [ ] Click en "Extracto" de un pago
  - [ ] ✅ Descarga archivo .txt con información
  - [ ] ✅ Archivo contiene: propiedad, fecha, monto, tipo, estado

- [ ] **Extracto Completo:**
  - [ ] Click en "Generar Extracto Completo" (botón superior)
  - [ ] ✅ Descarga archivo con todos los pagos filtrados
  - [ ] ✅ Archivo contiene totales y detalles

**Resultado:** _______________

---

## 6️⃣ DOCUMENTOS (ClientDocuments.tsx)

### Test 6.1: Lista de Documentos
- [ ] Acceder a `/cliente/documentos`
- [ ] ✅ Muestra estadísticas (Total, Por Expirar, Activos)
- [ ] ✅ Muestra lista de documentos si hay

**Estadísticas:**
- [ ] Total Documentos: _______
- [ ] Por Expirar: _______
- [ ] Activos: _______

**Resultado:** _______________  
**Nota:** Si no hay documentos, es normal (no se subieron en el test data)

---

### Test 6.2: Filtros de Documentos
- [ ] **Búsqueda:**
  - [ ] Escribir nombre de documento
  - [ ] ✅ Lista se filtra

- [ ] **Filtro por Tipo:**
  - [ ] Seleccionar tipo del dropdown
  - [ ] ✅ Muestra solo documentos de ese tipo

**Resultado:** _______________

---

### Test 6.3: Acciones de Documento (si hay documentos)
- [ ] **Ver Documento:**
  - [ ] Click en "Ver"
  - [ ] ✅ Abre en nueva pestaña o modal
  - [ ] ✅ URL firmada temporal funciona

- [ ] **Descargar Documento:**
  - [ ] Click en "Descargar"
  - [ ] ✅ Inicia descarga
  - [ ] ✅ Archivo se descarga correctamente

**Resultado:** _______________

---

### Test 6.4: Empty State
Si no hay documentos:
- [ ] ✅ Muestra icono y mensaje "No tienes documentos subidos"
- [ ] ✅ Diseño limpio y centrado

**Resultado:** _______________

---

## 7️⃣ PERFIL (ClientProfile.tsx)

### Test 7.1: Visualización de Perfil
- [ ] Acceder a `/cliente/perfil`
- [ ] ✅ Muestra sección "Información Personal"
- [ ] ✅ Muestra sección "Información Laboral"
- [ ] ✅ Muestra sección "Información de Cuenta"

**Información Personal (Solo Lectura):**
- [ ] Nombre Completo: _______
- [ ] Email: _______
- [ ] Tipo Documento: _______
- [ ] Número Documento: _______

**Información Personal (Editable):**
- [ ] Teléfono: _______
- [ ] Dirección: _______
- [ ] Ciudad: _______

**Contacto de Emergencia:**
- [ ] Nombre: _______
- [ ] Teléfono: _______

**Información Laboral:**
- [ ] Ocupación: _______
- [ ] Empresa: _______

**Resultado:** _______________

---

### Test 7.2: Edición de Perfil
- [ ] Click en "Editar Perfil"
- [ ] ✅ Campos editables se convierten en inputs
- [ ] ✅ Campos de solo lectura permanecen bloqueados

**Modificar Datos:**
- [ ] Cambiar teléfono a: +57 300 123 4567
- [ ] Cambiar dirección a: Calle 123 #45-67, Apto 101
- [ ] Cambiar ciudad a: Bogotá
- [ ] Click en "Guardar Cambios"
- [ ] ✅ Muestra mensaje "Perfil actualizado exitosamente"
- [ ] ✅ Datos persisten al refrescar página

**Resultado:** _______________

---

### Test 7.3: Validación de Formulario
- [ ] Click en "Editar Perfil"
- [ ] Borrar teléfono (dejar vacío)
- [ ] Click en "Guardar Cambios"
- [ ] ✅ Muestra error "Teléfono es requerido"
- [ ] ✅ No guarda cambios

**Resultado:** _______________

---

### Test 7.4: Cancelar Edición
- [ ] Click en "Editar Perfil"
- [ ] Modificar varios campos
- [ ] Click en "Cancelar"
- [ ] ✅ Vuelve a modo vista
- [ ] ✅ Cambios no guardados se descartan

**Resultado:** _______________

---

## 8️⃣ NAVEGACIÓN Y LAYOUT

### Test 8.1: Sidebar
- [ ] ✅ Sidebar visible en escritorio
- [ ] ✅ Todos los links visibles:
  - [ ] Dashboard
  - [ ] Contratos
  - [ ] Pagos
  - [ ] Extractos
  - [ ] Documentos
  - [ ] Perfil
  - [ ] Cambiar Contraseña

**Resultado:** _______________

---

### Test 8.2: Navegación entre Páginas
- [ ] Click en cada link del sidebar
- [ ] ✅ URL cambia correctamente
- [ ] ✅ Página se carga sin errores
- [ ] ✅ Link activo se resalta visualmente
- [ ] ✅ No hay flash de contenido

**Resultado:** _______________

---

### Test 8.3: Topbar
- [ ] ✅ Muestra nombre del cliente "Carlos"
- [ ] ✅ Muestra avatar o inicial
- [ ] Click en nombre/avatar
- [ ] ✅ Muestra menú dropdown
- [ ] ✅ Opción "Cerrar Sesión" visible

**Resultado:** _______________

---

### Test 8.4: Logout
- [ ] Click en "Cerrar Sesión"
- [ ] ✅ Redirige a `/login`
- [ ] ✅ Sesión eliminada (localStorage limpio)
- [ ] Intentar acceder a `/cliente/dashboard`
- [ ] ✅ Redirige a login (no autenticado)

**Resultado:** _______________

---

### Test 8.5: Responsive - Vista Móvil
- [ ] Cambiar a vista móvil (375px width)
- [ ] ✅ Sidebar se oculta
- [ ] ✅ Botón hamburguesa aparece
- [ ] Click en hamburguesa
- [ ] ✅ Sidebar se abre desde el lado
- [ ] Click fuera del sidebar
- [ ] ✅ Sidebar se cierra

**Resultado:** _______________

---

## 9️⃣ DARK MODE

### Test 9.1: Cambio de Tema
- [ ] Click en botón de tema (sol/luna)
- [ ] ✅ Cambia a modo oscuro
- [ ] ✅ Todos los colores se invierten correctamente
- [ ] ✅ Gráficas se adaptan al tema
- [ ] ✅ Contraste legible
- [ ] Click nuevamente
- [ ] ✅ Vuelve a modo claro

**Resultado:** _______________

---

### Test 9.2: Persistencia de Tema
- [ ] Activar modo oscuro
- [ ] Refrescar página (F5)
- [ ] ✅ Permanece en modo oscuro

**Resultado:** _______________

---

## 🔟 CAMBIAR CONTRASEÑA

### Test 10.1: Acceso a Cambio de Contraseña
- [ ] Click en "Cambiar Contraseña" en sidebar
- [ ] ✅ Muestra formulario de cambio de contraseña

**Resultado:** _______________

---

### Test 10.2: Validación de Contraseña
- [ ] Ingresar contraseña actual incorrecta
- [ ] ✅ Muestra error

- [ ] Ingresar contraseña nueva débil (menos de 8 caracteres)
- [ ] ✅ Muestra error de validación

- [ ] Ingresar confirmación diferente
- [ ] ✅ Muestra error "Las contraseñas no coinciden"

**Resultado:** _______________

---

### Test 10.3: Cambio Exitoso
- [ ] Ingresar contraseña actual correcta
- [ ] Ingresar contraseña nueva fuerte (mín 8 chars, mayúscula, número, símbolo)
- [ ] Confirmar contraseña
- [ ] Click en "Cambiar Contraseña"
- [ ] ✅ Muestra mensaje de éxito
- [ ] ✅ Redirige o limpia formulario

**Resultado:** _______________

---

## 1️⃣1️⃣ RENDIMIENTO Y UX

### Test 11.1: Tiempos de Carga
Medir tiempo de carga de cada página:
- [ ] Dashboard: _______ segundos
- [ ] Contratos: _______ segundos
- [ ] Pagos: _______ segundos
- [ ] Extractos: _______ segundos
- [ ] Documentos: _______ segundos
- [ ] Perfil: _______ segundos

**✅ Aceptable:** < 2 segundos  
**⚠️ Mejorar:** 2-5 segundos  
**❌ Lento:** > 5 segundos

---

### Test 11.2: Animaciones
- [ ] ✅ Transiciones suaves entre páginas
- [ ] ✅ Fade-in de componentes
- [ ] ✅ Hover effects en botones
- [ ] ✅ Loading spinners durante carga
- [ ] ✅ Sin animaciones que lageen

**Resultado:** _______________

---

### Test 11.3: Accesibilidad
- [ ] Navegar usando solo teclado (Tab, Enter, Esc)
- [ ] ✅ Todos los elementos accesibles
- [ ] ✅ Focus visible
- [ ] ✅ Modales se cierran con Esc

**Resultado:** _______________

---

## 1️⃣2️⃣ ERRORES Y EDGE CASES

### Test 12.1: Conexión Lenta
- [ ] Throttling en DevTools (Slow 3G)
- [ ] Navegar entre páginas
- [ ] ✅ Loading states visibles
- [ ] ✅ No se rompe la UI

**Resultado:** _______________

---

### Test 12.2: Sin Datos
- [ ] Si no hay pagos/documentos
- [ ] ✅ Muestra empty state apropiado
- [ ] ✅ Mensaje claro y útil

**Resultado:** _______________

---

### Test 12.3: Errores de Supabase
- [ ] Desconectar internet brevemente
- [ ] Intentar cargar datos
- [ ] ✅ Muestra error amigable
- [ ] ✅ Botón "Reintentar" visible
- [ ] Reconectar y hacer click en "Reintentar"
- [ ] ✅ Datos se cargan correctamente

**Resultado:** _______________

---

## 📊 RESUMEN FINAL

### Funcionalidades Probadas
- [ ] Login y Autenticación (3 tests)
- [ ] Dashboard (5 tests)
- [ ] Contratos (4 tests)
- [ ] Pagos (4 tests)
- [ ] Extractos (4 tests)
- [ ] Documentos (4 tests)
- [ ] Perfil (4 tests)
- [ ] Navegación y Layout (5 tests)
- [ ] Dark Mode (2 tests)
- [ ] Cambiar Contraseña (3 tests)
- [ ] Rendimiento y UX (3 tests)
- [ ] Errores y Edge Cases (3 tests)

**Total Tests:** 44

---

### Estadísticas
- ✅ **Exitosos:** _______ / 44
- ❌ **Fallidos:** _______ / 44
- ⚠️ **Con Issues:** _______ / 44

**Porcentaje de Éxito:** _______%

---

### 🐛 BUGS ENCONTRADOS

| # | Página | Descripción | Severidad | Error en Consola |
|---|--------|-------------|-----------|------------------|
| 1 |        |             | 🔴/🟡/🟢  |                  |
| 2 |        |             | 🔴/🟡/🟢  |                  |
| 3 |        |             | 🔴/🟡/🟢  |                  |
| 4 |        |             | 🔴/🟡/🟢  |                  |
| 5 |        |             | 🔴/🟡/🟢  |                  |

**Severidad:**
- 🔴 **Crítico:** Bloquea funcionalidad principal
- 🟡 **Medio:** Afecta UX pero no bloquea
- 🟢 **Menor:** Cosmético o edge case

---

### 💡 MEJORAS SUGERIDAS

1. _______________________________________
2. _______________________________________
3. _______________________________________
4. _______________________________________
5. _______________________________________

---

### ✅ CONCLUSIÓN

**Estado General del Portal:**
- [ ] 🟢 **LISTO PARA PRODUCCIÓN** (>90% exitoso, sin bugs críticos)
- [ ] 🟡 **REQUIERE AJUSTES** (70-90% exitoso, bugs medios)
- [ ] 🔴 **NECESITA TRABAJO** (<70% exitoso, bugs críticos)

**Comentarios Finales:**
_______________________________________
_______________________________________
_______________________________________

---

**Probado por:** _______________  
**Fecha:** 19 de Diciembre, 2025  
**Navegador:** _______________  
**Versión:** _______________
