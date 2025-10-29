/**
 * Google Auth Callback Page
 *
 * PROPOSITO: Manejar el callback de OAuth de Google Calendar
 * - Procesar código de autorización
 * - Mostrar resultado de autenticación
 * - Redirigir al usuario de vuelta
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { googleCalendarService } from '../services/googleCalendar';

const GoogleAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage('La autenticación fue cancelada o falló');
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('Código de autorización no encontrado');
        return;
      }

      try {
        // Intercambiar código por tokens
        await googleCalendarService.exchangeCodeForTokens(code);

        setStatus('success');
        setMessage('¡Conexión exitosa con Google Calendar!');

        // Notificar a la ventana padre (popup)
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_SUCCESS',
            code
          }, window.location.origin);
        }

        // Cerrar popup después de 2 segundos
        setTimeout(() => {
          window.close();
        }, 2000);

      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Error al procesar la autenticación');

        // Notificar error a la ventana padre
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: error.message
          }, window.location.origin);
        }
      }
    };

    handleCallback();
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="w-12 h-12 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          {getStatusIcon()}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`text-2xl font-bold mb-4 ${getStatusColor()}`}
        >
          {status === 'loading' && 'Procesando autenticación...'}
          {status === 'success' && '¡Conexión exitosa!'}
          {status === 'error' && 'Error de autenticación'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-gray-600 dark:text-gray-400 mb-6"
        >
          {message}
        </motion.p>

        {status === 'success' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-gray-500 dark:text-gray-500"
          >
            Esta ventana se cerrará automáticamente...
          </motion.p>
        )}

        {status === 'error' && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            onClick={() => window.close()}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default GoogleAuthCallback;