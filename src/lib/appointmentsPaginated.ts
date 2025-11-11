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
    statusFilter?: string;
    dateFilter?: string;
  } = {}
): Promise<AppointmentsPaginatedResponse> {
  try {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;

    console.log('🔍 getAppointmentsPaginated called:', { 
      page, 
      limit, 
      search: options.search,
      statusFilter: options.statusFilter,
      dateFilter: options.dateFilter
    });

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

    // Aplicar filtro de estado si existe
    if (options.statusFilter && options.statusFilter !== 'all') {
      query = query.eq('status', options.statusFilter);
    }

    // Aplicar filtro de fecha si existe
    if (options.dateFilter && options.dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (options.dateFilter) {
        case 'today':
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          query = query
            .gte('start_time', today.toISOString())
            .lt('start_time', tomorrow.toISOString());
          break;
        
        case 'week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay()); // Inicio de semana (domingo)
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);
          query = query
            .gte('start_time', weekStart.toISOString())
            .lt('start_time', weekEnd.toISOString());
          break;
        
        case 'month':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          query = query
            .gte('start_time', monthStart.toISOString())
            .lt('start_time', monthEnd.toISOString());
          break;
      }
    }

    // Construir la consulta de conteo con los mismos filtros
    let countQuery = supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // Aplicar los mismos filtros a la consulta de conteo
    if (options.search) {
      countQuery = countQuery.or(`title.ilike.%${options.search}%,contact_name.ilike.%${options.search}%,contact_email.ilike.%${options.search}%`);
    }

    if (options.statusFilter && options.statusFilter !== 'all') {
      countQuery = countQuery.eq('status', options.statusFilter);
    }

    if (options.dateFilter && options.dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (options.dateFilter) {
        case 'today':
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          countQuery = countQuery
            .gte('start_time', today.toISOString())
            .lt('start_time', tomorrow.toISOString());
          break;
        
        case 'week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);
          countQuery = countQuery
            .gte('start_time', weekStart.toISOString())
            .lt('start_time', weekEnd.toISOString());
          break;
        
        case 'month':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          countQuery = countQuery
            .gte('start_time', monthStart.toISOString())
            .lt('start_time', monthEnd.toISOString());
          break;
      }
    }

    // Obtener el total con filtros aplicados
    const { count, error: countError } = await countQuery;

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