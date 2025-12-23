# =====================================================
# CONFIGURACIÓN DEL SISTEMA DE EMAILS
# =====================================================

## 1. OBTENER API KEY DE RESEND

1. Ve a https://resend.com y crea una cuenta
2. Ve a "API Keys" en el dashboard
3. Crea una nueva API key
4. Copia la key (empieza con "re_")

## 2. VERIFICAR DOMINIO (Importante)

**Opción A: Usar dominio de prueba de Resend**
- Resend te da un dominio temporal: onboarding@resend.dev
- Solo envía emails a tu propia dirección
- Perfecto para desarrollo

**Opción B: Verificar tu propio dominio (Producción)**
1. Ve a "Domains" en Resend
2. Añade tu dominio (ej: tucoworking.com)
3. Agrega los registros DNS que te indica:
   - MX record
   - TXT record (SPF)
   - DKIM record
4. Espera la verificación (puede tomar minutos/horas)
5. Una vez verificado, puedes enviar desde: notificaciones@tucoworking.com

## 3. CONFIGURAR VARIABLES DE ENTORNO

Copia estas variables a tu archivo `.env`:

```env
# Resend API Key (Obligatorio)
RESEND_API_KEY=re_TuApiKeyAqui

# Email del remitente (debe estar verificado en Resend)
EMAIL_FROM=notificaciones@tucoworking.com

# Nombre del remitente
EMAIL_FROM_NAME=Tu Coworking

# Email de soporte (para respuestas)
SUPPORT_EMAIL=soporte@tucoworking.com
SUPPORT_PHONE=+57 123 456 7890

# URLs del sitio (para links en emails)
SITE_URL=https://tucoworking.com
CLIENT_PORTAL_URL=https://tucoworking.com/cliente
ADMIN_PORTAL_URL=https://tucoworking.com/admin
```

## 4. INSTALAR DEPENDENCIAS

```bash
npm install resend
```

## 5. PROBAR EL SISTEMA

```typescript
import { sendTestEmail } from '@/lib/email';

// Enviar email de prueba
const result = await sendTestEmail('tu-email@example.com');
console.log(result);
```

## 6. INTEGRACIÓN CON AUTOMATIZACIÓN

El sistema de automatización ya está configurado para usar emails.
Las reglas que tienen `"send_email": true` enviarán emails automáticamente.

Para activar una regla para enviar emails:

```sql
UPDATE automation_rules 
SET actions = jsonb_set(
  actions,
  '{send_email}',
  'true'
)
WHERE name = 'Recordatorio de Pago - 7 días antes';
```

## 7. TESTING EN DESARROLLO

**Opción 1: Usar MailTrap**
- Crear cuenta en https://mailtrap.io
- Captura todos los emails sin enviarlos
- Perfecto para testing

**Opción 2: Usar Resend en modo desarrollo**
- Envía solo a tu email verificado
- No puedes enviar a otros emails sin verificar dominio

## 8. LÍMITES DE RESEND

**Plan Gratuito:**
- 100 emails/día
- 3,000 emails/mes
- Perfecto para testing y proyectos pequeños

**Plan Pagado:**
- Desde $20/mes
- 50,000 emails/mes
- Soporte prioritario

## 9. MONITOREO

Ver emails enviados en Resend Dashboard:
- Estado de entrega
- Emails abiertos
- Clicks en links
- Bounces y errores

## 10. TROUBLESHOOTING

**Error: "Invalid API key"**
- Verifica que RESEND_API_KEY está en .env
- La key debe empezar con "re_"

**Error: "Domain not verified"**
- Verifica tu dominio en Resend
- O usa el dominio de prueba: onboarding@resend.dev

**Emails no llegan**
- Revisa carpeta de spam
- Verifica que el destinatario existe
- Chequea logs en Resend Dashboard

**Error: "Daily limit exceeded"**
- Has alcanzado el límite de 100 emails/día
- Espera 24 horas o actualiza tu plan
