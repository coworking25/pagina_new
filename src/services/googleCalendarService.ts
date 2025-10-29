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
  // Token management - now using Supabase directly
  static async saveGoogleTokens(userId: string, tokens: any) {
    // Save tokens as JSON in calendar_settings using key-value system
    const { error } = await supabase
      .from('calendar_settings')
      .upsert([
        {
          setting_key: `google_tokens_${userId}`,
          setting_value: JSON.stringify(tokens),
        },
        {
          setting_key: `google_calendar_enabled_${userId}`,
          setting_value: 'true',
        }
      ], { onConflict: 'setting_key' });

    if (error) throw error;
  }

  static async getGoogleTokens(userId: string) {
    const { data, error } = await supabase
      .from('calendar_settings')
      .select('setting_value')
      .eq('setting_key', `google_tokens_${userId}`)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? JSON.parse(data.setting_value) : null;
  }

  static async revokeGoogleAccess(userId: string) {
    // Update the enabled flag and clear tokens
    const { error: updateError } = await supabase
      .from('calendar_settings')
      .upsert({
        setting_key: `google_calendar_enabled_${userId}`,
        setting_value: 'false',
      }, { onConflict: 'setting_key' });

    if (updateError) throw updateError;

    // Clear tokens
    const { error: deleteError } = await supabase
      .from('calendar_settings')
      .delete()
      .eq('setting_key', `google_tokens_${userId}`);

    if (deleteError) throw deleteError;
  }

  // Call Edge Function for Google Calendar operations
  private static async callEdgeFunction(action: string, userId: string, data?: any) {
    const { data: result, error } = await supabase.functions.invoke('google-calendar', {
      body: {
        action,
        userId,
        data
      },
    });

    if (error) {
      console.error(`Google Calendar ${action} error:`, error);
      throw new Error(error.message || `Error in ${action}`);
    }

    if (result?.error) {
      throw new Error(result.error);
    }

    return result?.data;
  }

  // Sync appointment to Google Calendar
  static async createGoogleEvent(userId: string, appointment: any): Promise<string | null> {
    try {
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

      const result = await this.callEdgeFunction('create_event', userId, { event });
      return result?.id || null;
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      return null;
    }
  }

  // Update Google Calendar event
  static async updateGoogleEvent(userId: string, appointment: any): Promise<void> {
    try {
      if (!appointment.google_event_id) return;

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

      await this.callEdgeFunction('update_event', userId, {
        eventId: appointment.google_event_id,
        event
      });
    } catch (error) {
      console.error('Error updating Google Calendar event:', error);
    }
  }

  // Delete Google Calendar event
  static async deleteGoogleEvent(userId: string, googleEventId: string): Promise<void> {
    try {
      await this.callEdgeFunction('delete_event', userId, { eventId: googleEventId });
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error);
    }
  }

  // Sync from Google Calendar to local
  static async syncFromGoogleCalendar(userId: string): Promise<void> {
    try {
      // Get last sync time
      const { data: settings } = await supabase
        .from('calendar_settings')
        .select('setting_value')
        .eq('setting_key', `last_sync_${userId}`)
        .single();

      const lastSync = settings ? settings.setting_value : null;
      const result = await this.callEdgeFunction('sync_events', userId, { lastSync });

      const googleEvents = result?.items || [];

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
        .upsert({
          setting_key: `last_sync_${userId}`,
          setting_value: new Date().toISOString(),
        }, { onConflict: 'setting_key' });

    } catch (error) {
      console.error('Error syncing from Google Calendar:', error);
    }
  }

  // Get available calendars
  static async getAvailableCalendars(userId: string) {
    try {
      const result = await this.callEdgeFunction('get_calendars', userId);
      return result?.items || [];
    } catch (error) {
      console.error('Error getting available calendars:', error);
      return [];
    }
  }

  // Set default calendar
  static async setDefaultCalendar(userId: string, calendarId: string) {
    const { error } = await supabase
      .from('calendar_settings')
      .upsert({
        setting_key: `google_calendar_id_${userId}`,
        setting_value: calendarId,
      }, { onConflict: 'setting_key' });

    if (error) throw error;
  }

  // Test connection
  static async testConnection(userId: string) {
    try {
      const result = await this.callEdgeFunction('test_connection', userId);
      return result?.connected || false;
    } catch (error) {
      console.error('Error testing Google Calendar connection:', error);
      return false;
    }
  }
}