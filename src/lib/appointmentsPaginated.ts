// Función temporal para obtener citas de la tabla appointments
import { supabase } from './supabase';

export interface AppointmentsPaginatedResponse {
  data: any[];
  total: number;
  totalPages: number;
  hasMore: boolean;
  hasNext: boolean;
  hasPrev: boolean;
  page: number;
  limit: number;
}

export async function getAppointmentsPaginated(
  options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}
): Promise<AppointmentsPaginatedResponse> {
  try {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;

    console.log('🔍 getAppointmentsPaginated called:', { page, limit, search: options.search });

    // Consulta simple sin joins problemáticos
    let query = supabase
      .from('appointments')
      .select('*')
      .is('deleted_at', null) // Solo citas activas
      .order('start_time', { ascending: false });

    // Aplicar búsqueda si existe
    if (options.search) {
      query = query.or(`title.ilike.%${options.search}%,contact_name.ilike.%${options.search}%,contact_email.ilike.%${options.search}%`);
    }

    // Obtener el total
    const { count, error: countError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    if (countError) {
      console.error('❌ Error obteniendo total:', countError);
      throw countError;
    }

    // Aplicar paginación
    const { data, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error obteniendo citas paginadas:', error);
      throw error;
    }

    // Mapear al formato esperado por AdminAppointments
    const mappedData = (data || []).map((appointment: any) => ({
      id: appointment.id,
      client_name: appointment.contact_name || 'Sin nombre',
      client_email: appointment.contact_email,
      client_phone: appointment.contact_phone,
      appointment_date: appointment.start_time,
      appointment_type: appointment.appointment_type || 'meeting',
      status: appointment.status,
      property_id: appointment.property_id,
      advisor_id: appointment.advisor_id,
      created_at: appointment.created_at,
      updated_at: appointment.updated_at,
      title: appointment.title,
      location: appointment.location,
      notes: appointment.notes,
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);
    const hasMore = offset + limit < total;
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    console.log('✅ Citas obtenidas:', {
      total,
      returned: mappedData.length,
      hasMore,
      page,
      totalPages
    });

    return {
      data: mappedData,
      total,
      totalPages,
      hasMore,
      hasNext,
      hasPrev,
      page,
      limit
    };

  } catch (error) {
    console.error('❌ Error en getAppointmentsPaginated:', error);
    throw error;
  }
}