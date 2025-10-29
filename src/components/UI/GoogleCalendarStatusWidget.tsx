/**
 * Google Calendar Status Widget
 *
 * PROPOSITO: Widget compacto para mostrar el estado de Google Calendar
 * - Indicador visual de conexión
 * - Botón rápido para conectar/desconectar
 * - Información de última sincronización
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, AlertCircle, Link, Unlink } from 'lucide-react';
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';

interface GoogleCalendarStatusWidgetProps {
  compact?: boolean;
  showLastSync?: boolean;
}

const GoogleCalendarStatusWidget: React.FC<GoogleCalendarStatusWidgetProps> = ({
  compact = false,
  showLastSync = true
}) => {
  const {
    isAuthenticated,
    isLoading,
    error,
    lastSync,
    connect,
    disconnect
  } = useGoogleCalendar();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
    }
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="relative">
          <Calendar className="w-4 h-4 text-gray-500" />
          {isAuthenticated && (
            <CheckCircle className="w-3 h-3 text-green-500 absolute -top-1 -right-1 bg-white dark:bg-gray-800 rounded-full" />
          )}
        </div>

        {!isAuthenticated ? (
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Conectar Calendar
          </button>
        ) : (
          <div className="flex items-center space-x-1">
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              Conectado
            </span>
            <button
              onClick={disconnect}
              className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Unlink className="w-3 h-3" />
            </button>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              Google Calendar
            </h4>
            <div className="flex items-center space-x-2 mt-1">
              {isAuthenticated ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Conectado
                  </span>
                </>
              ) : error ? (
                <>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600 dark:text-red-400">
                    Error de conexión
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600 dark:text-yellow-400">
                    No conectado
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2">
          {!isAuthenticated ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleConnect}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Link className="w-4 h-4" />
              <span>Conectar</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={disconnect}
              className="flex items-center space-x-2 px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Unlink className="w-4 h-4" />
              <span>Desconectar</span>
            </motion.button>
          )}

          {showLastSync && lastSync && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Última sync: {lastSync.toLocaleDateString('es-ES')}
            </p>
          )}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
};

export default GoogleCalendarStatusWidget;