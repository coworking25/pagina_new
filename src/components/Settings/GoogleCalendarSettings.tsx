/**
 * Google Calendar Settings Component
 *
 * PROPOSITO: Componente para gestionar la integración con Google Calendar
 * - Conectar/desconectar cuenta
 * - Mostrar estado de sincronización
 * - Configurar calendarios
 * - Ver logs de sincronización
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Link,
  Unlink,
  Clock,
  Users,
  Zap
} from 'lucide-react';
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';
import Button from '../UI/Button';

interface GoogleCalendarSettingsProps {
  advisorId?: string;
  onSyncComplete?: (result: any) => void;
}

const GoogleCalendarSettings: React.FC<GoogleCalendarSettingsProps> = ({
  advisorId,
  onSyncComplete
}) => {
  const {
    isAuthenticated,
    isLoading,
    error,
    calendars,
    lastSync,
    syncResult,
    connect,
    disconnect,
    syncEvents,
    refreshCalendars
  } = useGoogleCalendar();

  const [isSyncing, setIsSyncing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Auto-sync cuando se conecta por primera vez
  useEffect(() => {
    if (isAuthenticated && advisorId && !lastSync) {
      handleSync();
    }
  }, [isAuthenticated, advisorId, lastSync]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
    }
  };

  const handleSync = async () => {
    if (!advisorId || !isAuthenticated) return;

    setIsSyncing(true);
    try {
      const result = await syncEvents(advisorId);
      onSyncComplete?.(result);
    } catch (error) {
      console.error('Error syncing events:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRefreshCalendars = async () => {
    await refreshCalendars();
  };

  const getStatusIcon = () => {
    if (error) return <XCircle className="w-5 h-5 text-red-500" />;
    if (isAuthenticated) return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <AlertCircle className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (error) return 'Error de conexión';
    if (isAuthenticated) return 'Conectado';
    return 'No conectado';
  };

  const getStatusColor = () => {
    if (error) return 'text-red-600 bg-red-50 border-red-200';
    if (isAuthenticated) return 'text-green-600 bg-green-50 border-green-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Google Calendar
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sincroniza tus citas automáticamente
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-500" />
        </motion.button>
      </div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-4 rounded-lg border ${getStatusColor()}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <p className="font-medium">{getStatusText()}</p>
              {lastSync && (
                <p className="text-sm opacity-75">
                  Última sincronización: {lastSync.toLocaleString('es-ES')}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isAuthenticated ? (
              <Button
                onClick={handleConnect}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Link className="w-4 h-4" />
                )}
                <span>Conectar</span>
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="flex items-center space-x-2"
                >
                  {isSyncing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>Sincronizar</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnect}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                >
                  <Unlink className="w-4 h-4" />
                  <span>Desconectar</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sync Results */}
      <AnimatePresence>
        {syncResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
          >
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-blue-700 dark:text-blue-300">
                Sincronización completada
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>{syncResult.syncedEvents} eventos sincronizados</span>
              </div>

              {syncResult.conflicts.length > 0 && (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span>{syncResult.conflicts.length} conflictos encontrados</span>
                </div>
              )}
            </div>

            {syncResult.errors.length > 0 && (
              <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded text-sm">
                <p className="text-yellow-700 dark:text-yellow-300">
                  {syncResult.errors.length} error(es) durante la sincronización
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Settings */}
      <AnimatePresence>
        {showAdvanced && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-4"
          >
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Configuración avanzada
              </h4>

              {/* Calendars List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Calendarios disponibles ({calendars.length})
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshCalendars}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1">
                  {calendars.map((calendar) => (
                    <div
                      key={calendar.id}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {calendar.summary}
                        </span>
                        {calendar.primary && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                            Principal
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sync Options */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Opciones de sincronización
                </h5>

                <div className="grid grid-cols-1 gap-3">
                  <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Crear eventos automáticamente
                      </span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Crear eventos en Google Calendar cuando se agenda una cita
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Sincronizar eventos existentes
                      </span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Importar eventos existentes del calendario para detectar conflictos
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Notificaciones push
                      </span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Recibir notificaciones cuando cambien los eventos
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features List */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Zap className="w-5 h-5 text-yellow-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Creación automática de eventos
          </span>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Users className="w-5 h-5 text-blue-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Sincronización bidireccional
          </span>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Clock className="w-5 h-5 text-green-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Detección de conflictos
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default GoogleCalendarSettings;