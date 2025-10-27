import { createCalendarClient, getGoogleTokens, saveGoogleTokens, revokeGoogleAccess } from '../config/googleCalendar';
import { supabase } from '../lib/supabase';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  attendees?: Array<{ email: string; displayName?: string }>;
  location?: string;
  status: string;
}

export class GoogleCalendarService {
  // Static methods to expose config functions
  static async getGoogleTokens(userId: string) {
    return getGoogleTokens(userId);
  }

  static async saveGoogleTokens(userId: string, tokens: any) {
    return saveGoogleTokens(userId, tokens);
  }

  static async revokeGoogleAccess(userId: string) {
    return revokeGoogleAccess(userId);
  }

  private static async getCalendarClient(userId: string) {
    const tokens = await getGoogleTokens(userId);
    if (!tokens) {
      throw new Error('Google Calendar not connected for this user');
    }
    return createCalendarClient(tokens);
  }

  // Sync appointment to Google Calendar
  static async createGoogleEvent(userId: string, appointment: any): Promise<string | null> {
    try {
      const calendar = await this.getCalendarClient(userId);

      // Get calendar settings
      const { data: settings } = await supabase
        .from('calendar_settings')
        .select('google_calendar_id')
        .eq('user_id', userId)
        .single();

      const calendarId = settings?.google_calendar_id || 'primary';

      const event = {
        summary: `${appointment.title} - ${appointment.client_name || 'Cliente'}`,
        description: appointment.notes || '',
        start: {
          dateTime: appointment.start_time,
          timeZone: 'America/Bogota'
        },
        end: {
          dateTime: appointment.end_time,
          timeZone: 'America/Bogota'
        },
        location: appointment.location || '',
        attendees: appointment.participants?.map((p: any) => ({
          email: p.email,
          displayName: p.name
        })) || []
      };

      const response = await calendar.events.insert({
        calendarId,
        requestBody: event
      });

      return response.data.id || null;
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      return null;
    }
  }

  // Update Google Calendar event
  static async updateGoogleEvent(userId: string, appointment: any): Promise<void> {
    try {
      if (!appointment.google_event_id) return;

      const calendar = await this.getCalendarClient(userId);

      const { data: settings } = await supabase
        .from('calendar_settings')
        .select('google_calendar_id')
        .eq('user_id', userId)
        .single();

      const calendarId = settings?.google_calendar_id || 'primary';

      const event = {
        summary: `${appointment.title} - ${appointment.client_name || 'Cliente'}`,
        description: appointment.notes || '',
        start: {
          dateTime: appointment.start_time,
          timeZone: 'America/Bogota'
        },
        end: {
          dateTime: appointment.end_time,
          timeZone: 'America/Bogota'
        },
        location: appointment.location || '',
        attendees: appointment.participants?.map((p: any) => ({
          email: p.email,
          displayName: p.name
        })) || []
      };

      await calendar.events.update({
        calendarId,
        eventId: appointment.google_event_id,
        requestBody: event
      });
    } catch (error) {
      console.error('Error updating Google Calendar event:', error);
    }
  }

  // Delete Google Calendar event
  static async deleteGoogleEvent(userId: string, googleEventId: string): Promise<void> {
    try {
      const calendar = await this.getCalendarClient(userId);

      const { data: settings } = await supabase
        .from('calendar_settings')
        .select('google_calendar_id')
        .eq('user_id', userId)
        .single();

      const calendarId = settings?.google_calendar_id || 'primary';

      await calendar.events.delete({
        calendarId,
        eventId: googleEventId
      });
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error);
    }
  }

  // Sync from Google Calendar to local
  static async syncFromGoogleCalendar(userId: string): Promise<void> {
    try {
      const calendar = await this.getCalendarClient(userId);

      const { data: settings } = await supabase
        .from('calendar_settings')
        .select('google_calendar_id, last_sync')
        .eq('user_id', userId)
        .single();

      const calendarId = settings?.google_calendar_id || 'primary';
      const lastSync = settings?.last_sync;

      // Get events from Google Calendar
      const response = await calendar.events.list({
        calendarId,
        timeMin: lastSync || new Date().toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      const googleEvents = response.data.items || [];

      // Process each event
      for (const event of googleEvents) {
        if (!event.id || !event.start?.dateTime) continue;

        // Check if this event already exists in our system
        const { data: existingAppointment } = await supabase
          .from('appointments')
          .select('id')
          .eq('google_event_id', event.id)
          .single();

        if (!existingAppointment) {
          // Create new appointment from Google event
          const appointmentData = {
            title: event.summary || 'Evento de Google Calendar',
            notes: event.description || '',
            start_time: event.start.dateTime,
            end_time: event.end?.dateTime || event.start.dateTime,
            location: event.location || '',
            advisor_id: userId,
            google_event_id: event.id,
            status: 'confirmed'
          };

          await supabase.from('appointments').insert(appointmentData);
        }
      }

      // Update last sync time
      await supabase
        .from('calendar_settings')
        .update({ last_sync: new Date().toISOString() })
        .eq('user_id', userId);

    } catch (error) {
      console.error('Error syncing from Google Calendar:', error);
    }
  }

  // Get available calendars
  static async getAvailableCalendars(userId: string) {
    try {
      const calendar = await this.getCalendarClient(userId);

      const response = await calendar.calendarList.list();
      return response.data.items || [];
    } catch (error) {
      console.error('Error getting available calendars:', error);
      return [];
    }
  }

  // Set default calendar
  static async setDefaultCalendar(userId: string, calendarId: string) {
    const { error } = await supabase
      .from('calendar_settings')
      .update({
        google_calendar_id: calendarId,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;
  }
}