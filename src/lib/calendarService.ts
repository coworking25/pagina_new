import { supabase } from './supabase';
import { GoogleCalendarService } from '../services/googleCalendarService';
import { syncAppointmentToProperty, deleteSyncedAppointment } from './appointmentSync';

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  client_id?: string;
  advisor_id?: string;
  property_id?: string;
  location?: string;
  appointment_type: 'meeting' | 'viewing' | 'consultation' | 'valuation' | 'follow_up' | 'other';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  google_event_id?: string;
  google_calendar_id?: string;
  last_synced_at?: string;
  reminder_sent: boolean;
  reminder_sent_at?: string;
  notes?: string;
  internal_notes?: string;
  follow_up_required: boolean;
  follow_up_notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AdvisorAvailability {
  id: string;
  advisor_id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface AvailabilityException {
  id: string;
  advisor_id: string;
  exception_date: string;
  is_available: boolean;
  start_time?: string;
  end_time?: string;
  reason?: string;
}

export interface CalendarSettings {
  googleCalendarEnabled: boolean;
  googleCalendarId?: string;
  defaultAppointmentDuration: number;
  reminderHoursBefore: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  timezone: string;
}

export interface CreateAppointmentData {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day?: boolean;
  client_id?: string;
  advisor_id?: string;
  property_id?: string;
  location?: string;
  appointment_type?: Appointment['appointment_type'];
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  internal_notes?: string;
  follow_up_required?: boolean;
  created_by?: string;
}

export interface AppointmentFilters {
  advisor_id?: string;
  client_id?: string;
  property_id?: string;
  status?: Appointment['status'];
  appointment_type?: Appointment['appointment_type'];
  start_date?: string;
  end_date?: string;
}

/**
 * Servicio de calendario para gestión de citas y sincronización con Google Calendar
 */
export class CalendarService {
  private static instance: CalendarService;
  private isGoogleConfigured: boolean = false;

  private constructor() {
    this.initializeGoogleCalendar();
  }

  public static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  /**
   * Inicializar Google Calendar API
   */
  private async initializeGoogleCalendar(): Promise<void> {
    try {
      const settings = await this.getCalendarSettings();

      if (settings.googleCalendarEnabled) {
        // En el navegador, necesitaríamos usar una Edge Function
        // Por ahora, solo marcamos como configurado
        this.isGoogleConfigured = true;
        console.log('📅 Google Calendar configurado (modo simulación)');
      }
    } catch (error) {
      console.warn('⚠️ Error inicializando Google Calendar:', error);
    }
  }

  // =====================================================
  // GESTIÓN DE CITAS (APPOINTMENTS)
  // =====================================================

  /**
   * Obtener todas las citas con filtros opcionales
   */
  public async getAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
    try {
      // 🔧 Consulta simple sin joins para evitar error 406
      let query = supabase
        .from('appointments')
        .select('*')
        .is('deleted_at', null) // ✅ Filtrar citas eliminadas
        .order('start_time', { ascending: true });

      if (filters) {
        if (filters.advisor_id) {
          query = query.eq('advisor_id', filters.advisor_id);
        }
        if (filters.client_id) {
          query = query.eq('client_id', filters.client_id);
        }
        if (filters.property_id) {
          query = query.eq('property_id', filters.property_id);
        }
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.appointment_type) {
          query = query.eq('appointment_type', filters.appointment_type);
        }
        if (filters.start_date) {
          query = query.gte('start_time', filters.start_date);
        }
        if (filters.end_date) {
          query = query.lte('start_time', filters.end_date);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error obteniendo citas:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error en getAppointments:', error);
      throw error;
    }
  }

  /**
   * Obtener cita por ID
   */
  public async getAppointmentById(id: string): Promise<Appointment | null> {
    try {
      // 🔧 Consulta simple sin joins para evitar error 406
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null) // ✅ Solo citas no eliminadas
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No encontrado
        console.error('❌ Error obteniendo cita:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error en getAppointmentById:', error);
      throw error;
    }
  }

  /**
   * Crear nueva cita con validaciones
   */
  public async createAppointment(appointmentData: CreateAppointmentData): Promise<Appointment> {
    try {
      // Obtener el usuario autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuario no autenticado');
      }

      // Validar conflictos de horario si hay asesor asignado
      if (appointmentData.advisor_id) {
        const hasConflict = await this.checkAppointmentConflicts(
          appointmentData.advisor_id,
          appointmentData.start_time,
          appointmentData.end_time
        );

        if (hasConflict) {
          throw new Error('Conflicto de horario: El asesor ya tiene una cita programada en este horario');
        }
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          ...appointmentData,
          created_by: user.id,
          status: 'pending',
          reminder_sent: false,
          follow_up_required: appointmentData.follow_up_required || false,
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando cita:', error);
        throw error;
      }

      console.log('✅ Cita creada exitosamente:', data.id);

      // 🔄 SINCRONIZACIÓN AUTOMÁTICA: Guardar también en property_appointments
      try {
        console.log('🔄 [SYNC CALENDAR→PROPERTY] Iniciando sincronización...');
        console.log('   📋 Appointment ID:', data.id);
        console.log('   📅 Título:', data.title);
        
        const syncResult = await syncAppointmentToProperty(data);
        
        if (syncResult) {
          console.log('✅ [SYNC CALENDAR→PROPERTY] Cita sincronizada exitosamente');
          console.log('   🆔 Property Appointment ID creado:', syncResult);
        } else {
          console.warn('⚠️ [SYNC CALENDAR→PROPERTY] Sincronización retornó null');
        }
      } catch (syncError: any) {
        console.error('❌ [SYNC CALENDAR→PROPERTY] ERROR CRÍTICO EN SINCRONIZACIÓN');
        console.error('   📝 Mensaje:', syncError.message);
        console.error('   🔍 Detalles:', syncError);
        console.error('   🆔 Appointment ID:', data.id);
        
        // 🚨 IMPORTANTE: Lanzar el error para que el usuario sepa que falló
        throw new Error(`La cita se guardó en el calendario pero no se pudo sincronizar: ${syncError.message}`);
      }

      // Sincronizar con Google Calendar si está habilitado
      if (this.isGoogleConfigured && data.advisor_id) {
        await this.syncAppointmentToGoogle(data);
      }

      return data;
    } catch (error) {
      console.error('❌ Error en createAppointment:', error);
      throw error;
    }
  }

  /**
   * Actualizar cita existente
   */
  public async updateAppointment(id: string, updates: Partial<CreateAppointmentData & {
    status?: Appointment['status'];
    reminder_sent?: boolean;
    reminder_sent_at?: string;
    follow_up_notes?: string;
  }>): Promise<Appointment> {
    try {
      // Si se cambia el horario y hay asesor, validar conflictos
      if ((updates.start_time || updates.end_time) && updates.advisor_id) {
        const appointment = await this.getAppointmentById(id);
        if (appointment) {
          const startTime = updates.start_time || appointment.start_time;
          const endTime = updates.end_time || appointment.end_time;
          const advisorId = updates.advisor_id || appointment.advisor_id;

          if (advisorId) {
            const hasConflict = await this.checkAppointmentConflicts(
              advisorId,
              startTime,
              endTime,
              id // Excluir esta cita de la verificación
            );

            if (hasConflict) {
              throw new Error('Conflicto de horario: El asesor ya tiene una cita programada en este horario');
            }
          }
        }
      }

      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando cita:', error);
        throw error;
      }

      console.log('✅ Cita actualizada exitosamente:', data.id);

      // Sincronizar con Google Calendar si está habilitado
      if (this.isGoogleConfigured) {
        await this.syncAppointmentToGoogle(data);
      }

      return data;
    } catch (error) {
      console.error('❌ Error en updateAppointment:', error);
      throw error;
    }
  }

  /**
   * Eliminar cita con sincronización automática
   */
  public async deleteAppointment(id: string): Promise<boolean> {
    try {
      // Obtener la cita antes de eliminarla para limpiar Google Calendar
      const appointment = await this.getAppointmentById(id);

      // 🗑️ ELIMINACIÓN SINCRONIZADA: Eliminar de ambas tablas
      const success = await deleteSyncedAppointment(id, 'appointments');
      
      if (!success) {
        throw new Error('Error en eliminación sincronizada');
      }

      console.log('✅ Cita eliminada exitosamente de ambas tablas:', id);

      // Eliminar de Google Calendar si existe
      if (this.isGoogleConfigured && appointment?.google_event_id && appointment?.advisor_id) {
        await this.deleteAppointmentFromGoogle(appointment.google_event_id, appointment.advisor_id);
      }

      return true;
    } catch (error) {
      console.error('❌ Error en deleteAppointment:', error);
      throw error;
    }
  }

  /**
   * Verificar conflictos de horario
   */
  public async checkAppointmentConflicts(
    advisorId: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    try {
      let query = supabase
        .from('appointments')
        .select('id')
        .eq('advisor_id', advisorId)
        .neq('status', 'cancelled')
        .neq('status', 'completed')
        .or(`and(start_time.lte.${startTime},end_time.gt.${startTime}),and(start_time.lt.${endTime},end_time.gte.${endTime}),and(start_time.gte.${startTime},end_time.lte.${endTime})`);

      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error verificando conflictos:', error);
        throw error;
      }

      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('❌ Error en checkAppointmentConflicts:', error);
      throw error;
    }
  }

  // =====================================================
  // GESTIÓN DE DISPONIBILIDAD
  // =====================================================

  /**
   * Obtener disponibilidad de un asesor
   */
  public async getAdvisorAvailability(advisorId: string): Promise<AdvisorAvailability[]> {
    try {
      const { data, error } = await supabase
        .from('advisor_availability')
        .select('*')
        .eq('advisor_id', advisorId)
        .order('day_of_week');

      if (error) {
        console.error('❌ Error obteniendo disponibilidad:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error en getAdvisorAvailability:', error);
      throw error;
    }
  }

  /**
   * Actualizar disponibilidad de asesor
   */
  public async updateAdvisorAvailability(
    advisorId: string,
    availability: Omit<AdvisorAvailability, 'id' | 'advisor_id'>[]
  ): Promise<AdvisorAvailability[]> {
    try {
      // Primero eliminar la disponibilidad existente
      await supabase
        .from('advisor_availability')
        .delete()
        .eq('advisor_id', advisorId);

      // Insertar la nueva disponibilidad
      const availabilityData = availability.map(item => ({
        ...item,
        advisor_id: advisorId,
      }));

      const { data, error } = await supabase
        .from('advisor_availability')
        .insert(availabilityData)
        .select();

      if (error) {
        console.error('❌ Error actualizando disponibilidad:', error);
        throw error;
      }

      console.log('✅ Disponibilidad actualizada exitosamente');
      return data || [];
    } catch (error) {
      console.error('❌ Error en updateAdvisorAvailability:', error);
      throw error;
    }
  }

  /**
   * Obtener excepciones de disponibilidad
   */
  public async getAvailabilityExceptions(
    advisorId: string,
    startDate?: string,
    endDate?: string
  ): Promise<AvailabilityException[]> {
    try {
      let query = supabase
        .from('availability_exceptions')
        .select('*')
        .eq('advisor_id', advisorId)
        .order('exception_date');

      if (startDate) {
        query = query.gte('exception_date', startDate);
      }
      if (endDate) {
        query = query.lte('exception_date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error obteniendo excepciones:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error en getAvailabilityExceptions:', error);
      throw error;
    }
  }

  // =====================================================
  // CONFIGURACIÓN Y SETTINGS
  // =====================================================

  /**
   * Obtener configuración del calendario
   */
  public async getCalendarSettings(): Promise<CalendarSettings> {
    try {
      const { data, error } = await supabase
        .from('calendar_settings')
        .select('setting_key, setting_value');

      if (error) {
        console.error('❌ Error obteniendo configuración:', error);
        throw error;
      }

      // Convertir a objeto CalendarSettings
      const settings: any = {};
      data.forEach(item => {
        switch (item.setting_key) {
          case 'google_calendar_enabled':
            settings.googleCalendarEnabled = item.setting_value === 'true';
            break;
          case 'google_calendar_id':
            settings.googleCalendarId = item.setting_value;
            break;
          case 'default_appointment_duration':
            settings.defaultAppointmentDuration = parseInt(item.setting_value) || 60;
            break;
          case 'reminder_hours_before':
            settings.reminderHoursBefore = parseInt(item.setting_value) || 24;
            break;
          case 'working_hours_start':
            settings.workingHoursStart = item.setting_value || '08:00';
            break;
          case 'working_hours_end':
            settings.workingHoursEnd = item.setting_value || '18:00';
            break;
          case 'timezone':
            settings.timezone = item.setting_value || 'America/Bogota';
            break;
        }
      });

      return settings;
    } catch (error) {
      console.error('❌ Error en getCalendarSettings:', error);
      // Retornar configuración por defecto en caso de error
      return {
        googleCalendarEnabled: false,
        defaultAppointmentDuration: 60,
        reminderHoursBefore: 24,
        workingHoursStart: '08:00',
        workingHoursEnd: '18:00',
        timezone: 'America/Bogota',
      };
    }
  }

  /**
   * Actualizar configuración del calendario
   */
  public async updateCalendarSettings(settings: Partial<CalendarSettings>): Promise<void> {
    try {
      const updates: any[] = [];

      if (settings.googleCalendarEnabled !== undefined) {
        updates.push({
          setting_key: 'google_calendar_enabled',
          setting_value: settings.googleCalendarEnabled.toString(),
        });
      }

      if (settings.googleCalendarId !== undefined) {
        updates.push({
          setting_key: 'google_calendar_id',
          setting_value: settings.googleCalendarId,
        });
      }

      if (settings.defaultAppointmentDuration !== undefined) {
        updates.push({
          setting_key: 'default_appointment_duration',
          setting_value: settings.defaultAppointmentDuration.toString(),
        });
      }

      if (settings.reminderHoursBefore !== undefined) {
        updates.push({
          setting_key: 'reminder_hours_before',
          setting_value: settings.reminderHoursBefore.toString(),
        });
      }

      if (settings.workingHoursStart !== undefined) {
        updates.push({
          setting_key: 'working_hours_start',
          setting_value: settings.workingHoursStart,
        });
      }

      if (settings.workingHoursEnd !== undefined) {
        updates.push({
          setting_key: 'working_hours_end',
          setting_value: settings.workingHoursEnd,
        });
      }

      if (settings.timezone !== undefined) {
        updates.push({
          setting_key: 'timezone',
          setting_value: settings.timezone,
        });
      }

      if (updates.length > 0) {
        const { error } = await supabase
          .from('calendar_settings')
          .upsert(updates, { onConflict: 'setting_key' });

        if (error) {
          console.error('❌ Error actualizando configuración:', error);
          throw error;
        }

        console.log('✅ Configuración actualizada exitosamente');
      }
    } catch (error) {
      console.error('❌ Error en updateCalendarSettings:', error);
      throw error;
    }
  }

  // =====================================================
  // GOOGLE CALENDAR INTEGRATION
  // =====================================================

  /**
   * Sincronizar cita con Google Calendar
   */
  private async syncAppointmentToGoogle(appointment: Appointment): Promise<void> {
    try {
      if (!this.isGoogleConfigured || !appointment.advisor_id) return;

      console.log('📅 Sincronizando cita con Google Calendar:', appointment.id);

      // Crear o actualizar evento en Google Calendar
      let googleEventId: string | undefined = appointment.google_event_id;

      if (googleEventId) {
        // Actualizar evento existente
        await GoogleCalendarService.updateGoogleEvent(appointment.advisor_id, appointment);
      } else {
        // Crear nuevo evento
        const newEventId = await GoogleCalendarService.createGoogleEvent(appointment.advisor_id, appointment);

        // Actualizar la cita con el ID del evento de Google
        if (newEventId) {
          googleEventId = newEventId;
          await supabase
            .from('appointments')
            .update({
              google_event_id: googleEventId,
              last_synced_at: new Date().toISOString(),
            })
            .eq('id', appointment.id);
        }
      }

    } catch (error) {
      console.warn('⚠️ Error sincronizando con Google Calendar:', error);
    }
  }

  /**
   * Eliminar cita de Google Calendar
   */
  private async deleteAppointmentFromGoogle(googleEventId: string, advisorId: string): Promise<void> {
    try {
      if (!this.isGoogleConfigured || !advisorId) return;

      console.log('📅 Eliminando evento de Google Calendar:', googleEventId);

      await GoogleCalendarService.deleteGoogleEvent(advisorId, googleEventId);

    } catch (error) {
      console.warn('⚠️ Error eliminando de Google Calendar:', error);
    }
  }

  /**
   * Obtener citas de Google Calendar
   */
  public async syncFromGoogleCalendar(userId: string): Promise<void> {
    try {
      if (!this.isGoogleConfigured) return;

      console.log('📅 Sincronizando desde Google Calendar...');

      await GoogleCalendarService.syncFromGoogleCalendar(userId);

    } catch (error) {
      console.warn('⚠️ Error sincronizando desde Google Calendar:', error);
    }
  }
}

// Exportar instancia singleton
export const calendarService = CalendarService.getInstance();