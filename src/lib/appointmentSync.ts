// Sistema de sincronización bidireccional entre appointments y property_appointments
import { supabase } from './supabase';

export interface PropertyAppointmentData {
  id: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  property_id?: number;
  advisor_id?: string;
  appointment_date: string;
  appointment_type?: string;
  status?: string;
  special_requests?: string;
}

export interface AppointmentData {
  id: string;
  title?: string;
  description?: string;
  start_time: string;
  end_time?: string;
  property_id?: number;
  advisor_id?: string;
  appointment_type?: string;
  status?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  property_appointment_id?: string;
}

/**
 * Sincronizar cita de property_appointments → appointments
 */
export async function syncPropertyToAppointments(propertyAppointment: PropertyAppointmentData): Promise<string | null> {
  try {
    console.log('🔄 [SYNC] Sincronizando property_appointment → appointments:', propertyAppointment.id);
    console.log('   📋 Datos:', {
      id: propertyAppointment.id,
      cliente: propertyAppointment.client_name,
      email: propertyAppointment.client_email,
      fecha: propertyAppointment.appointment_date
    });

    // Verificar si ya existe una cita sincronizada
    const { data: existing, error: existingError } = await supabase
      .from('appointments')
      .select('id')
      .eq('property_appointment_id', propertyAppointment.id)
      .maybeSingle(); // Usar maybeSingle en vez de single para evitar error si no existe

    if (existingError) {
      console.error('❌ [SYNC] Error verificando cita existente:', existingError);
      throw existingError;
    }

    if (existing) {
      console.log('✅ [SYNC] Cita ya sincronizada en appointments:', existing.id);
      return existing.id;
    }

    // Crear cita en appointments
    const appointmentData = {
      title: `Cita - ${propertyAppointment.client_name || 'Cliente'}`,
      description: propertyAppointment.special_requests || '',
      start_time: propertyAppointment.appointment_date,
      end_time: new Date(new Date(propertyAppointment.appointment_date).getTime() + 60 * 60 * 1000).toISOString(),
      all_day: false,
      property_id: propertyAppointment.property_id,
      advisor_id: propertyAppointment.advisor_id,
      location: '',
      appointment_type: mapAppointmentType(propertyAppointment.appointment_type || 'visita'),
      status: mapStatus(propertyAppointment.status || 'pending'),
      contact_name: propertyAppointment.client_name,
      contact_email: propertyAppointment.client_email,
      contact_phone: propertyAppointment.client_phone,
      reminder_sent: false,
      follow_up_required: false,
      property_appointment_id: propertyAppointment.id, // Vínculo importante
      notes: propertyAppointment.special_requests,
    };

    console.log('   💾 Insertando en appointments...');

    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single();

    if (error) {
      console.error('❌ [SYNC] Error insertando en appointments:', error);
      console.error('   📝 Código:', error.code);
      console.error('   💬 Mensaje:', error.message);
      console.error('   🔍 Detalles:', error.details);
      console.error('   💡 Hint:', error.hint);
      throw error;
    }

    console.log('✅ [SYNC] Cita sincronizada exitosamente a appointments:', data.id);
    return data.id;

  } catch (error: any) {
    console.error('❌ [SYNC] ERROR CRÍTICO en syncPropertyToAppointments');
    console.error('   📝 Mensaje:', error?.message);
    console.error('   🔍 Error completo:', error);
    
    // Lanzar el error para que el llamador lo maneje
    throw error;
  }
}

/**
 * Sincronizar cita de appointments → property_appointments
 */
export async function syncAppointmentToProperty(appointment: AppointmentData): Promise<string | null> {
  try {
    console.log('🔄 [SYNC] Sincronizando appointment → property_appointments:', appointment.id);
    console.log('   📋 Datos:', {
      id: appointment.id,
      titulo: appointment.title,
      contacto: appointment.contact_name,
      email: appointment.contact_email,
      fecha: appointment.start_time
    });

    // Verificar si ya está vinculada
    if (appointment.property_appointment_id) {
      console.log('✅ [SYNC] Appointment ya tiene property_appointment_id:', appointment.property_appointment_id);
      return appointment.property_appointment_id;
    }

    // Verificar si ya existe una cita sincronizada buscando por datos similares
    const { data: existing, error: existingError } = await supabase
      .from('property_appointments')
      .select('id')
      .eq('client_email', appointment.contact_email || '')
      .eq('appointment_date', appointment.start_time)
      .maybeSingle(); // Usar maybeSingle para evitar error si no existe

    if (existingError) {
      console.error('❌ [SYNC] Error verificando cita existente:', existingError);
      throw existingError;
    }

    if (existing) {
      console.log('✅ [SYNC] Cita similar encontrada en property_appointments:', existing.id);
      
      // Actualizar el appointment para vincular
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ property_appointment_id: existing.id })
        .eq('id', appointment.id);
      
      if (updateError) {
        console.error('❌ [SYNC] Error actualizando vínculo:', updateError);
        throw updateError;
      }
        
      return existing.id;
    }

    // Crear cita en property_appointments
    const propertyAppointmentData = {
      client_name: appointment.contact_name || 'Cliente desde calendario',
      client_email: appointment.contact_email || '',
      client_phone: appointment.contact_phone || '',
      property_id: appointment.property_id || 1, // Default si no especifica
      advisor_id: appointment.advisor_id || '',
      appointment_date: appointment.start_time,
      appointment_type: mapCalendarAppointmentType(appointment.appointment_type || 'meeting'),
      visit_type: 'presencial',
      attendees: 1,
      special_requests: appointment.notes || appointment.description || '',
      contact_method: 'whatsapp',
      marketing_consent: false,
      status: mapCalendarStatus(appointment.status || 'pending'),
    };

    console.log('   💾 Insertando en property_appointments...');

    const { data, error } = await supabase
      .from('property_appointments')
      .insert([propertyAppointmentData])
      .select()
      .single();

    if (error) {
      console.error('❌ [SYNC] Error insertando en property_appointments:', error);
      console.error('   📝 Código:', error.code);
      console.error('   💬 Mensaje:', error.message);
      console.error('   🔍 Detalles:', error.details);
      console.error('   💡 Hint:', error.hint);
      throw error;
    }

    // Actualizar appointment con el vínculo
    console.log('   🔗 Actualizando vínculo en appointment...');
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ property_appointment_id: data.id })
      .eq('id', appointment.id);

    if (updateError) {
      console.error('❌ [SYNC] Error actualizando vínculo:', updateError);
      // No lanzamos error porque la cita ya se creó
    }

    console.log('✅ [SYNC] Cita sincronizada exitosamente a property_appointments:', data.id);
    return data.id;

  } catch (error: any) {
    console.error('❌ [SYNC] ERROR CRÍTICO en syncAppointmentToProperty');
    console.error('   📝 Mensaje:', error?.message);
    console.error('   🔍 Error completo:', error);
    
    // Lanzar el error para que el llamador lo maneje
    throw error;
  }
}

/**
 * Eliminar cita de ambas tablas (sincronizado)
 */
export async function deleteSyncedAppointment(appointmentId: string, source: 'appointments' | 'property_appointments' = 'appointments'): Promise<boolean> {
  try {
    console.log(`🗑️ Eliminando cita sincronizada desde ${source}:`, appointmentId);

    if (source === 'appointments') {
      // Obtener la cita y su vínculo
      const { data: appointment } = await supabase
        .from('appointments')
        .select('property_appointment_id')
        .eq('id', appointmentId)
        .maybeSingle();

      // Soft delete en appointments
      await supabase
        .from('appointments')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', appointmentId);

      // Soft delete en property_appointments si está vinculada
      if (appointment?.property_appointment_id) {
        await supabase
          .from('property_appointments')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', appointment.property_appointment_id);
      }

    } else {
      // Eliminar desde property_appointments
      await supabase
        .from('property_appointments')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', appointmentId);

      // Eliminar appointment vinculada
      await supabase
        .from('appointments')
        .update({ deleted_at: new Date().toISOString() })
        .eq('property_appointment_id', appointmentId);
    }

    console.log('✅ Citas eliminadas en ambas tablas');
    return true;

  } catch (error) {
    console.error('❌ Error en deleteSyncedAppointment:', error);
    return false;
  }
}

// Funciones auxiliares de mapeo
function mapAppointmentType(propertyType: string): string {
  const mapping: Record<string, string> = {
    'visita': 'viewing',
    'consulta': 'consultation',
    'valuacion': 'valuation',
    'seguimiento': 'follow_up',
  };
  return mapping[propertyType] || 'meeting';
}

function mapCalendarAppointmentType(calendarType: string): string {
  const mapping: Record<string, string> = {
    'viewing': 'visita',
    'consultation': 'consulta',
    'valuation': 'valuacion',
    'follow_up': 'seguimiento',
    'meeting': 'visita',
  };
  return mapping[calendarType] || 'visita';
}

function mapStatus(propertyStatus: string): string {
  const mapping: Record<string, string> = {
    'pending': 'pending',
    'confirmed': 'confirmed',
    'completed': 'completed',
    'cancelled': 'cancelled',
    'no_show': 'no_show',
    'rescheduled': 'rescheduled',
  };
  return mapping[propertyStatus] || 'pending';
}

function mapCalendarStatus(calendarStatus: string): string {
  const mapping: Record<string, string> = {
    'pending': 'pending',
    'confirmed': 'confirmed',
    'completed': 'completed',
    'cancelled': 'cancelled',
    'no_show': 'no_show',
    'rescheduled': 'rescheduled',
  };
  return mapping[calendarStatus] || 'pending';
}

export const appointmentSync = {
  syncPropertyToAppointments,
  syncAppointmentToProperty,
  deleteSyncedAppointment,
};