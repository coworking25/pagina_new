/**
 * 🔄 Servicio de Sincronización de Citas
 * 
 * Sincroniza automáticamente entre:
 * - property_appointments (citas desde la página web)
 * - appointments (sistema de calendario avanzado)
 * 
 * Asegura que ambos sistemas estén siempre en sync
 */

import { supabase } from '../lib/supabase';
import { calendarService, CreateAppointmentData } from '../lib/calendarService';
import { PropertyAppointment } from '../types';

export interface SyncResult {
  success: boolean;
  synced_id?: string;
  error?: string;
}

/**
 * Sincronizar una PropertyAppointment hacia la tabla appointments
 */
export async function syncPropertyAppointmentToCalendar(
  propertyAppointment: PropertyAppointment
): Promise<SyncResult> {
  try {
    console.log('🔄 Sincronizando property_appointment a calendario:', propertyAppointment.id);

    // 1️⃣ Verificar si ya existe una cita sincronizada
    const { data: existingAppointment } = await supabase
      .from('appointments')
      .select('id')
      .eq('property_appointment_id', propertyAppointment.id)
      .single();

    // 2️⃣ Obtener información de la propiedad
    let propertyTitle = 'Propiedad';
    let propertyLocation = '';
    
    if (propertyAppointment.property_id) {
      const { data: property } = await supabase
        .from('properties')
        .select('title, location')
        .eq('id', propertyAppointment.property_id)
        .single();
      
      if (property) {
        propertyTitle = property.title;
        propertyLocation = property.location || '';
      }
    }

    // 3️⃣ Calcular hora de fin (1 hora después por defecto)
    const startTime = new Date(propertyAppointment.appointment_date);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);

    // 4️⃣ Preparar datos para el calendario
    const appointmentData: CreateAppointmentData = {
      title: `Cita - ${propertyTitle}`,
      description: propertyAppointment.special_requests || `Cita agendada desde la web para ${propertyTitle}`,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      all_day: false,
      client_id: undefined, // property_appointments no tiene client_id FK
      advisor_id: propertyAppointment.advisor_id,
      property_id: propertyAppointment.property_id ? String(propertyAppointment.property_id) : undefined,
      location: propertyLocation,
      appointment_type: propertyAppointment.appointment_type as any || 'viewing',
      contact_name: propertyAppointment.client_name,
      contact_email: propertyAppointment.client_email,
      contact_phone: propertyAppointment.client_phone,
      notes: propertyAppointment.special_requests || '',
      internal_notes: `Sincronizada desde property_appointment #${propertyAppointment.id}`,
      follow_up_required: false,
    };

    // 5️⃣ Crear o actualizar en appointments
    if (existingAppointment) {
      // Actualizar existente
      const updated = await calendarService.updateAppointment(
        existingAppointment.id,
        appointmentData
      );

      console.log('✅ Cita actualizada en calendario:', updated.id);
      return { success: true, synced_id: updated.id };
    } else {
      // Crear nueva
      const created = await calendarService.createAppointment(appointmentData);

      // Guardar referencia en appointments para tracking
      await supabase
        .from('appointments')
        .update({ property_appointment_id: propertyAppointment.id })
        .eq('id', created.id);

      console.log('✅ Cita creada en calendario:', created.id);
      return { success: true, synced_id: created.id };
    }

  } catch (error: any) {
    console.error('❌ Error sincronizando a calendario:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Sincronizar cambio de estado de PropertyAppointment a Calendar
 */
export async function syncPropertyAppointmentStatus(
  propertyAppointmentId: string,
  newStatus: PropertyAppointment['status']
): Promise<SyncResult> {
  try {
    console.log('🔄 Sincronizando estado:', propertyAppointmentId, newStatus);

    // Buscar la cita en appointments
    const { data: calendarAppointment } = await supabase
      .from('appointments')
      .select('id')
      .eq('property_appointment_id', propertyAppointmentId)
      .single();

    if (!calendarAppointment) {
      console.warn('⚠️ No se encontró cita sincronizada en calendario');
      return { success: false, error: 'No encontrada en calendario' };
    }

    // Mapear estados
    const statusMap: Record<string, any> = {
      'pending': 'scheduled',
      'confirmed': 'confirmed',
      'completed': 'completed',
      'cancelled': 'cancelled',
      'no_show': 'no_show',
      'rescheduled': 'scheduled',
    };

    const calendarStatus = statusMap[newStatus || 'pending'] || 'scheduled';

    // Actualizar en appointments
    await calendarService.updateAppointment(calendarAppointment.id, {
      status: calendarStatus,
    });

    console.log('✅ Estado sincronizado en calendario');
    return { success: true, synced_id: calendarAppointment.id };

  } catch (error: any) {
    console.error('❌ Error sincronizando estado:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Eliminar cita del calendario cuando se elimina de property_appointments
 */
export async function syncPropertyAppointmentDeletion(
  propertyAppointmentId: string
): Promise<SyncResult> {
  try {
    console.log('🗑️ Sincronizando eliminación:', propertyAppointmentId);

    // Buscar la cita en appointments
    const { data: calendarAppointment } = await supabase
      .from('appointments')
      .select('id')
      .eq('property_appointment_id', propertyAppointmentId)
      .single();

    if (!calendarAppointment) {
      console.warn('⚠️ No se encontró cita sincronizada en calendario');
      return { success: true }; // No hay nada que eliminar
    }

    // Eliminar de appointments
    await calendarService.deleteAppointment(calendarAppointment.id);

    console.log('✅ Cita eliminada del calendario');
    return { success: true, synced_id: calendarAppointment.id };

  } catch (error: any) {
    console.error('❌ Error sincronizando eliminación:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Sincronizar TODAS las property_appointments existentes al calendario
 * Útil para migración inicial o sincronización masiva
 */
export async function syncAllPropertyAppointmentsToCalendar(): Promise<{
  total: number;
  synced: number;
  failed: number;
  errors: string[];
}> {
  try {
    console.log('🔄 Iniciando sincronización masiva...');

    // Obtener todas las property_appointments activas
    const { data: propertyAppointments, error } = await supabase
      .from('property_appointments')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!propertyAppointments || propertyAppointments.length === 0) {
      console.log('ℹ️ No hay citas para sincronizar');
      return { total: 0, synced: 0, failed: 0, errors: [] };
    }

    const results = {
      total: propertyAppointments.length,
      synced: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Sincronizar cada cita
    for (const appointment of propertyAppointments) {
      const result = await syncPropertyAppointmentToCalendar(appointment);
      
      if (result.success) {
        results.synced++;
      } else {
        results.failed++;
        results.errors.push(`${appointment.id}: ${result.error}`);
      }

      // Pequeña pausa para no sobrecargar
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('✅ Sincronización masiva completada:', results);
    return results;

  } catch (error: any) {
    console.error('❌ Error en sincronización masiva:', error);
    throw error;
  }
}

/**
 * Obtener todas las citas combinadas (property_appointments + appointments)
 * para mostrar en el calendario
 */
export async function getCombinedAppointments(filters?: {
  advisor_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<any[]> {
  try {
    console.log('📅 Obteniendo citas combinadas con filtros:', filters);

    // 1️⃣ Obtener property_appointments
    let propertyQuery = supabase
      .from('property_appointments')
      .select(`
        *,
        property:properties(id, title, code, location),
        advisor:advisors(id, name, email, phone)
      `)
      .is('deleted_at', null);

    if (filters?.advisor_id) {
      propertyQuery = propertyQuery.eq('advisor_id', filters.advisor_id);
    }
    
    // 🔧 FIX: Aplicar filtros de fecha correctamente
    if (filters?.start_date && filters?.end_date) {
      // Usar rango de fechas con and
      propertyQuery = propertyQuery
        .gte('appointment_date', filters.start_date)
        .lte('appointment_date', filters.end_date);
    } else if (filters?.start_date) {
      propertyQuery = propertyQuery.gte('appointment_date', filters.start_date);
    } else if (filters?.end_date) {
      propertyQuery = propertyQuery.lte('appointment_date', filters.end_date);
    }

    const { data: propertyAppointments, error: propertyError } = await propertyQuery;
    
    if (propertyError) {
      console.error('❌ Error obteniendo property_appointments:', propertyError);
      // No fallar, continuar con appointments del calendario
    }

    // 2️⃣ Obtener appointments del calendario
    const calendarAppointments = await calendarService.getAppointments(filters);

    // 3️⃣ Convertir property_appointments a formato unificado
    const unifiedPropertyAppointments = (propertyAppointments || []).map(apt => ({
      id: apt.id,
      title: apt.property?.title ? `Cita - ${apt.property.title}` : 'Cita Web',
      start: new Date(apt.appointment_date),
      end: new Date(new Date(apt.appointment_date).getTime() + 60 * 60 * 1000), // +1 hora
      source: 'property_appointment',
      appointment_type: apt.appointment_type,
      status: apt.status,
      contact_name: apt.client_name,
      contact_phone: apt.client_phone,
      contact_email: apt.client_email,
      advisor_id: apt.advisor_id,
      advisor_name: apt.advisor?.name,
      property_id: apt.property_id,
      property_title: apt.property?.title,
      location: apt.property?.location,
      notes: apt.special_requests,
      all_day: false,
    }));

    // 4️⃣ Convertir appointments del calendario a formato unificado
    const unifiedCalendarAppointments = calendarAppointments.map(apt => ({
      id: apt.id,
      title: apt.title,
      start: new Date(apt.start_time),
      end: new Date(apt.end_time),
      source: 'calendar_appointment',
      appointment_type: apt.appointment_type,
      status: apt.status,
      contact_name: apt.contact_name,
      contact_phone: apt.contact_phone,
      contact_email: apt.contact_email,
      advisor_id: apt.advisor_id,
      property_id: apt.property_id,
      location: apt.location,
      notes: apt.notes,
      all_day: apt.all_day,
      internal_notes: apt.internal_notes,
      follow_up_required: apt.follow_up_required,
    }));

    // 5️⃣ Combinar y ordenar por fecha
    const combined = [...unifiedPropertyAppointments, ...unifiedCalendarAppointments]
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    console.log('✅ Citas combinadas obtenidas:', {
      property_appointments: unifiedPropertyAppointments.length,
      calendar_appointments: unifiedCalendarAppointments.length,
      total: combined.length,
    });

    return combined;

  } catch (error) {
    console.error('❌ Error obteniendo citas combinadas:', error);
    throw error;
  }
}

// ==========================================
// HOOKS PARA SINCRONIZACIÓN AUTOMÁTICA
// ==========================================

/**
 * Hook para sincronizar automáticamente al crear una property_appointment
 */
export async function onPropertyAppointmentCreated(
  propertyAppointment: PropertyAppointment
): Promise<void> {
  console.log('🔔 Hook: Nueva property_appointment creada');
  await syncPropertyAppointmentToCalendar(propertyAppointment);
}

/**
 * Hook para sincronizar automáticamente al actualizar una property_appointment
 */
export async function onPropertyAppointmentUpdated(
  propertyAppointment: PropertyAppointment
): Promise<void> {
  console.log('🔔 Hook: Property_appointment actualizada');
  await syncPropertyAppointmentToCalendar(propertyAppointment);
}

/**
 * Hook para sincronizar automáticamente al cambiar estado
 */
export async function onPropertyAppointmentStatusChanged(
  propertyAppointmentId: string,
  newStatus: PropertyAppointment['status']
): Promise<void> {
  console.log('🔔 Hook: Estado de property_appointment cambiado');
  await syncPropertyAppointmentStatus(propertyAppointmentId, newStatus);
}

/**
 * Hook para sincronizar automáticamente al eliminar
 */
export async function onPropertyAppointmentDeleted(
  propertyAppointmentId: string
): Promise<void> {
  console.log('🔔 Hook: Property_appointment eliminada');
  await syncPropertyAppointmentDeletion(propertyAppointmentId);
}

// Exportar servicio singleton
export const appointmentSyncService = {
  syncPropertyAppointmentToCalendar,
  syncPropertyAppointmentStatus,
  syncPropertyAppointmentDeletion,
  syncAllPropertyAppointmentsToCalendar,
  getCombinedAppointments,
  
  // Hooks
  onPropertyAppointmentCreated,
  onPropertyAppointmentUpdated,
  onPropertyAppointmentStatusChanged,
  onPropertyAppointmentDeleted,
};
