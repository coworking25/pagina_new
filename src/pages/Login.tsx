import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, AlertCircle, Shield, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { clientLogin } from '../lib/client-portal/clientAuth';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import ForgotPasswordModal from '../components/Auth/ForgotPasswordModal';

interface LoginProps {
  onLoginSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState<'admin' | 'client'>('admin');
  const [hasInteracted, setHasInteracted] = useState(false); // Nuevo: track interacción del usuario
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // NO redirigir automáticamente - dar control al usuario
  // Solo redirigir si el usuario ya completó el formulario exitosamente
  useEffect(() => {
    // Permitir que el usuario vea la página de login y elija el tipo
    // No hacer redirect automático para prevenir confusión
    if (isAuthenticated && !authLoading && hasInteracted) {
      console.log('✅ Usuario autenticado después de login manual');
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }
  }, [isAuthenticated, authLoading, hasInteracted, onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setHasInteracted(true); // Marcar que el usuario interactuó

    // Validación de campos vacíos
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Por favor, completa todos los campos');
      setIsLoading(false);
      return;
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, ingresa un email válido');
      setIsLoading(false);
      return;
    }

    try {
      console.log(`🔐 Intentando login ${loginType} con:`, formData.email);
      
      if (loginType === 'client') {
        // Login de CLIENTE
        const response = await clientLogin({
          email: formData.email,
          password: formData.password
        });

        if (response.success && response.session) {
          console.log('✅ Login de cliente exitoso');
          
          // Verificar si debe cambiar contraseña
          if (response.must_change_password) {
            navigate('/cliente/cambiar-password');
          } else {
            navigate('/cliente/dashboard');
          }
        } else {
          setError(response.error || 'Error al iniciar sesión como cliente');
        }
      } else {
        // Login de ADMINISTRADOR
        await login(formData.email, formData.password);
        
        console.log('✅ Login de administrador exitoso');
        
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          navigate('/admin/dashboard');
        }
      }
      
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      setError(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Limpiar error al escribir
  };

  // Limpiar formulario al cambiar tipo de login
  const handleLoginTypeChange = (type: 'admin' | 'client') => {
    setLoginType(type);
    setFormData({ email: '', password: '' }); // Limpiar campos
    setError(''); // Limpiar errores
    setShowPassword(false); // Ocultar contraseña
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {loginType === 'admin' ? 'Panel de Administración' : 'Portal de Clientes'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Ingresa tus credenciales para acceder
            </p>
          </div>

          {/* Selector de Tipo de Usuario */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => handleLoginTypeChange('admin')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                loginType === 'admin'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-5 h-5" />
                Administrador
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleLoginTypeChange('client')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                loginType === 'client'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                Cliente
              </div>
            </button>
          </div>

          {/* Error Message */}
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

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={loginType === 'admin' ? 'admin@inmobiliaria.com' : 'cliente@ejemplo.com'}
                  required
                  autoComplete="off"
                  name={`email-${loginType}`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Ingresa tu contraseña"
                  required
                  autoComplete="off"
                  name={`password-${loginType}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Recordarme
                </label>
              </div>
              
              {/* Forgot Password Link - Solo para admins */}
              {loginType === 'admin' && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 ${
                loginType === 'client'
                  ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                  : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
              } transition-colors`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Iniciando sesión...
                </div>
              ) : (
                `Ingresar como ${loginType === 'admin' ? 'Administrador' : 'Cliente'}`
              )}
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sistema de administración inmobiliaria
          </p>
        </motion.div>
      </motion.div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default Login;
