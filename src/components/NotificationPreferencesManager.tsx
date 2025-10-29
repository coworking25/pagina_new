import React, { useState } from 'react';
import { useNotificationPreferences } from '../hooks/useNotificationSystem';
import {
  NotificationPreferencesForm,
  ReminderTiming,
  NOTIFICATION_CHANNEL_LABELS,
  REMINDER_TIMING_LABELS
} from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Bell, Mail, MessageCircle, Smartphone, Monitor, Clock, Save, TestTube } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationPreferencesProps {
  userId: string;
  userType?: 'client' | 'advisor' | 'admin';
  onSave?: () => void;
}

const CHANNEL_ICONS = {
  email: Mail,
  whatsapp: MessageCircle,
  sms: Smartphone,
  push: Bell,
  in_app: Monitor
};

export function NotificationPreferencesManager({
  userId,
  userType = 'client',
  onSave
}: NotificationPreferencesProps) {
  const { preferences, loading, error, updatePreferences } = useNotificationPreferences(userId, userType);
  const [formData, setFormData] = useState<NotificationPreferencesForm | null>(null);
  const [saving, setSaving] = useState(false);

  // Initialize form data when preferences are loaded
  React.useEffect(() => {
    if (preferences && !formData) {
      setFormData({
        email_enabled: preferences.email_enabled,
        whatsapp_enabled: preferences.whatsapp_enabled,
        sms_enabled: preferences.sms_enabled,
        push_enabled: preferences.push_enabled,
        in_app_enabled: preferences.in_app_enabled,
        appointment_reminders: preferences.appointment_reminders,
        payment_notifications: preferences.payment_notifications,
        contract_notifications: preferences.contract_notifications,
        marketing_emails: preferences.marketing_emails,
        system_alerts: preferences.system_alerts,
        reminder_timings: preferences.reminder_timings,
        quiet_hours_start: preferences.quiet_hours_start,
        quiet_hours_end: preferences.quiet_hours_end,
        timezone: preferences.timezone
      });
    }
  }, [preferences, formData]);

  const handleChannelToggle = (channel: keyof NotificationPreferencesForm, enabled: boolean) => {
    if (!formData) return;

    setFormData(prev => prev ? { ...prev, [channel]: enabled } : null);
  };

  const handleNotificationTypeToggle = (type: keyof NotificationPreferencesForm, enabled: boolean) => {
    if (!formData) return;

    setFormData(prev => prev ? { ...prev, [type]: enabled } : null);
  };

  const handleReminderTimingToggle = (timing: ReminderTiming, checked: boolean) => {
    if (!formData) return;

    const currentTimings = formData.reminder_timings || [];
    const newTimings = checked
      ? [...currentTimings, timing]
      : currentTimings.filter(t => t !== timing);

    setFormData(prev => prev ? { ...prev, reminder_timings: newTimings } : null);
  };

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    try {
      await updatePreferences(formData);
      toast.success('Preferencias de notificación guardadas correctamente');
      onSave?.();
    } catch (error) {
      toast.error('Error al guardar las preferencias');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Cargando preferencias...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!formData) {
    return (
      <Alert>
        <AlertDescription>No se pudieron cargar las preferencias</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Preferencias de Notificaciones
        </CardTitle>
        <CardDescription>
          Configura cómo y cuándo quieres recibir notificaciones
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Canales de Comunicación */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Canales de Comunicación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(NOTIFICATION_CHANNEL_LABELS).map(([channel, label]) => {
              const Icon = CHANNEL_ICONS[channel as keyof typeof CHANNEL_ICONS];
              const field = `${channel}_enabled` as keyof NotificationPreferencesForm;

              return (
                <div key={channel} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <Label htmlFor={channel} className="font-medium">
                      {label}
                    </Label>
                  </div>
                  <Switch
                    id={channel}
                    checked={formData[field] as boolean}
                    onCheckedChange={(checked) => handleChannelToggle(field, checked)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Tipos de Notificaciones */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Tipos de Notificaciones</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="appointment_reminders">Recordatorios de citas</Label>
              <Switch
                id="appointment_reminders"
                checked={formData.appointment_reminders}
                onCheckedChange={(checked) => handleNotificationTypeToggle('appointment_reminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="payment_notifications">Notificaciones de pagos</Label>
              <Switch
                id="payment_notifications"
                checked={formData.payment_notifications}
                onCheckedChange={(checked) => handleNotificationTypeToggle('payment_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="contract_notifications">Notificaciones de contratos</Label>
              <Switch
                id="contract_notifications"
                checked={formData.contract_notifications}
                onCheckedChange={(checked) => handleNotificationTypeToggle('contract_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="marketing_emails">Emails de marketing</Label>
              <Switch
                id="marketing_emails"
                checked={formData.marketing_emails}
                onCheckedChange={(checked) => handleNotificationTypeToggle('marketing_emails', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="system_alerts">Alertas del sistema</Label>
              <Switch
                id="system_alerts"
                checked={formData.system_alerts}
                onCheckedChange={(checked) => handleNotificationTypeToggle('system_alerts', checked)}
              />
            </div>
          </div>
        </div>

        {/* Configuración de Recordatorios */}
        {formData.appointment_reminders && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Configuración de Recordatorios
            </h3>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Enviar recordatorios:</Label>
              {Object.entries(REMINDER_TIMING_LABELS).map(([timing, label]) => (
                <div key={timing} className="flex items-center space-x-2">
                  <Checkbox
                    id={timing}
                    checked={formData.reminder_timings?.includes(timing as ReminderTiming) || false}
                    onCheckedChange={(checked) =>
                      handleReminderTimingToggle(timing as ReminderTiming, checked as boolean)
                    }
                  />
                  <Label htmlFor={timing} className="text-sm">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Horarios de Silencio */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Horarios de Silencio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quiet_start">Hora de inicio</Label>
              <Select
                value={formData.quiet_hours_start || ''}
                onValueChange={(value) =>
                  setFormData(prev => prev ? { ...prev, quiet_hours_start: value || undefined } : null)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar hora" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <SelectItem key={hour} value={`${hour}:00`}>
                        {hour}:00
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quiet_end">Hora de fin</Label>
              <Select
                value={formData.quiet_hours_end || ''}
                onValueChange={(value) =>
                  setFormData(prev => prev ? { ...prev, quiet_hours_end: value || undefined } : null)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar hora" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <SelectItem key={hour} value={`${hour}:00`}>
                        {hour}:00
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Zona Horaria */}
        <div>
          <Label htmlFor="timezone">Zona Horaria</Label>
          <Select
            value={formData.timezone}
            onValueChange={(value) =>
              setFormData(prev => prev ? { ...prev, timezone: value } : null)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/Bogota">Colombia (GMT-5)</SelectItem>
              <SelectItem value="America/Mexico_City">México (GMT-6)</SelectItem>
              <SelectItem value="America/Santiago">Chile (GMT-4)</SelectItem>
              <SelectItem value="America/Argentina/Buenos_Aires">Argentina (GMT-3)</SelectItem>
              <SelectItem value="America/Lima">Perú (GMT-5)</SelectItem>
              <SelectItem value="UTC">UTC</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar Preferencias
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              // Reset to original preferences
              if (preferences) {
                setFormData({
                  email_enabled: preferences.email_enabled,
                  whatsapp_enabled: preferences.whatsapp_enabled,
                  sms_enabled: preferences.sms_enabled,
                  push_enabled: preferences.push_enabled,
                  in_app_enabled: preferences.in_app_enabled,
                  appointment_reminders: preferences.appointment_reminders,
                  payment_notifications: preferences.payment_notifications,
                  contract_notifications: preferences.contract_notifications,
                  marketing_emails: preferences.marketing_emails,
                  system_alerts: preferences.system_alerts,
                  reminder_timings: preferences.reminder_timings,
                  quiet_hours_start: preferences.quiet_hours_start,
                  quiet_hours_end: preferences.quiet_hours_end,
                  timezone: preferences.timezone
                });
              }
            }}
          >
            Restablecer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}