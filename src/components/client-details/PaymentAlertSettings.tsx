import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Mail, MessageCircle, Smartphone, Clock, Calendar,
  Save, AlertCircle, CheckCircle, Settings as SettingsIcon
} from 'lucide-react';
import { 
  getClientAlertSettings, 
  updateClientAlertSettings,
  getClientAlertHistory,
  type PaymentAlertSettings,
  type PaymentAlertSent
} from '../../lib/paymentAlertsApi';

interface Props {
  clientId: string;
  clientName: string;
}

const PaymentAlertSettings: React.FC<Props> = ({ clientId, clientName }) => {
  const [settings, setSettings] = useState<PaymentAlertSettings | null>(null);
  const [history, setHistory] = useState<PaymentAlertSent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
    loadHistory();
  }, [clientId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getClientAlertSettings(clientId);
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await getClientAlertHistory(clientId, 10);
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const success = await updateClientAlertSettings(clientId, settings);
      
      if (success) {
        setMessage({ type: 'success', text: 'Configuración guardada exitosamente' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Error al guardar la configuración' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof PaymentAlertSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const toggleDay = (day: number) => {
    if (!settings) return;
    const days = [...settings.days_before_due];
    const index = days.indexOf(day);
    
    if (index > -1) {
      days.splice(index, 1);
    } else {
      days.push(day);
      days.sort((a, b) => b - a);
    }
    
    updateSetting('days_before_due', days);
  };

  const getAlertTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'reminder_7_days': '7 días antes',
      'reminder_3_days': '3 días antes',
      'reminder_1_day': '1 día antes',
      'due_today': 'Vence hoy',
      'overdue_1_day': '1 día vencido',
      'overdue_3_days': '3 días vencido',
      'overdue_7_days': '7 días vencido',
      'overdue_15_days': '15 días vencido',
      'payment_received': 'Pago recibido',
      'partial_payment_received': 'Pago parcial'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      sent: { bg: 'bg-green-100', text: 'text-green-800', label: 'Enviado' },
      delivered: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Entregado' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Fallido' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4" />;
      case 'sms':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center p-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No se encontró configuración de alertas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Configuración de Alertas
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Configurar notificaciones automáticas para {clientName}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {/* Mensaje de éxito/error */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </motion.div>
      )}

      {/* Canales de notificación */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Canales de Notificación
        </h4>
        
        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Correo Electrónico</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{settings.email || 'No configurado'}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.email_enabled}
                onChange={(e) => updateSetting('email_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* WhatsApp */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">WhatsApp</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{settings.whatsapp_number || 'No configurado'}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.whatsapp_enabled}
                onChange={(e) => updateSetting('whatsapp_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* SMS */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg opacity-50">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">SMS</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Próximamente</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={false}
                disabled
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer dark:bg-gray-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Recordatorios antes del vencimiento */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Recordatorios Antes del Vencimiento
        </h4>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[14, 7, 5, 3, 1].map(day => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={`p-3 rounded-lg border-2 transition-all ${
                settings.days_before_due.includes(day)
                  ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
            >
              <p className="font-semibold text-lg">{day}</p>
              <p className="text-xs">{day === 1 ? 'día' : 'días'} antes</p>
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="send_on_due_date"
            checked={settings.send_on_due_date}
            onChange={(e) => updateSetting('send_on_due_date', e.target.checked)}
            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
          />
          <label htmlFor="send_on_due_date" className="text-sm text-gray-700 dark:text-gray-300">
            Enviar alerta el día del vencimiento
          </label>
        </div>
      </div>

      {/* Alertas de vencidos */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          Alertas de Pagos Vencidos
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="send_overdue_alerts"
              checked={settings.send_overdue_alerts}
              onChange={(e) => updateSetting('send_overdue_alerts', e.target.checked)}
              className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
            />
            <label htmlFor="send_overdue_alerts" className="text-sm text-gray-700 dark:text-gray-300">
              Enviar alertas cuando el pago esté vencido
            </label>
          </div>

          {settings.send_overdue_alerts && (
            <div className="pl-6">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                Frecuencia de recordatorios (cada cuántos días):
              </label>
              <select
                value={settings.overdue_alert_frequency}
                onChange={(e) => updateSetting('overdue_alert_frequency', parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="1">Cada día</option>
                <option value="2">Cada 2 días</option>
                <option value="3">Cada 3 días</option>
                <option value="7">Cada semana</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Horario preferido */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Horario de Envío
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Hora preferida:
            </label>
            <input
              type="time"
              value={settings.preferred_time}
              onChange={(e) => updateSetting('preferred_time', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Zona horaria:
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => updateSetting('timezone', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full"
            >
              <option value="America/Bogota">Bogotá (Colombia)</option>
              <option value="America/Mexico_City">Ciudad de México</option>
              <option value="America/Lima">Lima</option>
              <option value="America/Buenos_Aires">Buenos Aires</option>
            </select>
          </div>
        </div>
      </div>

      {/* Historial de alertas */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
          Últimas Alertas Enviadas
        </h4>
        
        {history.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            No hay alertas enviadas aún
          </p>
        ) : (
          <div className="space-y-3">
            {history.map(alert => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                    {getChannelIcon(alert.channel)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {getAlertTypeLabel(alert.alert_type)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      ${alert.payment_amount.toLocaleString()} - {new Date(alert.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {getStatusBadge(alert.status)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentAlertSettings;
