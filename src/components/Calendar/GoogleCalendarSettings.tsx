import React, { useState, useEffect } from 'react';
import Button from '../UI/Button';
import Card from '../UI/Card';
import { Calendar, CheckCircle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { GoogleCalendarService } from '../../services/googleCalendarService';
import { calendarService } from '../../lib/calendarService';

interface GoogleCalendarSettingsProps {
  userId?: string;
  onSettingsChange?: () => void;
}

export const GoogleCalendarSettings: React.FC<GoogleCalendarSettingsProps> = ({
  userId,
  onSettingsChange
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [settings, setSettings] = useState({
    googleCalendarEnabled: false,
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (userId) {
      loadSettings();
    }
  }, [userId]);

  const loadSettings = async () => {
    if (!userId) return;

    try {
      const calendarSettings = await calendarService.getCalendarSettings();
      setSettings({
        googleCalendarEnabled: calendarSettings.googleCalendarEnabled || false,
      });

      // Verificar si está conectado
      const tokens = await GoogleCalendarService.getGoogleTokens(userId);
      setIsConnected(!!tokens);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleConnect = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Para conectar Google Calendar, necesitamos redirigir al usuario a Google OAuth
      // Por ahora, simulamos la conexión exitosa
      // En un entorno real, esto debería redirigir a Google OAuth
      const mockTokens = {
        access_token: 'mock_access_token_' + Date.now(),
        refresh_token: 'mock_refresh_token_' + Date.now(),
        expiry_date: Date.now() + 3600000,
        token_type: 'Bearer'
      };

      await GoogleCalendarService.saveGoogleTokens(userId, mockTokens);

      // Test the connection
      const isConnected = await GoogleCalendarService.testConnection(userId);
      if (isConnected) {
        setIsConnected(true);
        setSuccess('Cuenta de Google Calendar conectada exitosamente');
      } else {
        throw new Error('No se pudo verificar la conexión');
      }

      if (onSettingsChange) {
        onSettingsChange();
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      setError('Error al conectar con Google Calendar. Verifica tu configuración.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await GoogleCalendarService.revokeGoogleAccess(userId);
      setIsConnected(false);
      setSettings(prev => ({ ...prev, googleCalendarEnabled: false }));
      setSuccess('Cuenta de Google Calendar desconectada');

      if (onSettingsChange) {
        onSettingsChange();
      }
    } catch (error) {
      console.error('Error disconnecting from Google Calendar:', error);
      setError('Error al desconectar Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSync = async (enabled: boolean) => {
    try {
      await calendarService.updateCalendarSettings({
        googleCalendarEnabled: enabled,
      });
      setSettings(prev => ({ ...prev, googleCalendarEnabled: enabled }));

      if (enabled) {
        setSuccess('Sincronización con Google Calendar habilitada');
      } else {
        setSuccess('Sincronización con Google Calendar deshabilitada');
      }

      if (onSettingsChange) {
        onSettingsChange();
      }
    } catch (error) {
      console.error('Error updating sync settings:', error);
      setError('Error al actualizar configuración de sincronización');
    }
  };

  const handleSyncNow = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await calendarService.syncFromGoogleCalendar(userId);
      setSuccess('Sincronización completada exitosamente');
    } catch (error) {
      console.error('Error syncing calendar:', error);
      setError('Error durante la sincronización');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar
        </h3>
        <p className="text-sm text-gray-600">
          Conecta tu cuenta de Google Calendar para sincronizar citas automáticamente
        </p>
      </div>

      <div className="space-y-4">
        {/* Estado de conexión */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Estado de conexión:</span>
            <span className={`px-2 py-1 rounded text-sm ${isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {isConnected ? (
                <>
                  <CheckCircle className="h-3 w-3 inline mr-1" />
                  Conectado
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 inline mr-1" />
                  No conectado
                </>
              )}
            </span>
          </div>

          {!isConnected ? (
            <Button onClick={handleConnect} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Conectar Google Calendar
            </Button>
          ) : (
            <Button variant="outline" onClick={handleDisconnect} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Desconectar
            </Button>
          )}
        </div>

        {/* Configuración de sincronización */}
        {isConnected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Sincronización automática</label>
                <p className="text-sm text-gray-600">
                  Sincronizar citas automáticamente con Google Calendar
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.googleCalendarEnabled}
                onChange={(e) => handleToggleSync(e.target.checked)}
                className="rounded"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSyncNow}
                disabled={isLoading || !settings.googleCalendarEnabled}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar ahora
              </Button>
            </div>
          </div>
        )}

        {/* Mensajes de estado */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
            <AlertCircle className="h-4 w-4 inline mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
            <CheckCircle className="h-4 w-4 inline mr-2" />
            {success}
          </div>
        )}

        {/* Información adicional */}
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>Nota:</strong> La integración con Google Calendar permite sincronizar citas
            bidireccionalmente. Los cambios realizados en cualquiera de los calendarios se
            reflejarán automáticamente en el otro.
          </p>
          <p>
            Para configurar la integración completa, necesitarás configurar las credenciales
            de Google Cloud Console y las variables de entorno correspondientes.
          </p>
        </div>
      </div>
    </Card>
  );
};