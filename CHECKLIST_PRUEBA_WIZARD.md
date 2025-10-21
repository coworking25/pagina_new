# ✅ CHECKLIST - PRUEBA DEL WIZARD MEJORADO

**Fecha:** 20 de Octubre, 2025  
**Estado:** 🔧 Listo para probar  
**Objetivo:** Verificar que el Wizard guarde TODA la información

---

## 🚀 PREPARACIÓN

### ✅ PASO 1: Abrir la aplicación
- [ ] Navegador abierto en: `http://localhost:5174/admin/clients`
- [ ] Consola del navegador abierta (F12 → Tab "Console")
- [ ] Consola limpia (click en 🚫 para limpiar logs anteriores)

---

## 📝 PASO 2: CREAR CLIENTE CON WIZARD

### Click en "Nuevo Cliente" (+)

Deberías ver el Wizard con 7 pasos.

---

### 🔹 PASO 1/7 - INFORMACIÓN BÁSICA

Llena estos campos (TODOS OBLIGATORIOS):

```
✅ Nombre completo: Juan Pérez González
✅ Tipo de documento: DNI
✅ Número de documento: 12345678
✅ Teléfono: +51 987654321
✅ Email: juan.perez@example.com
✅ Dirección: Av. Principal 123, Dpto 45
✅ Ciudad: Lima
✅ Tipo de cliente: Inquilino
✅ Estado: Activo
```

**Contacto de emergencia (OPCIONAL):**
```
Nombre: María Pérez
Teléfono: +51 912345678
```

- [ ] Todos los campos llenados
- [ ] Click en "Siguiente" →

---

### 🔹 PASO 2/7 - INFORMACIÓN FINANCIERA

```
✅ Ingresos mensuales: 5000
✅ Ocupación: Ingeniero de Software
✅ Empresa: Tech Company SAC
```

**Notas (OPCIONAL):**
```
Cliente referido por María López. 
Buen historial crediticio.
```

- [ ] Campos llenados
- [ ] Click en "Siguiente" →

---

### 🔹 PASO 3/7 - DOCUMENTOS (OPCIONAL)

**Puedes saltar este paso por ahora**

- [ ] Click en "Siguiente" → (sin subir documentos)

---

### 🔹 PASO 4/7 - CREDENCIALES DEL PORTAL ⚠️ IMPORTANTE

```
✅ Email del portal: juan.perez@example.com (mismo del paso 1)
✅ Contraseña: Test123456!
☑️ Habilitar acceso al portal: CHECKED
☑️ Enviar email de bienvenida: CHECKED
```

- [ ] Email ingresado
- [ ] Contraseña ingresada (mínimo 8 caracteres)
- [ ] Ambos checkboxes marcados ✓
- [ ] Click en "Siguiente" →

---

### 🔹 PASO 5/7 - REFERENCIAS (OPCIONAL)

**Referencias Personales:**
```
Referencia #1:
  Nombre: Carlos Sánchez
  Teléfono: +51 999888777
  Relación: Amigo
  
Referencia #2:
  Nombre: Ana Torres
  Teléfono: +51 988777666
  Relación: Familiar
```

**Referencias Comerciales:**
```
Referencia #1:
  Nombre: Banco de Crédito
  Teléfono: +51 800-1234
  Relación: Entidad Bancaria
```

- [ ] Al menos 1 referencia personal agregada
- [ ] Al menos 1 referencia comercial agregada
- [ ] Click en "Siguiente" →

---

### 🔹 PASO 6/7 - INFORMACIÓN DEL CONTRATO ⚠️ IMPORTANTE

```
✅ Tipo de contrato: Arrendamiento
✅ Fecha de inicio: (selecciona HOY)
✅ Fecha de fin: (selecciona dentro de 1 año)
✅ Duración: 12 meses
✅ Monto del depósito: 2500
☑️ Depósito pagado: CHECKED
☑️ Requiere aval: CHECKED

Información del Aval:
  Nombre: Roberto Pérez
  Documento: 87654321
  Teléfono: +51 955444333
```

- [ ] Fechas de contrato ingresadas
- [ ] Monto del depósito ingresado
- [ ] Información del aval completa
- [ ] Click en "Siguiente" →

---

### 🔹 PASO 7/7 - ASIGNAR PROPIEDADES (OPCIONAL)

**Si tienes propiedades en el sistema:**
- [ ] Selecciona al menos 1 propiedad
- [ ] Click en "Crear Cliente" ✅

**Si NO tienes propiedades:**
- [ ] Solo click en "Crear Cliente" ✅

---

## 🔍 VERIFICACIÓN EN LA CONSOLA

Después de hacer click en "Crear Cliente", deberías ver en la consola:

```
==============================================
🧙‍♂️ INICIANDO CREACIÓN DE CLIENTE DESDE WIZARD
==============================================
📋 DATOS COMPLETOS RECIBIDOS: { ... }

📝 PASO 1: Creando cliente base...
   → Datos a guardar: { ... }
   ✅ Cliente creado exitosamente ID: XXX

🔑 PASO 2: Verificando credenciales del portal...
   → Email: juan.perez@example.com
   → Password: ****** (existe)
   ✅ Credenciales del portal creadas

📄 PASO 3: Verificando documentos...
   → Total documentos a subir: 0
   ⚠️ No hay documentos para subir

💰 PASO 4: Verificando configuración de pagos...
   ...

👥 PASO 5: Verificando referencias...
   → Referencias personales: 2
   → Referencias comerciales: 1
   ✅ Referencias guardadas (3 total)

📑 PASO 6: Verificando información del contrato...
   ✅ Información del contrato guardada

🏠 PASO 7: Verificando propiedades asignadas...
   ...

==============================================
📊 RESUMEN DE GUARDADO
==============================================
Cliente:       ✅ ID: XXX
Credenciales:  ✅ Email: juan.perez@example.com
Documentos:    ⚠️ 0/0
Pagos:         ???
Referencias:   ✅ P:2 C:1
Contrato:      ✅
Propiedades:   ???
==============================================
```

---

## 📊 RESULTADO ESPERADO

### ✅ **ESCENARIO IDEAL:**

Alert que dice:
```
✅ Cliente creado exitosamente con TODOS los datos!

📊 Resumen:
- Cliente: ✅ Creado
- Credenciales: ✅ Configuradas
- Documentos: ✅ 0 subidos
- Pagos: ✅ Configurados
- Referencias: ✅ 3 agregadas
- Contrato: ✅ Configurado
- Propiedades: ✅ X asignadas
```

### ⚠️ **ESCENARIO CON ADVERTENCIAS:**

Alert que dice:
```
⚠️ Cliente creado con algunas advertencias

✅ Guardado exitosamente (X/7 secciones)

⚠️ Secciones con advertencias:
- Configuración de pagos no guardada
- Propiedades no asignadas
```

**Esto es NORMAL** si no configuraste pagos o no asignaste propiedades.

### ❌ **ESCENARIO CON ERROR:**

Alert que dice:
```
❌ Error crítico al crear el cliente:
[mensaje de error]
```

**En este caso:** Copia TODO el error de la consola.

---

## 📸 EVIDENCIA

Toma capturas de pantalla de:

1. **La consola completa** con todos los logs (scroll hasta arriba)
2. **El resumen final** en la consola
3. **El alert** que aparece
4. **La lista de clientes** con el nuevo cliente agregado

---

## 📝 REPORTE

Copia y pega esto en tu respuesta:

```
✅ REPORTE DE PRUEBA DEL WIZARD

1. ¿El wizard se completó sin errores?
   [ ] Sí   [ ] No

2. ¿Qué dice el ALERT final?
   (Copia aquí el texto completo)

3. ¿Cuántos ✅ aparecen en el RESUMEN de la consola?
   ____ de 7 posibles

4. ¿Qué secciones tienen ⚠️ advertencias?
   [ ] Cliente
   [ ] Credenciales
   [ ] Documentos
   [ ] Pagos
   [ ] Referencias
   [ ] Contrato
   [ ] Propiedades

5. ¿Hay algún ❌ ERROR?
   [ ] No hay errores
   [ ] Sí, hay errores (copia el error abajo):

   [Pega aquí el error completo de la consola]

6. ¿El nuevo cliente aparece en la lista?
   [ ] Sí   [ ] No

7. Observaciones adicionales:
   [Cualquier cosa que notes]
```

---

## 🎯 SIGUIENTE PASO

Según los resultados:

- **Si todo está ✅:** Pasamos al siguiente problema
- **Si hay ⚠️:** Analizamos qué secciones no se guardan y por qué
- **Si hay ❌:** Debuggeamos el error específico

---

**¡LISTO PARA PROBAR!** 🚀

Sigue el checklist paso a paso y luego repórtame los resultados.

---

**Creado por:** GitHub Copilot  
**Fecha:** 20 de Octubre, 2025
