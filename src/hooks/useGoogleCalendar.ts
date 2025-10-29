/**
 * Google Calendar Hook
 *
 * PROPOSITO: Hook personalizado para gestionar el estado de Google Calendar
 * - Autenticación OAuth
 * - Estado de conexión
 * - Sincronización automática
 * - Gestión de errores
 */

import { useState, useEffect, useCallback } from 'react';
import { googleCalendarService, GoogleCalendarEvent, CalendarSyncResult } from '../services/googleCalendar';

export interface GoogleCalendarState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  calendars: any[];
  lastSync: Date | null;
  syncResult: CalendarSyncResult | null;
}

export interface UseGoogleCalendarReturn extends GoogleCalendarState {
  connect: () => Promise<void>;
  disconnect: () => void;
  syncEvents: (advisorId: string) => Promise<CalendarSyncResult>;
  createAppointmentEvent: (appointmentData: any) => Promise<GoogleCalendarEvent>;
  checkAvailability: (startDateTime: Date, endDateTime: Date) => Promise<boolean>;
  refreshCalendars: () => Promise<void>;
}

export const useGoogleCalendar = (): UseGoogleCalendarReturn => {
  const [state, setState] = useState<GoogleCalendarState>({
    isAuthenticated: false,
    isLoading: false,
    error: null,
    calendars: [],
    lastSync: null,
    syncResult: null
  });

  // Verificar autenticación al montar el componente
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = googleCalendarService.isAuthenticated();
      setState(prev => ({ ...prev, isAuthenticated: isAuth }));

      if (isAuth) {
        refreshCalendars();
      }
    };

    checkAuth();
  }, []);

  // Conectar con Google Calendar
  const connect = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const authUrl = googleCalendarService.generateAuthUrl();

      // Abrir popup para autenticación
      const popup = window.open(
        authUrl,
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('No se pudo abrir la ventana de autenticación. Verifica que los popups estén habilitados.');
      }

      // Escuchar mensajes del popup
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          const { code } = event.data;
          handleAuthCode(code);
          window.removeEventListener('message', handleMessage);
          popup.close();
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: event.data.error || 'Error en la autenticación'
          }));
          window.removeEventListener('message', handleMessage);
          popup.close();
        }
      };

      window.addEventListener('message', handleMessage);

      // Timeout para cerrar popup si no hay respuesta
      setTimeout(() => {
        if (!popup.closed) {
          popup.close();
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Tiempo de espera agotado para la autenticación'
          }));
        }
      }, 300000); // 5 minutos

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error al conectar con Google Calendar'
      }));
    }
  }, []);

  // Manejar código de autorización
  const handleAuthCode = useCallback(async (code: string) => {
    try {
      await googleCalendarService.exchangeCodeForTokens(code);
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }));

      // Cargar calendarios después de autenticar
      await refreshCalendars();
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error al procesar la autenticación'
      }));
    }
  }, []);

  // Desconectar
  const disconnect = useCallback(() => {
    googleCalendarService.disconnect();
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      calendars: [],
      lastSync: null,
      syncResult: null,
      error: null
    }));
  }, []);

  // Sincronizar eventos
  const syncEvents = useCallback(async (advisorId: string): Promise<CalendarSyncResult> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await googleCalendarService.syncAdvisorEvents(advisorId);
      setState(prev => ({
        ...prev,
        isLoading: false,
        lastSync: new Date(),
        syncResult: result
      }));
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Error al sincronizar eventos';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, []);

  // Crear evento de cita
  const createAppointmentEvent = useCallback(async (appointmentData: any): Promise<GoogleCalendarEvent> => {
    if (!state.isAuthenticated) {
      throw new Error('No estás conectado a Google Calendar');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const event = await googleCalendarService.createAppointmentEvent(appointmentData);
      setState(prev => ({ ...prev, isLoading: false }));
      return event;
    } catch (error: any) {
      const errorMessage = error.message || 'Error al crear evento en Google Calendar';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, [state.isAuthenticated]);

  // Verificar disponibilidad
  const checkAvailability = useCallback(async (startDateTime: Date, endDateTime: Date): Promise<boolean> => {
    if (!state.isAuthenticated) {
      return true; // Si no está conectado, asumir disponible
    }

    try {
      return await googleCalendarService.checkAvailability('primary', startDateTime, endDateTime);
    } catch (error) {
      console.error('Error checking availability:', error);
      return true; // En caso de error, asumir disponible
    }
  }, [state.isAuthenticated]);

  // Refrescar lista de calendarios
  const refreshCalendars = useCallback(async () => {
    if (!state.isAuthenticated) return;

    try {
      const calendars = await googleCalendarService.getCalendars();
      setState(prev => ({ ...prev, calendars }));
    } catch (error: any) {
      console.error('Error refreshing calendars:', error);
      setState(prev => ({
        ...prev,
        error: 'Error al cargar calendarios'
      }));
    }
  }, [state.isAuthenticated]);

  return {
    ...state,
    connect,
    disconnect,
    syncEvents,
    createAppointmentEvent,
    checkAvailability,
    refreshCalendars
  };
};