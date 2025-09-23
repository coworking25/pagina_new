import { useState, useEffect } from 'react';

// Hook personalizado para manejar notificaciones globales
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

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
            counts.appointments++;
            break;
        }
      }
    });

    return counts;
  };

  // Actualizar notificaciones (usado cuando se cargan nuevas alertas)
  const updateNotifications = (newNotifications: any[]) => {
    const readIds = loadReadNotifications();
    const notificationsWithReadStatus = newNotifications.map(notif => ({
      ...notif,
      read: readIds.includes(notif.id)
    }));
    setNotifications(notificationsWithReadStatus);
  };

  return {
    notifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    getModuleCounts,
    updateNotifications
  };
};