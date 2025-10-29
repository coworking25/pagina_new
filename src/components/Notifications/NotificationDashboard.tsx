import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, BarChart3, Settings, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { reminderService } from '../../services/reminderService';
import { Notification, NotificationLog, ReminderRule } from '../../types';
import Button from '../UI/Button';
import Card from '../UI/Card';

interface NotificationStats {
  total_notifications: number;
  pending_notifications: number;
  sent_today: number;
  failed_last_24h: number;
  active_reminder_rules: number;
}

interface NotificationDashboardProps {
  isAdmin?: boolean;
}

export const NotificationDashboard: React.FC<NotificationDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'logs' | 'settings'>('overview');
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [rules, setRules] = useState<ReminderRule[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'overview':
          await loadStats();
          await loadRecentNotifications();
          break;
        case 'rules':
          await loadRules();
          break;
        case 'logs':
          await loadLogs();
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_notification_stats');
      if (error) {
        console.error('Error loading stats:', error);
        return;
      }
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadRules = async () => {
    try {
      const { data, error } = await supabase
        .from('reminder_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading rules:', error);
        return;
      }
      setRules(data || []);
    } catch (error) {
      console.error('Error loading rules:', error);
    }
  };

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select(`
          *,
          notification:notifications(type, recipient_email, message)
        `)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading logs:', error);
        return;
      }
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('reminder_rules')
        .update({ is_active: !isActive })
        .eq('id', ruleId);

      if (error) {
        console.error('Error updating rule:', error);
        return;
      }

      // Recargar reglas
      await loadRules();
    } catch (error) {
      console.error('Error toggling rule status:', error);
    }
  };

  const runNotificationScheduler = async () => {
    try {
      setLoading(true);
      await reminderService.processPendingNotifications();
      await loadStats();
      await loadRecentNotifications();
    } catch (error) {
      console.error('Error running scheduler:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'sms':
        return <Smartphone className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Notificaciones</h1>
          <p className="text-gray-600">Gestión y monitoreo de notificaciones automáticas</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={runNotificationScheduler}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Procesar Pendientes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Resumen', icon: BarChart3 },
            { id: 'rules', label: 'Reglas', icon: Settings },
            { id: 'logs', label: 'Logs', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <Bell className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{stats.total_notifications}</p>
                          <p className="text-sm text-gray-600">Total Notificaciones</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-yellow-600" />
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{stats.pending_notifications}</p>
                          <p className="text-sm text-gray-600">Pendientes</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{stats.sent_today}</p>
                          <p className="text-sm text-gray-600">Enviadas Hoy</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <Settings className="w-8 h-8 text-purple-600" />
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{stats.active_reminder_rules}</p>
                          <p className="text-sm text-gray-600">Reglas Activas</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Recent Notifications */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificaciones Recientes</h3>
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(notification.status)}
                          <div>
                            <p className="font-medium text-gray-900">{notification.type}</p>
                            <p className="text-sm text-gray-600">{notification.recipient_email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {notification.channels.map((channel) => (
                            <span key={channel} className="flex items-center gap-1">
                              {getChannelIcon(channel)}
                            </span>
                          ))}
                          <span className="text-sm text-gray-500">
                            {new Date(notification.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Rules Tab */}
            {activeTab === 'rules' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reglas de Recordatorios</h3>
                <div className="space-y-4">
                  {rules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{rule.name}</h4>
                        <p className="text-sm text-gray-600">{rule.type} - {rule.timing}</p>
                        <p className="text-sm text-gray-500">
                          Canales: {rule.channels.join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rule.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleRuleStatus(rule.id, rule.is_active)}
                        >
                          {rule.is_active ? 'Desactivar' : 'Activar'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Logs de Notificaciones</h3>
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(log.status)}
                        <div>
                          <p className="font-medium text-gray-900">{log.channel}</p>
                          <p className="text-sm text-gray-600">
                            ID: {log.notification_id}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(log.sent_at).toLocaleString()}
                        </p>
                        {log.error_message && (
                          <p className="text-xs text-red-600">{log.error_message}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};