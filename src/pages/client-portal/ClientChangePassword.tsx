import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { getSession, clearSession, updateSessionPasswordStatus } from '../../lib/client-portal/clientAuth';
import { supabase } from '../../lib/supabase';
import Button from '../../components/UI/Button';

const ClientChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [clientEmail, setClientEmail] = useState('');

  // Validaciones de contraseña
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  useEffect(() => {
    // Verificar sesión y si debe cambiar contraseña
    const session = getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    setClientEmail(session.email);
    
    // Verificar si debe cambiar contraseña
    checkMustChangePassword(session.client_id);
  }, [navigate]);

  const checkMustChangePassword = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_credentials')
        .select('must_change_password')
        .eq('client_id', clientId)
        .single();

      if (!error && data) {
        setMustChangePassword(data.must_change_password);
      }
    } catch (err) {
      console.error('Error checking password status:', err);
    }
  };

  // Validar contraseña en tiempo real
  useEffect(() => {
    const password = formData.newPassword;
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [formData.newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validaciones
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Todos los campos son obligatorios');
      setIsLoading(false);
      return;
    }

    // Verificar que la nueva contraseña cumpla requisitos
    const isPasswordValid = Object.values(passwordValidation).every(v => v);
    if (!isPasswordValid) {
      setError('La nueva contraseña no cumple con los requisitos de seguridad');
      setIsLoading(false);
      return;
    }

    // Verificar que las contraseñas coincidan
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      setIsLoading(false);
      return;
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    if (formData.currentPassword === formData.newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      setIsLoading(false);
      return;
    }

    try {
      const session = getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      // Verificar contraseña actual
      const bcrypt = await import('bcryptjs');
      
      const { data: credential, error: credError } = await supabase
        .from('client_credentials')
        .select('password_hash')
        .eq('client_id', session.client_id)
        .single();

      if (credError || !credential) {
        setError('Error al verificar credenciales');
        setIsLoading(false);
        return;
      }

      const currentPasswordMatch = await bcrypt.compare(
        formData.currentPassword,
        credential.password_hash
      );

      if (!currentPasswordMatch) {
        setError('La contraseña actual es incorrecta');
        setIsLoading(false);
        return;
      }

      // Hashear nueva contraseña
      const newPasswordHash = await bcrypt.hash(formData.newPassword, 10);

      // Actualizar contraseña
      const { error: updateError } = await supabase
        .from('client_credentials')
        .update({
          password_hash: newPasswordHash,
          must_change_password: false,
          failed_login_attempts: 0,
          locked_until: null,
          updated_at: new Date().toISOString()
        })
        .eq('client_id', session.client_id);

      if (updateError) {
        console.error('Error updating password:', updateError);
        setError('Error al actualizar la contraseña');
        setIsLoading(false);
        return;
      }

      // ✅ ACTUALIZAR SESIÓN EN LOCALSTORAGE
      updateSessionPasswordStatus(false);

      setSuccess('¡Contraseña actualizada exitosamente!');
      
      // Limpiar formulario
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        navigate('/cliente/dashboard');
      }, 2000);

    } catch (err: any) {
      console.error('Error changing password:', err);
      setError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    if (!mustChangePassword) {
      navigate('/cliente/dashboard');
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {mustChangePassword ? 'Cambiar Contraseña (Obligatorio)' : 'Cambiar Contraseña'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {mustChangePassword 
                ? 'Por seguridad, debes cambiar tu contraseña temporal'
                : 'Actualiza tu contraseña para mayor seguridad'
              }
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Usuario: {clientEmail}
            </p>
          </div>

          {/* Alerta de cambio obligatorio */}
          {mustChangePassword && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Acción requerida:</strong> Debes cambiar tu contraseña temporal antes de acceder al sistema.
              </div>
            </motion.div>
          )}

          {/* Mensajes */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-green-700 dark:text-green-300 text-sm">{success}</span>
            </motion.div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contraseña Actual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contraseña Actual
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ingresa tu contraseña actual"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Nueva Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ingresa tu nueva contraseña"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Requisitos de contraseña */}
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">La contraseña debe contener:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`text-xs flex items-center gap-1 ${passwordValidation.minLength ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidation.minLength ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      {passwordValidation.minLength && '✓'}
                    </div>
                    Mínimo 8 caracteres
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${passwordValidation.hasUpperCase ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidation.hasUpperCase ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      {passwordValidation.hasUpperCase && '✓'}
                    </div>
                    Una mayúscula
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${passwordValidation.hasLowerCase ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidation.hasLowerCase ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      {passwordValidation.hasLowerCase && '✓'}
                    </div>
                    Una minúscula
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${passwordValidation.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidation.hasNumber ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      {passwordValidation.hasNumber && '✓'}
                    </div>
                    Un número
                  </div>
                  <div className={`text-xs flex items-center gap-1 col-span-2 ${passwordValidation.hasSpecialChar ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidation.hasSpecialChar ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      {passwordValidation.hasSpecialChar && '✓'}
                    </div>
                    Un carácter especial (!@#$%^&*)
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Confirma tu nueva contraseña"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  Las contraseñas no coinciden
                </p>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              {!mustChangePassword && (
                <Button
                  type="button"
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading || !Object.values(passwordValidation).every(v => v)}
                className={`${mustChangePassword ? 'w-full' : 'flex-1'} bg-green-600 hover:bg-green-700`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Actualizando...
                  </div>
                ) : (
                  'Cambiar Contraseña'
                )}
              </Button>
            </div>
          </form>

          {/* Logout */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ClientChangePassword;
