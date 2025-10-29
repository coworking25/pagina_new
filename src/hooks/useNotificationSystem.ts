import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  Notification,
  NotificationPreferences,
  NotificationStats,
  NotificationType,
  NotificationChannel
} from '../types';

export interface UseNotificationsReturn {
  notifications: Notification[];
  preferences: NotificationPreferences | null;
  stats: NotificationStats | null;
  loading: boolean;
  error: string | null;

  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  sendTestNotification: (type: NotificationType, channels: NotificationChannel[]) => Promise<void>;

  // Real-time
  subscribeToNotifications: () => () => void;
}

export function useNotificationSystem(userId?: string, userType: 'client' | 'advisor' | 'admin' = 'client'): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userId)
        .eq('recipient_type', userType)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      setNotifications(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching notifications');
    } finally {
      setLoading(false);
    }
  }, [userId, userType]);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('user_type', userType)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // No rows returned
        throw fetchError;
      }

      setPreferences(data || null);
    } catch (err) {
      console.error('Error fetching notification preferences:', err);
    }
  }, [userId, userType]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      // This would typically call a stored procedure or aggregate query
      // For now, we'll calculate basic stats from notifications
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayNotifications = notifications.filter(n => {
        const createdAt = new Date(n.created_at);
        return createdAt >= today;
      });

      setStats({
        total_sent_today: todayNotifications.length,
        total_sent_this_week: notifications.filter(n => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(n.created_at) >= weekAgo;
        }).length,
        total_sent_this_month: notifications.filter(n => {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return new Date(n.created_at) >= monthAgo;
        }).length,
        delivery_rate: 85, // Mock data
        failure_rate: 15,  // Mock data
        avg_response_time: 30, // Mock data
        cost_this_month: 0 // Mock data
      });
    } catch (err) {
      console.error('Error fetching notification stats:', err);
    }
  }, [notifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, status: 'delivered', delivered_at: new Date().toISOString() }
            : n
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error marking notification as read');
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting notification');
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    if (!userId || !preferences) return;

    try {
      const updatedPreferences = { ...preferences, ...newPreferences };

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          ...updatedPreferences,
          user_id: userId,
          user_type: userType,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setPreferences(updatedPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating preferences');
    }
  }, [userId, userType, preferences]);

  // Send test notification
  const sendTestNotification = useCallback(async (type: NotificationType, channels: NotificationChannel[]) => {
    if (!userId) return;

    try {
      const testNotification = {
        type,
        priority: 'normal' as const,
        status: 'pending' as const,
        recipient_id: userId,
        recipient_type: userType,
        recipient_email: channels.includes('email') ? `test_${userId}@example.com` : undefined,
        recipient_phone: (channels.includes('whatsapp') || channels.includes('sms')) ? '+1234567890' : undefined,
        subject: `Test ${type} notification`,
        message: `This is a test ${type} notification sent at ${new Date().toLocaleString()}`,
        channels,
        scheduled_at: new Date().toISOString(),
        retry_count: 0,
        max_retries: 3
      };

      const { error } = await supabase
        .from('notifications')
        .insert(testNotification);

      if (error) throw error;

      // Refresh notifications
      await fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending test notification');
    }
  }, [userId, userType, fetchNotifications]);

  // Subscribe to real-time notifications
  const subscribeToNotifications = useCallback(() => {
    if (!userId) return () => {};

    const channel = supabase
      .channel(`notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`
        },
        (payload) => {
          setNotifications(prev =>
            prev.map(n =>
              n.id === payload.new.id ? payload.new as Notification : n
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Initialize data
  useEffect(() => {
    if (userId) {
      fetchNotifications();
      fetchPreferences();
    }
  }, [userId, fetchNotifications, fetchPreferences]);

  // Update stats when notifications change
  useEffect(() => {
    if (notifications.length > 0) {
      fetchStats();
    }
  }, [notifications, fetchStats]);

  return {
    notifications,
    preferences,
    stats,
    loading,
    error,
    markAsRead,
    deleteNotification,
    updatePreferences,
    sendTestNotification,
    subscribeToNotifications
  };
}

// Hook for notification preferences management
export function useNotificationPreferences(userId?: string, userType: 'client' | 'advisor' | 'admin' = 'client') {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('user_type', userType)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // If no preferences exist, create default ones
      if (!data) {
        const defaultPreferences: Omit<NotificationPreferences, 'id' | 'created_at' | 'updated_at'> = {
          user_id: userId,
          user_type: userType,
          email_enabled: true,
          whatsapp_enabled: true,
          sms_enabled: false,
          push_enabled: true,
          in_app_enabled: true,
          appointment_reminders: true,
          payment_notifications: true,
          contract_notifications: true,
          marketing_emails: false,
          system_alerts: true,
          reminder_timings: ['24_hours_before', '1_hour_before'],
          timezone: 'America/Bogota'
        };

        const { data: newPreferences, error: insertError } = await supabase
          .from('notification_preferences')
          .insert(defaultPreferences)
          .select()
          .single();

        if (insertError) throw insertError;
        setPreferences(newPreferences);
      } else {
        setPreferences(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching preferences');
    } finally {
      setLoading(false);
    }
  }, [userId, userType]);

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    if (!userId || !preferences) return;

    try {
      const updatedPreferences = { ...preferences, ...newPreferences };

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          ...updatedPreferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setPreferences(updatedPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating preferences');
    }
  }, [userId, preferences]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refetch: fetchPreferences
  };
}