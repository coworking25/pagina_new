import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Button from '../UI/Button';
import { requestPasswordReset } from '../../lib/supabase';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico');
      setIsLoading(false);
      return;
    }
    
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      setIsLoading(false);
      return;
    }

    try {
      await requestPasswordReset(email);
      setSuccess(true);
      
      // Cerrar modal después de 5 segundos
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setEmail('');
      }, 5000);
      
    } catch (error: any) {
      console.error('Error solicitando reset:', error);
      setError(
        error.message || 
        'No se pudo enviar el correo. Verifica que tu email esté registrado.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmail('');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">¿Olvidaste tu contraseña?</h2>
                    <p className="text-blue-100 text-sm mt-1">
                      No te preocupes, te ayudaremos a recuperarla
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {success ? (
                  // Success State
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-6"
                  >
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      ¡Correo enviado!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Hemos enviado un enlace de recuperación a:
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-4">
                      {email}
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300">
                      <p className="font-medium mb-2">📧 Revisa tu correo</p>
                      <p>
                        Haz clic en el enlace que te enviamos para restablecer tu contraseña.
                        El enlace expirará en 1 hora.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  // Form State
                  <>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Ingresa tu correo electrónico y te enviaremos un enlace para 
                      restablecer tu contraseña.
                    </p>

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Email Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Correo Electrónico
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setError('');
                            }}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="tu@email.com"
                            disabled={isLoading}
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Info Box */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
                        <p className="font-medium mb-1">💡 Importante:</p>
                        <ul className="space-y-1 ml-4 list-disc">
                          <li>Revisa tu bandeja de spam si no ves el correo</li>
                          <li>El enlace será válido por 1 hora</li>
                          <li>Solo se puede usar una vez</li>
                        </ul>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleClose}
                          disabled={isLoading}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading || !email.trim()}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Enviando...
                            </div>
                          ) : (
                            'Enviar enlace'
                          )}
                        </Button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;
