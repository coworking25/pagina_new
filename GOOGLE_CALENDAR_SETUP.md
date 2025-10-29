# Google Calendar Integration Setup
# =================================

Este documento explica cómo configurar la integración con Google Calendar.

## 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la Google Calendar API:
   - Ve a "APIs & Services" > "Library"
   - Busca "Google Calendar API"
   - Haz clic en "Enable"

## 2. Crear Credenciales OAuth 2.0

1. Ve a "APIs & Services" > "Credentials"
2. Haz clic en "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configura la pantalla de consentimiento:
   - User Type: External
   - App name: Tu App de Citas Inmobiliarias
   - User support email: tu-email@dominio.com
   - Developer contact: tu-email@dominio.com
4. Agrega scopes:
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/calendar.events`
5. Crea las credenciales OAuth 2.0
6. Configura los URIs autorizados:
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173/auth/google/callback`

## 3. Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# Google Calendar API
VITE_GOOGLE_CLIENT_ID=tu_client_id_aqui
VITE_GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

## 4. Configuración en Producción

Para producción, asegúrate de:

1. Cambiar los URIs autorizados a tu dominio de producción
2. Configurar las variables de entorno en tu servidor
3. Verificar que la app esté en "Production" status en Google Cloud Console

## 5. Funcionalidades Implementadas

- ✅ Conexión OAuth 2.0 con Google
- ✅ Sincronización automática de eventos
- ✅ Creación automática de eventos al agendar citas
- ✅ Detección de conflictos de horario
- ✅ Interfaz de usuario para gestionar la conexión
- ✅ Manejo de errores y estados de carga

## 6. Uso en el Código

```typescript
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';

const MyComponent = () => {
  const {
    isAuthenticated,
    connect,
    disconnect,
    createAppointmentEvent
  } = useGoogleCalendar();

  // Conectar
  const handleConnect = () => connect();

  // Crear evento cuando se agenda una cita
  const handleAppointmentCreated = async (appointmentData) => {
    if (isAuthenticated) {
      await createAppointmentEvent(appointmentData);
    }
  };
};
```

## 7. Seguridad

- Los tokens se almacenan localmente (en producción usar httpOnly cookies)
- Los scopes están limitados solo a Calendar
- La autenticación usa PKCE flow
- Los errores no exponen información sensible

## 8. Troubleshooting

### Error: "popup blocked"
- Asegúrate de que los popups estén habilitados en el navegador

### Error: "invalid_client"
- Verifica que el CLIENT_ID sea correcto
- Asegúrate de que los URIs autorizados estén configurados

### Error: "access_denied"
- El usuario canceló la autenticación
- Verifica los scopes requeridos

### Error: "invalid_grant"
- El código de autorización expiró
- Intenta la autenticación nuevamente