import React, { useState, useEffect } from 'react';
import { X, Mail, TestTube, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { getEmailSettings, saveEmailSettings, testEmailConfiguration, EmailSettings } from '../../lib/emailConfig';

interface EmailSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailSettingsModal: React.FC<EmailSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [saveResult, setSaveResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Cargar configuración al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getEmailSettings();
      if (data) {
        setSettings(data);
      } else {
        // Si no hay configuración, usar valores por defecto
        setSettings({
          sendgridApiKey: '',
          fromEmail: 'noreply@coworkinginmobiliario.com',
          emailEnabled: false,
          portalCredentialsEnabled: true,
          appointmentConfirmationsEnabled: true,
          paymentRemindersEnabled: true,
          welcomeEmailsEnabled: true,
          testEmailAddress: ''
        });
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setSaveResult(null);

    try {
      const success = await saveEmailSettings(settings);
      setSaveResult({
        success,
        message: success ? 'Configuración guardada exitosamente' : 'Error al guardar la configuración'
      });

      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => setSaveResult(null), 3000);
    } catch {
      setSaveResult({
        success: false,
        message: 'Error interno al guardar la configuración'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!settings) return;

    setTesting(true);
    setTestResult(null);

    try {
      const result = await testEmailConfiguration(settings.testEmailAddress);
      setTestResult({
        success: result.success,
        message: result.message
      });
    } catch {
      setTestResult({
        success: false,
        message: 'Error al probar la configuración'
      });
    } finally {
      setTesting(false);
    }
  };

  const updateSetting = (key: keyof EmailSettings, value: string | boolean) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Configuración de Email
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando configuración...</span>
            </div>
          ) : settings ? (
            <div className="space-y-6">
              {/* Configuración General */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Configuración General
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* API Key de SendGrid */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key de SendGrid *
                    </label>
                    <input
                      type="password"
                      value={settings.sendgridApiKey}
                      onChange={(e) => updateSetting('sendgridApiKey', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="SG.xxxxxxxx..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Obtén tu API key desde{' '}
                      <a
                        href="https://app.sendgrid.com/settings/api_keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        SendGrid Dashboard
                      </a>
                    </p>
                  </div>

                  {/* Email Remitente */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Remitente *
                    </label>
                    <input
                      type="email"
                      value={settings.fromEmail}
                      onChange={(e) => updateSetting('fromEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="noreply@tuempresa.com"
                    />
                  </div>
                </div>

                {/* Email de Prueba */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email de Prueba
                  </label>
                  <input
                    type="email"
                    value={settings.testEmailAddress || ''}
                    onChange={(e) => updateSetting('testEmailAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="tuemail@ejemplo.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email donde recibirás las pruebas de configuración
                  </p>
                </div>
              </div>

              {/* Configuración de Emails */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Tipos de Email Habilitados
                </h3>

                <div className="space-y-3">
                  {/* Email General Habilitado */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailEnabled"
                      checked={settings.emailEnabled}
                      onChange={(e) => updateSetting('emailEnabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="emailEnabled" className="ml-2 text-sm text-gray-700">
                      <strong>Habilitar envío de emails</strong> - Activa/desactiva todo el sistema de email
                    </label>
                  </div>

                  {/* Credenciales del Portal */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="portalCredentialsEnabled"
                      checked={settings.portalCredentialsEnabled}
                      onChange={(e) => updateSetting('portalCredentialsEnabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={!settings.emailEnabled}
                    />
                    <label htmlFor="portalCredentialsEnabled" className="ml-2 text-sm text-gray-700">
                      Credenciales del Portal - Envío automático al crear credenciales de cliente
                    </label>
                  </div>

                  {/* Confirmaciones de Cita */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="appointmentConfirmationsEnabled"
                      checked={settings.appointmentConfirmationsEnabled}
                      onChange={(e) => updateSetting('appointmentConfirmationsEnabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={!settings.emailEnabled}
                    />
                    <label htmlFor="appointmentConfirmationsEnabled" className="ml-2 text-sm text-gray-700">
                      Confirmaciones de Cita - Notificaciones cuando se agenda una cita
                    </label>
                  </div>

                  {/* Recordatorios de Pago */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="paymentRemindersEnabled"
                      checked={settings.paymentRemindersEnabled}
                      onChange={(e) => updateSetting('paymentRemindersEnabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={!settings.emailEnabled}
                    />
                    <label htmlFor="paymentRemindersEnabled" className="ml-2 text-sm text-gray-700">
                      Recordatorios de Pago - Alertas de pagos próximos a vencer
                    </label>
                  </div>

                  {/* Emails de Bienvenida */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="welcomeEmailsEnabled"
                      checked={settings.welcomeEmailsEnabled}
                      onChange={(e) => updateSetting('welcomeEmailsEnabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={!settings.emailEnabled}
                    />
                    <label htmlFor="welcomeEmailsEnabled" className="ml-2 text-sm text-gray-700">
                      Emails de Bienvenida - Saludo inicial a nuevos clientes
                    </label>
                  </div>
                </div>
              </div>

              {/* Resultados */}
              {saveResult && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${
                  saveResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  {saveResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={saveResult.success ? 'text-green-800' : 'text-red-800'}>
                    {saveResult.message}
                  </span>
                </div>
              )}

              {testResult && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${
                  testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                    {testResult.message}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Error al cargar la configuración
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={handleTestEmail}
            disabled={testing || !settings?.emailEnabled}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <TestTube className="w-4 h-4" />
            {testing ? 'Probando...' : 'Probar Configuración'}
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};