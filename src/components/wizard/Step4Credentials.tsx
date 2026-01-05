import React, { useState } from 'react';
import { Key, Mail, Lock, Eye, EyeOff, RefreshCw, Copy, Shield } from 'lucide-react';
import { ClientWizardData } from '../ClientWizard';

interface Step4Props {
  formData: ClientWizardData;
  onChange: (data: Partial<ClientWizardData>) => void;
}

export default function Step4Credentials({ formData, onChange }: Step4Props) {
  const [showPassword, setShowPassword] = useState(false);

  const handleNestedChange = (field: string, value: any) => {
    onChange({
      portal_credentials: {
        ...formData.portal_credentials,
        [field]: value
      }
    });
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    handleNestedChange('password', pass);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">
              Acceso al Portal de Clientes
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              Configure las credenciales para que el cliente pueda acceder a su portal personal.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Habilitar Acceso */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="portal_access_enabled"
            checked={formData.portal_credentials?.portal_access_enabled || false}
            onChange={(e) => handleNestedChange('portal_access_enabled', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="portal_access_enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Habilitar acceso al portal
          </label>
        </div>

        {formData.portal_credentials?.portal_access_enabled && (
          <>
            {/* Email (Usuario) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Usuario (Email)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.portal_credentials?.email || ''}
                  onChange={(e) => handleNestedChange('email', e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-white transition-colors"
                  placeholder="usuario@ejemplo.com"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contraseña
              </label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.portal_credentials?.password || ''}
                    onChange={(e) => handleNestedChange('password', e.target.value)}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-white transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  title="Generar contraseña segura"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Enviar Email de Bienvenida */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="send_welcome_email"
                checked={formData.portal_credentials?.send_welcome_email || false}
                onChange={(e) => handleNestedChange('send_welcome_email', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="send_welcome_email" className="text-sm text-gray-600 dark:text-gray-400">
                Enviar credenciales por correo electrónico
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
