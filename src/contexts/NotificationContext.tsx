import React, { createContext, useContext, useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  action: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => number;
  getModuleCounts: () => { clients: number; properties: number; inquiries: number; appointments: number; total: number };
  updateNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Cargar estado de notificaciones leídas desde localStorage
  const loadReadNotifications = () => {
    try {
      const readNotifications = localStorage.getItem('readNotifications');
      return readNotifications ? JSON.parse(readNotifications) : [];
    } catch (error) {
      console.error('Error loading read notifications:', error);
      return [];
    }
  };

  // Guardar estado de notificaciones leídas en localStorage
  const saveReadNotifications = (readIds: string[]) => {
    try {
      localStorage.setItem('readNotifications', JSON.stringify(readIds));
    } catch (error) {
      console.error('Error saving read notifications:', error);
    }
  };

  // Marcar notificación como leída
  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, read: true }
          : notif
      )
    );

    // Guardar en localStorage
    const readIds = loadReadNotifications();
    if (!readIds.includes(notificationId)) {
      saveReadNotifications([...readIds, notificationId]);
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));

    // Guardar todos los IDs en localStorage
    const allIds = notifications.map(notif => notif.id);
    const existingReadIds = loadReadNotifications();
    const newReadIds = [...new Set([...existingReadIds, ...allIds])];
    saveReadNotifications(newReadIds);
  };

  // Obtener conteo de notificaciones no leídas
  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  // Obtener conteo por módulo
  const getModuleCounts = () => {
    const counts = {
      clients: 0,
      properties: 0,
      inquiries: 0,
      appointments: 0,
      total: 0
    };

    notifications.forEach(notif => {
      if (!notif.read && notif.data) {
        counts.total++;
        switch (notif.data.type) {
          case 'overdue_payment':
          case 'expiring_contract':
          case 'contract_renewal':
            counts.clients++;
            break;
          case 'inactive_property':
            counts.properties++;
            break;
          case 'unfollowed_lead':
          case 'lead_no_contact':
            counts.inquiries++;
            break;
          case 'appointment_reminder':
          case 'appointment_cancelled':
          case 'appointment_status_change':
          case 'appointment_deleted':
            counts.appointments++;
            break;
        }
      }
    });

    return counts;
  };

  // Actualizar notificaciones (usado cuando se cargan nuevas alertas)
  const updateNotifications = (newNotifications: Notification[]) => {
    const readIds = loadReadNotifications();
    const notificationsWithReadStatus = newNotifications.map(notif => ({
      ...notif,
      read: readIds.includes(notif.id)
    }));
    setNotifications(notificationsWithReadStatus);
  };

  // Agregar una nueva notificación
  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const value = {
    notifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    getModuleCounts,
    updateNotifications,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};