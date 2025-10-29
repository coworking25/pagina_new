/**
 * Google Calendar Integration Service
 *
 * PROPOSITO: Gestionar la integración completa con Google Calendar
 * - Autenticación OAuth 2.0
 * - Sincronización de eventos
 * - Creación de eventos desde citas
 * - Gestión de calendarios múltiples
 *
 * FUNCIONALIDADES:
 * - Conectar/desconectar cuenta de Google
 * - Sincronizar eventos existentes del asesor
 * - Crear eventos automáticamente al agendar citas
 * - Actualizar eventos cuando cambian las citas
 * - Eliminar eventos cancelados
 * - Detectar conflictos de horario
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  location?: string;
  status?: string;
}

export interface CalendarSyncResult {
  success: boolean;
  syncedEvents: number;
  errors: string[];
  conflicts: Array<{
    localEvent: any;
    googleEvent: GoogleCalendarEvent;
  }>;
}

export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;
  private calendar: any;

  constructor() {
    // Configurar OAuth2 Client
    this.oauth2Client = new OAuth2Client(
      import.meta.env.VITE_GOOGLE_CLIENT_ID,
      import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
      import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback'
    );

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Generar URL de autenticación de Google
   */
  generateAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  /**
   * Intercambiar código de autorización por tokens
   */
  async exchangeCodeForTokens(code: string): Promise<any> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      // Guardar tokens en localStorage (en producción usar secure storage)
      localStorage.setItem('google_tokens', JSON.stringify(tokens));

      return tokens;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to authenticate with Google');
    }
  }

  /**
   * Configurar tokens desde storage
   */
  setCredentials(tokens: any): void {
    this.oauth2Client.setCredentials(tokens);
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    try {
      const tokens = localStorage.getItem('google_tokens');
      if (!tokens) return false;

      const parsedTokens = JSON.parse(tokens);
      this.oauth2Client.setCredentials(parsedTokens);

      // Verificar si el token no ha expirado
      return parsedTokens.expiry_date > Date.now();
    } catch {
      return false;
    }
  }

  /**
   * Desconectar cuenta de Google
   */
  disconnect(): void {
    localStorage.removeItem('google_tokens');
    this.oauth2Client.revokeCredentials();
  }

  /**
   * Obtener lista de calendarios disponibles
   */
  async getCalendars(): Promise<any[]> {
    try {
      const response = await this.calendar.calendarList.list();
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching calendars:', error);
      throw new Error('Failed to fetch calendars');
    }
  }

  /**
   * Obtener eventos de un calendario específico
   */
  async getEvents(calendarId: string = 'primary', timeMin?: Date, timeMax?: Date): Promise<GoogleCalendarEvent[]> {
    try {
      const params: any = {
        calendarId,
        singleEvents: true,
        orderBy: 'startTime'
      };

      if (timeMin) params.timeMin = timeMin.toISOString();
      if (timeMax) params.timeMax = timeMax.toISOString();

      const response = await this.calendar.events.list(params);

      return response.data.items?.map((event: any) => ({
        id: event.id,
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        attendees: event.attendees,
        location: event.location,
        status: event.status
      })) || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch events');
    }
  }

  /**
   * Crear evento en Google Calendar
   */
  async createEvent(calendarId: string = 'primary', eventData: Partial<GoogleCalendarEvent>): Promise<GoogleCalendarEvent> {
    try {
      const event = {
        summary: eventData.summary,
        description: eventData.description,
        start: eventData.start,
        end: eventData.end,
        attendees: eventData.attendees,
        location: eventData.location
      };

      const response = await this.calendar.events.insert({
        calendarId,
        resource: event
      });

      return {
        id: response.data.id,
        summary: response.data.summary,
        description: response.data.description,
        start: response.data.start,
        end: response.data.end,
        attendees: response.data.attendees,
        location: response.data.location,
        status: response.data.status
      };
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  }

  /**
   * Actualizar evento existente
   */
  async updateEvent(calendarId: string, eventId: string, eventData: Partial<GoogleCalendarEvent>): Promise<GoogleCalendarEvent> {
    try {
      const event = {
        summary: eventData.summary,
        description: eventData.description,
        start: eventData.start,
        end: eventData.end,
        attendees: eventData.attendees,
        location: eventData.location
      };

      const response = await this.calendar.events.update({
        calendarId,
        eventId,
        resource: event
      });

      return {
        id: response.data.id,
        summary: response.data.summary,
        description: response.data.description,
        start: response.data.start,
        end: response.data.end,
        attendees: response.data.attendees,
        location: response.data.location,
        status: response.data.status
      };
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }
  }

  /**
   * Eliminar evento
   */
  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId,
        eventId
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new Error('Failed to delete event');
    }
  }

  /**
   * Crear evento para una cita agendada
   */
  async createAppointmentEvent(appointmentData: {
    id: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    advisorName: string;
    propertyTitle?: string;
    appointmentDate: Date;
    appointmentType: string;
    visitType: string;
    specialRequests?: string;
  }): Promise<GoogleCalendarEvent> {
    const startDateTime = appointmentData.appointmentDate.toISOString();
    const endDateTime = new Date(appointmentData.appointmentDate.getTime() + 60 * 60 * 1000).toISOString(); // 1 hora de duración

    const summary = `Cita ${appointmentData.appointmentType} - ${appointmentData.clientName}`;
    const description = `
Cita agendada a través del sistema de coworking

👤 Cliente: ${appointmentData.clientName}
📧 Email: ${appointmentData.clientEmail}
📱 Teléfono: ${appointmentData.clientPhone}
🏢 Asesor: ${appointmentData.advisorName}
${appointmentData.propertyTitle ? `🏠 Propiedad: ${appointmentData.propertyTitle}\n` : ''}
📋 Tipo: ${appointmentData.appointmentType}
🏷️ Modalidad: ${appointmentData.visitType}
${appointmentData.specialRequests ? `💭 Solicitudes especiales: ${appointmentData.specialRequests}\n` : ''}

Agendado automáticamente por el sistema de citas.
    `.trim();

    return this.createEvent('primary', {
      summary,
      description,
      start: {
        dateTime: startDateTime,
        timeZone: 'America/Bogota'
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'America/Bogota'
      },
      attendees: [
        {
          email: appointmentData.clientEmail,
          displayName: appointmentData.clientName
        }
      ]
    });
  }

  /**
   * Sincronizar eventos existentes del asesor
   */
  async syncAdvisorEvents(advisorId: string, calendarId: string = 'primary'): Promise<CalendarSyncResult> {
    const result: CalendarSyncResult = {
      success: false,
      syncedEvents: 0,
      errors: [],
      conflicts: []
    };

    try {
      // Obtener eventos de Google Calendar de los próximos 30 días
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const googleEvents = await this.getEvents(calendarId, now, thirtyDaysFromNow);

      // Aquí iría la lógica para comparar con eventos locales del asesor
      // Por ahora solo contamos los eventos encontrados
      result.syncedEvents = googleEvents.length;
      result.success = true;

    } catch (error: any) {
      result.errors.push(error.message || 'Unknown error during sync');
    }

    return result;
  }

  /**
   * Verificar disponibilidad en Google Calendar
   */
  async checkAvailability(calendarId: string, startDateTime: Date, endDateTime: Date): Promise<boolean> {
    try {
      const events = await this.getEvents(calendarId, startDateTime, endDateTime);
      return events.length === 0;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  }
}

// Instancia singleton del servicio
export const googleCalendarService = new GoogleCalendarService();