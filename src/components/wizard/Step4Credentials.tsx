// Paso 4: Credenciales de Acceso al Portal del Cliente
import { useState } from 'react';
import { 
  Key, Mail, Lock, Eye, EyeOff, RefreshCw, Copy, 
  CheckCircle, AlertCircle, Send, Shield
} from 'lucide-react';
import type { ClientWizardData } from '../ClientWizard';

interface Step4Props {
  formData: ClientWizardData;
  onChange: (data: Partial<ClientWizardData>) => void;
}

export default function Step4Credentials({ formData, onChange }: Step4Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCredentialChange = (field: string, value: any) => {
    onChange({
      portal_credentials: {
        ...formData.portal_credentials,
        [field]: value
      }
    });
  };

  // Generar contraseña segura automáticamente
  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%&*';
    const allChars = uppercase + lowercase + numbers + symbols;
    
    let password = '';
    // Asegurar al menos un carácter de cada tipo
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Completar hasta 12 caracteres
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Mezclar aleatoriamente
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    handleCredentialChange('password', password);
  };

  // Copiar contraseña al portapapeles
  const copyToClipboard = () => {
    navigator.clipboard.writeText(formData.portal_credentials.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto-llenar email si ya existe en el paso 1
  const emailToUse = formData.portal_credentials.email || formData.email;

  // Validar fortaleza de contraseña
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: 'Sin contraseña', color: 'gray' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%&*]/.test(password)) strength++;

    if (strength <= 2) return { strength: 20, label: 'Débil', color: 'red' };
    if (strength <= 4) return { strength: 60, label: 'Media', color: 'yellow' };
    return { strength: 100, label: 'Fuerte', color: 'green' };
  };

  const passwordStrength = getPasswordStrength(formData.portal_credentials.password);

  return (
    <div className="space-y-8">
      {/* Título */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Credenciales de Acceso al Portal
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configura el acceso del cliente al portal web
        </p>
      </div>

      {/* Alerta Informativa */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Portal del Cliente
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              El cliente podrá iniciar sesión con estas credenciales para ver sus contratos, pagos, documentos y comunicaciones.
            </p>
          </div>
        </div>
      </div>

      {/* Email del Cliente */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-purple-600" />
          Email de Acceso
        </h4>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Correo Electrónico *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={emailToUse}
              onChange={(e) => {
                handleCredentialChange('email', e.target.value);
                // También actualizar el email principal si está vacío
                if (!formData.email) {
                  onChange({ email: e.target.value });
                }
              }}
              placeholder="cliente@ejemplo.com"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          {formData.email && !formData.portal_credentials.email && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              ✅ Usando el email del Paso 1
            </p>
          )}
        </div>
      </div>

      {/* Contraseña */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-600" />
          Contraseña de Acceso
        </h4>

        <div className="space-y-4">
          {/* Campo de contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contraseña *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.portal_credentials.password}
                onChange={(e) => handleCredentialChange('password', e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="block w-full pl-10 pr-24 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                  title={showPassword ? 'Ocultar' : 'Mostrar'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {formData.portal_credentials.password && (
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                    title="Copiar"
                  >
                    {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                )}
              </div>
            </div>
            
            {/* Barra de fortaleza */}
            {formData.portal_credentials.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Fortaleza:
                  </span>
                  <span className={`text-xs font-medium ${
                    passwordStrength.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    passwordStrength.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.color === 'green' ? 'bg-green-500' :
                      passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${passwordStrength.strength}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botón Generar Contraseña */}
          <button
            type="button"
            onClick={generatePassword}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            Generar Contraseña Segura
          </button>

          {/* Requisitos de contraseña */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Requisitos de la contraseña:
            </p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li className="flex items-center gap-2">
                {formData.portal_credentials.password?.length >= 8 ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <span className="w-3 h-3 rounded-full border-2 border-gray-300" />
                )}
                Mínimo 8 caracteres
              </li>
              <li className="flex items-center gap-2">
                {/[A-Z]/.test(formData.portal_credentials.password) ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <span className="w-3 h-3 rounded-full border-2 border-gray-300" />
                )}
                Al menos una mayúscula
              </li>
              <li className="flex items-center gap-2">
                {/[a-z]/.test(formData.portal_credentials.password) ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <span className="w-3 h-3 rounded-full border-2 border-gray-300" />
                )}
                Al menos una minúscula
              </li>
              <li className="flex items-center gap-2">
                {/[0-9]/.test(formData.portal_credentials.password) ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <span className="w-3 h-3 rounded-full border-2 border-gray-300" />
                )}
                Al menos un número
              </li>
              <li className="flex items-center gap-2">
                {/[!@#$%&*]/.test(formData.portal_credentials.password) ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <span className="w-3 h-3 rounded-full border-2 border-gray-300" />
                )}
                Al menos un símbolo (!@#$%&*)
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Opciones de Notificación */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-green-600" />
          Notificaciones
        </h4>

        <div className="space-y-4">
          {/* Enviar Email de Bienvenida */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.portal_credentials.send_welcome_email}
              onChange={(e) => handleCredentialChange('send_welcome_email', e.target.checked)}
              className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                Enviar email de bienvenida
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Se enviará un correo con las credenciales de acceso y un enlace para ingresar al portal
              </p>
            </div>
          </label>

          {/* Habilitar Acceso */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.portal_credentials.portal_access_enabled}
              onChange={(e) => handleCredentialChange('portal_access_enabled', e.target.checked)}
              className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                Habilitar acceso al portal inmediatamente
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                El cliente podrá iniciar sesión desde el momento en que se cree su cuenta
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Preview de Credenciales */}
      {emailToUse && formData.portal_credentials.password && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              Preview de Credenciales
            </h4>
            <div className="flex items-center gap-2">
              {formData.portal_credentials.portal_access_enabled ? (
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Activo
                </span>
              ) : (
                <span className="text-xs px-2 py-1 bg-gray-600 text-gray-400 rounded-full">
                  Inactivo
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3 font-mono">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Email:</div>
              <div className="text-white flex items-center justify-between">
                <span className="break-all">{emailToUse}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(emailToUse);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Contraseña:</div>
              <div className="text-white flex items-center justify-between">
                <span className={showPassword ? '' : 'blur-sm select-none'}>
                  {formData.portal_credentials.password}
                </span>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {formData.portal_credentials.send_welcome_email && (
            <div className="mt-4 flex items-center gap-2 text-xs text-green-400">
              <Send className="w-4 h-4" />
              <span>Se enviará email de bienvenida al crear el cliente</span>
            </div>
          )}
        </div>
      )}

      {/* Nota de Seguridad */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Nota de Seguridad
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Guarda estas credenciales en un lugar seguro. El cliente deberá cambiar su contraseña en el primer inicio de sesión por seguridad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
