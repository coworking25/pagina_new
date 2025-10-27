import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Mail, Eye, EyeOff, Copy, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import Modal from './UI/Modal';
import { createClientPortalCredentials, sendPortalCredentialsEmail } from '../lib/clientsApi';
import type { Client } from '../types/clients';

interface CreatePortalCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onSuccess: () => void;
}

const CreatePortalCredentialsModal: React.FC<CreatePortalCredentialsModalProps> = ({
  isOpen,
  onClose,
  client,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleCreateCredentials = async () => {
    setLoading(true);
    setError('');

    try {
      // Crear credenciales
      const result = await createClientPortalCredentials(Number(client.id));

      if (!result.success) {
        setError(result.error || 'Error al crear las credenciales');
        return;
      }

      const password = result.password!;
      setGeneratedPassword(password);

      // Intentar enviar email
      if (client.email) {
        const emailResult = await sendPortalCredentialsEmail(
          client.email,
          client.full_name,
          password
        );

        if (emailResult.success) {
          setEmailSent(true);
        } else {
          // Si falla el email, mostrar la contraseña para que el admin la copie
          console.warn('Email no enviado:', emailResult.error);
        }
      } else {
        // Si no hay email, mostrar la contraseña para copiar manualmente
        console.warn('Cliente sin email, no se puede enviar automáticamente');
      }

    } catch (err) {
      console.error('Error creando credenciales:', err);
      setError('Error inesperado al crear las credenciales');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copiando al portapapeles:', err);
    }
  };

  const handleClose = () => {
    setGeneratedPassword('');
    setEmailSent(false);
    setError('');
    setShowPassword(false);
    onClose();
    if (generatedPassword) {
      onSuccess();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Crear Acceso al Portal de Clientes">
      <div className="space-y-6">
        {/* Información del cliente */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Información del Cliente
          </h3>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Nombre:</strong> {client.full_name}</p>
            <p><strong>Email:</strong> {client.email}</p>
            <p><strong>Documento:</strong> {client.document_number}</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Credenciales generadas */}
        {generatedPassword && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Credenciales creadas exitosamente</span>
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraseña Temporal
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={generatedPassword}
                    readOnly
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                El cliente deberá cambiar esta contraseña en su primer inicio de sesión.
              </p>
            </div>

            {/* Estado del email */}
            {emailSent ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-800 dark:text-green-200">
                  Las credenciales han sido enviadas al email del cliente.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  No se pudo enviar el email automáticamente. Copia la contraseña y compártela manualmente con el cliente.
                </p>
              </div>
            )}

            {/* Instrucciones */}
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Instrucciones para el cliente:
              </h4>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>1. Ir a <strong>https://tu-dominio.com/cliente/login</strong></li>
                <li>2. Iniciar sesión con su email y la contraseña temporal</li>
                <li>3. Cambiar la contraseña inmediatamente</li>
                <li>4. Explorar su dashboard personal</li>
              </ol>
            </div>
          </motion.div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {!generatedPassword ? (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateCredentials}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Key className="w-4 h-4" />
                )}
                {loading ? 'Creando...' : 'Crear Credenciales'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CreatePortalCredentialsModal;