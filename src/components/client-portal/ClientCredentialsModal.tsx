import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Key, Mail, Copy, Check, Eye, EyeOff, Shield, AlertCircle, Trash2 } from 'lucide-react';
import {
  createClientCredentials,
  hasClientCredentials,
  getClientCredentials,
  toggleClientAccess,
  resetClientPassword,
  deleteClientCredentials
} from '../../lib/adminClientCredentials';
import type { Client } from '../../types/clients';
import Button from '../UI/Button';

interface ClientCredentialsModalProps {
  client: Client;
  onClose: () => void;
}

const ClientCredentialsModal: React.FC<ClientCredentialsModalProps> = ({ client, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customEmail, setCustomEmail] = useState(client.email || '');

  useEffect(() => {
    loadCredentials();
  }, [client.id]);

  const loadCredentials = async () => {
    setLoading(true);
    setError('');
    
    const exists = await hasClientCredentials(client.id);
    setHasCredentials(exists);

    if (exists) {
      const response = await getClientCredentials(client.id);
      if (response.success && response.data) {
        setCredentials(response.data);
        setCustomEmail(response.data.email);
      }
    } else {
      setCustomEmail(client.email || '');
    }

    setLoading(false);
  };

  const handleCreateCredentials = async () => {
    if (!customEmail.trim()) {
      setError('El email es requerido');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const response = await createClientCredentials(client.id, customEmail);

    if (response.success && response.data) {
      setGeneratedPassword(response.data.password);
      setSuccess('¡Credenciales creadas exitosamente!');
      setHasCredentials(true);
      await loadCredentials();
    } else {
      setError(response.error || 'Error al crear credenciales');
    }

    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!confirm('¿Estás seguro de restablecer la contraseña? Se generará una nueva contraseña temporal.')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const response = await resetClientPassword(client.id);

    if (response.success && response.data) {
      setGeneratedPassword(response.data.password);
      setSuccess('¡Contraseña restablecida exitosamente!');
      await loadCredentials();
    } else {
      setError(response.error || 'Error al restablecer contraseña');
    }

    setLoading(false);
  };

  const handleToggleAccess = async () => {
    const newStatus = !credentials.is_active;
    const action = newStatus ? 'activar' : 'desactivar';

    if (!confirm(`¿Estás seguro de ${action} el acceso de este cliente?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const response = await toggleClientAccess(client.id, newStatus);

    if (response.success) {
      setSuccess(`Acceso ${action}do exitosamente`);
      await loadCredentials();
    } else {
      setError(response.error || `Error al ${action} acceso`);
    }

    setLoading(false);
  };

  const handleDeleteCredentials = async () => {
    if (!confirm('¿Estás seguro de eliminar las credenciales? El cliente no podrá acceder al portal.')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const response = await deleteClientCredentials(client.id);

    if (response.success) {
      setSuccess('Credenciales eliminadas exitosamente');
      setHasCredentials(false);
      setCredentials(null);
      setGeneratedPassword('');
    } else {
      setError(response.error || 'Error al eliminar credenciales');
    }

    setLoading(false);
  };

  const copyToClipboard = (text: string, type: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Acceso al Portal
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {client.full_name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Alertas */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-green-700 dark:text-green-300 text-sm">{success}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : !hasCredentials ? (
            /* Formulario de Creación */
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Este cliente aún no tiene acceso al portal. Crea sus credenciales para que pueda iniciar sesión.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email de Acceso
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="cliente@ejemplo.com"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  El cliente usará este email para iniciar sesión
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                  <strong>Nota:</strong> Se generará una contraseña temporal aleatoria
                </p>
                <ul className="text-xs text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
                  <li>La contraseña será de 12 caracteres</li>
                  <li>El cliente deberá cambiarla en el primer login</li>
                  <li>Podrás copiar la contraseña para enviarla al cliente</li>
                </ul>
              </div>

              <Button
                onClick={handleCreateCredentials}
                disabled={loading || !customEmail.trim()}
                className="w-full py-3 bg-green-600 hover:bg-green-700"
              >
                <Key className="w-5 h-5 mr-2" />
                Crear Credenciales
              </Button>
            </div>
          ) : (
            /* Panel de Gestión */
            <div className="space-y-6">
              {/* Estado */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Estado del Acceso
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Activo desde: {new Date(credentials.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    credentials.is_active
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {credentials.is_active ? 'Activo' : 'Desactivado'}
                  </span>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email de Acceso
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-mono text-sm">
                    {credentials.email}
                  </div>
                  <button
                    onClick={() => copyToClipboard(credentials.email, 'email')}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {copiedEmail ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Contraseña Generada */}
              {generatedPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contraseña Temporal
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-gray-900 dark:text-white font-mono text-sm">
                      {showPassword ? generatedPassword : '••••••••••••'}
                    </div>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(generatedPassword, 'password')}
                      className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {copiedPassword ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-400">
                    ⚠️ Copia esta contraseña y envíala al cliente de forma segura
                  </p>
                </div>
              )}

              {/* Información Adicional */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Último Login</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {credentials.last_login
                      ? new Date(credentials.last_login).toLocaleDateString('es-ES')
                      : 'Nunca'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cambiar Contraseña</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {credentials.must_change_password ? 'Requerido' : 'No requerido'}
                  </p>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-3">
                <Button
                  onClick={handleResetPassword}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Restablecer Contraseña
                </Button>
                <Button
                  onClick={handleToggleAccess}
                  className={`flex-1 ${
                    credentials.is_active
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {credentials.is_active ? 'Desactivar' : 'Activar'} Acceso
                </Button>
              </div>

              <Button
                onClick={handleDeleteCredentials}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar Credenciales
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ClientCredentialsModal;
