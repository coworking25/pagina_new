import { createClient } from '@supabase/supabase-js';
import { Property, Advisor, PropertyAppointment } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables de entorno de Supabase no configuradas. Revisa tu archivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Exponer supabase globalmente solo para debugging en desarrollo
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).supabase = supabase;
}

// ==========================================
// TIPOS PARA PAGINACIÓN
// ==========================================

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ==========================================
// FUNCIONES DE PAGINACIÓN
// ==========================================

/**
 * Función genérica para paginación con Supabase
 */
async function paginateQuery<T>(
  query: any,
  options: PaginationOptions
): Promise<PaginatedResponse<T>> {
  const { page, limit, sortBy, sortOrder = 'desc' } = options;
  const offset = (page - 1) * limit;

  // Aplicar ordenamiento si se especifica
  if (sortBy) {
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  }

  // Obtener datos paginados
  const { data, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error('❌ Error en paginateQuery:', error);
    throw error;
  }

  // Obtener el total de registros (sin paginación)
  const totalQuery = query.select('*', { count: 'exact', head: true });
  const { count: total, error: countError } = await totalQuery;

  if (countError) {
    console.error('❌ Error obteniendo total:', countError);
    throw countError;
  }

  const totalPages = Math.ceil((total || 0) / limit);

  return {
    data: data || [],
    total: total || 0,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

/**
 * Obtener propiedades con paginación
 */
export async function getPropertiesPaginated(
  options: PaginationOptions,
  onlyAvailable: boolean = false
): Promise<PaginatedResponse<Property>> {
  try {
    console.log('🔍 getPropertiesPaginated called:', { options, onlyAvailable });

    let query = supabase
      .from('properties')
      .select('*')
      .is('deleted_at', null);

    // Filtros adicionales
    if (onlyAvailable) {
      query = query.or('status.eq.rent,status.eq.sale');
    }

    // Aplicar búsqueda si existe
    if (options.search) {
      query = query.or(`title.ilike.%${options.search}%,location.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    return await paginateQuery<Property>(query, options);
  } catch (error) {
    console.error('❌ Error en getPropertiesPaginated:', error);
    throw error;
  }
}

/**
 * Obtener citas con paginación
 */
export async function getPropertyAppointmentsPaginated(
  options: PaginationOptions,
  filters?: {
    status?: string;
    advisor_id?: string;
    date_from?: string;
    date_to?: string;
  }
): Promise<PaginatedResponse<PropertyAppointment>> {
  try {
    console.log('🔍 getPropertyAppointmentsPaginated called:', { options, filters });

    let query = supabase
      .from('property_appointments')
      .select('*')
      .is('deleted_at', null);

    // Aplicar filtros
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.advisor_id) {
      query = query.eq('advisor_id', filters.advisor_id);
    }
    if (filters?.date_from) {
      query = query.gte('appointment_date', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('appointment_date', filters.date_to);
    }

    // Aplicar búsqueda si existe
    if (options.search) {
      query = query.or(`client_name.ilike.%${options.search}%,client_email.ilike.%${options.search}%`);
    }

    return await paginateQuery<PropertyAppointment>(query, options);
  } catch (error) {
    console.error('❌ Error en getPropertyAppointmentsPaginated:', error);
    throw error;
  }
}

/**
 * Obtener asesores con paginación
 */
export async function getAdvisorsPaginated(
  options: PaginationOptions
): Promise<PaginatedResponse<Advisor>> {
  try {
    console.log('🔍 getAdvisorsPaginated called:', options);

    let query = supabase
      .from('advisors')
      .select('*')
      .is('deleted_at', null);

    // Aplicar búsqueda si existe
    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,email.ilike.%${options.search}%,specialty.ilike.%${options.search}%`);
    }

    return await paginateQuery<Advisor>(query, options);
  } catch (error) {
    console.error('❌ Error en getAdvisorsPaginated:', error);
    throw error;
  }
}

// Función para guardar citas de propiedades
// Función simplificada para guardar citas sin referencias FK
export async function savePropertyAppointmentSimple(appointmentData: {
  client_name: string;
  client_email: string;
  client_phone?: string;
  property_id: number;
  advisor_id: string;
  appointment_date: string;
  appointment_type: string;
  visit_type: string;
  attendees: number;
  special_requests?: string;
  contact_method: string;
  marketing_consent: boolean;
}) {
  try {
    // Crear objeto que coincida exactamente con la tabla creada
    const simpleData = {
      client_name: appointmentData.client_name,
      client_email: appointmentData.client_email,
      client_phone: appointmentData.client_phone || null,
      property_id: appointmentData.property_id, // VARCHAR en la tabla
      advisor_id: appointmentData.advisor_id, // VARCHAR en la tabla
      appointment_date: appointmentData.appointment_date,
      appointment_type: appointmentData.appointment_type,
      visit_type: appointmentData.visit_type,
      attendees: appointmentData.attendees,
      special_requests: appointmentData.special_requests || null,
      contact_method: appointmentData.contact_method,
      marketing_consent: appointmentData.marketing_consent,
      status: 'pending' // Campo obligatorio con default
    };
    
    const { data, error } = await supabase
      .from('property_appointments')
      .insert([simpleData])
      .select();
    
    if (error) {
      console.error('❌ Error al guardar la cita:', error);
      throw error;
    }
    
    return data[0];
  } catch (error) {
    console.error('❌ Error en savePropertyAppointmentSimple:', error);
    
    // Verificar si es un error de red/conectividad
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión de red. Verifica tu conexión a internet.');
    }
    
    throw error;
  }
}

// ==========================================
// VALIDACIÓN DE DISPONIBILIDAD DE ASESORES
// ==========================================

/**
 * Verifica si un asesor está disponible en una fecha y hora específica
 * @param advisorId ID del asesor
 * @param appointmentDate Fecha y hora de la cita propuesta
 * @param excludeAppointmentId ID de cita a excluir (para ediciones)
 * @returns true si está disponible, false si ya tiene una cita
 */
export async function checkAdvisorAvailability(
  advisorId: string,
  appointmentDate: string,
  excludeAppointmentId?: number
): Promise<{ available: boolean; conflictingAppointment?: any }> {
  try {
    console.log('🔍 Verificando disponibilidad del asesor:', advisorId, 'para:', appointmentDate);

    // Convertir la fecha propuesta a objeto Date
    const proposedDate = new Date(appointmentDate);

    // Calcular el rango de tiempo - solo verificamos solapamiento directo
    // Una cita dura 1 hora, entonces verificamos ± 1 hora desde la hora propuesta
    const startTime = new Date(proposedDate);
    const endTime = new Date(proposedDate);
    endTime.setHours(endTime.getHours() + 1); // Citas duran 1 hora

    console.log('⏰ Rango de verificación:', {
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      proposed: proposedDate.toISOString()
    });

    // Consultar citas existentes del asesor en ese rango de tiempo
    // Buscamos citas que puedan solaparse con la cita propuesta
    // Si una cita existente está entre [proposedDate, proposedDate+1h), hay conflicto
    let query = supabase
      .from('property_appointments')
      .select('*')
      .eq('advisor_id', advisorId)
      .is('deleted_at', null) // Solo citas no eliminadas
      .neq('status', 'cancelled') // Excluir citas canceladas
      .gte('appointment_date', startTime.toISOString())
      .lt('appointment_date', endTime.toISOString()); // Usar lt en vez de lte

    // Si estamos editando una cita existente, excluirla de la verificación
    if (excludeAppointmentId) {
      query = query.neq('id', excludeAppointmentId);
    }

    const { data: conflictingAppointments, error } = await query;

    if (error) {
      console.error('❌ Error al verificar disponibilidad:', error);
      throw new Error('Error al verificar disponibilidad del asesor');
    }

    console.log('📅 Citas encontradas en el rango:', conflictingAppointments);

    // Si hay citas en el mismo horario, el asesor no está disponible
    if (conflictingAppointments && conflictingAppointments.length > 0) {
      console.log('❌ Asesor NO disponible - conflicto con cita existente');
      return {
        available: false,
        conflictingAppointment: conflictingAppointments[0] // Retornar la primera cita conflictiva
      };
    }

    console.log('✅ Asesor disponible');
    return { available: true };

  } catch (error) {
    console.error('❌ Error en checkAdvisorAvailability:', error);
    throw error;
  }
}

/**
 * Función mejorada para guardar citas con validación de disponibilidad
 */
export async function savePropertyAppointmentWithValidation(appointmentData: {
  client_name: string;
  client_email: string;
  client_phone?: string;
  property_id: number;
  advisor_id: string;
  appointment_date: string;
  appointment_type: string;
  visit_type: string;
  attendees: number;
  special_requests?: string;
  contact_method: string;
  marketing_consent: boolean;
}) {
  try {
    console.log('🔍 Validando disponibilidad antes de guardar cita...');

    // Verificar disponibilidad del asesor
    const availabilityCheck = await checkAdvisorAvailability(
      appointmentData.advisor_id,
      appointmentData.appointment_date
    );

    if (!availabilityCheck.available) {
      const conflictDate = new Date(availabilityCheck.conflictingAppointment.appointment_date);
      throw new Error(
        `El asesor no está disponible en este horario. Ya tiene una cita programada para el ${conflictDate.toLocaleDateString('es-CO')} a las ${conflictDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}.`
      );
    }

    console.log('✅ Disponibilidad confirmada, guardando cita...');

    // Si está disponible, guardar la cita normalmente
    return await savePropertyAppointmentSimple(appointmentData);

  } catch (error) {
    console.error('❌ Error en savePropertyAppointmentWithValidation:', error);
    throw error;
  }
}

export async function savePropertyAppointment(appointmentData: {
  client_name: string;
  client_email: string;
  client_phone?: string;
  property_id?: number | null;
  advisor_id: string;
  appointment_date: string;
  appointment_type: string;
  visit_type: string;
  attendees: number;
  special_requests?: string;
  contact_method: string;
  marketing_consent: boolean;
}) {
  try {
    const { data, error } = await supabase
      .from('property_appointments')
      .insert([appointmentData])
      .select();
    
    if (error) {
      console.error('❌ Error al guardar la cita:', error);
      console.error('❌ Detalle completo del error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    return data[0];
  } catch (error) {
    console.error('❌ Error en savePropertyAppointment:', error);
    throw error;
  }
}

// ==========================================
// SISTEMA DE AUTENTICACIÓN CON SUPABASE AUTH
// ==========================================

// Interfaces para tipos de usuario
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'advisor' | 'user';
  phone: string | null;
  avatar_url: string | null;
  department: string | null;
  position: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: UserProfile;
  session: any;
}

// Función para login de usuario con Supabase Auth
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    console.log('🔐 Intentando login con Supabase Auth:', email);
    
    // Autenticar con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Error en autenticación:', error);
      throw new Error(error.message || 'Credenciales incorrectas');
    }

    if (!data.user || !data.session) {
      throw new Error('No se pudo obtener la sesión del usuario');
    }

    console.log('✅ Autenticación exitosa:', data.user.email);

    // Obtener perfil del usuario desde user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      console.error('❌ Error obteniendo perfil:', profileError);
      throw new Error('No se pudo obtener el perfil del usuario');
    }

    console.log('✅ Perfil obtenido:', profile);

    // Actualizar último login
    await supabase.rpc('update_last_login');

    // Log de autenticación
    await logAuthEvent('login', data.user.id);

    return {
      user: profile as UserProfile,
      session: data.session
    };

  } catch (error: any) {
    console.error('❌ Error en login:', error);
    
    // Log de intento fallido
    await logAuthEvent('failed_login', null, { error: error.message });
    
    throw error;
  }
}

// Función para logout
export async function logoutUser(): Promise<boolean> {
  try {
    console.log('🔓 Cerrando sesión...');
    
    // Log de logout
    const user = await getCurrentUser();
    if (user) {
      await logAuthEvent('logout', user.id);
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('❌ Error en logout:', error);
      return false;
    }

    console.log('✅ Sesión cerrada exitosamente');
    return true;

  } catch (error) {
    console.error('❌ Error en logout:', error);
    return false;
  }
}

// Función para verificar si el usuario está autenticado
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Error verificando sesión:', error);
      return false;
    }

    return session !== null;

  } catch (error) {
    console.error('❌ Error verificando autenticación:', error);
    return false;
  }
}

// Función para obtener usuario actual
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Obtener perfil completo
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('❌ Error obteniendo perfil:', profileError);
      return null;
    }

    return profile as UserProfile;

  } catch (error) {
    console.error('❌ Error obteniendo usuario actual:', error);
    return null;
  }
}

// Función para verificar si el usuario es admin
export async function isAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_admin');

    if (error) {
      console.error('❌ Error verificando admin:', error);
      return false;
    }

    return data === true;

  } catch (error) {
    console.error('❌ Error verificando admin:', error);
    return false;
  }
}

// Función para verificar si el usuario es asesor
export async function isAdvisor(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_advisor');

    if (error) {
      console.error('❌ Error verificando advisor:', error);
      return false;
    }

    return data === true;

  } catch (error) {
    console.error('❌ Error verificando advisor:', error);
    return false;
  }
}

// Función para registrar nuevo usuario (solo admins)
export async function registerUser(userData: {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'advisor' | 'user';
  phone?: string;
  department?: string;
  position?: string;
}): Promise<AuthResponse> {
  try {
    console.log('👤 Registrando nuevo usuario:', userData.email);

    // Verificar que el usuario actual es admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      throw new Error('Solo los administradores pueden crear usuarios');
    }

    // Crear usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name,
          role: userData.role
        }
      }
    });

    if (error) {
      console.error('❌ Error creando usuario:', error);
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No se pudo crear el usuario');
    }

    console.log('✅ Usuario creado:', data.user.email);

    // Actualizar perfil con información adicional
    if (userData.phone || userData.department || userData.position) {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          phone: userData.phone,
          department: userData.department,
          position: userData.position
        })
        .eq('id', data.user.id);

      if (updateError) {
        console.error('⚠️ Error actualizando perfil:', updateError);
      }
    }

    // Obtener perfil completo
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Error obteniendo perfil del usuario creado');
    }

    return {
      user: profile as UserProfile,
      session: data.session
    };

  } catch (error: any) {
    console.error('❌ Error en registro:', error);
    throw error;
  }
}

// Función para cambiar contraseña
export async function changePassword(newPassword: string): Promise<boolean> {
  try {
    console.log('🔑 Cambiando contraseña...');

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('❌ Error cambiando contraseña:', error);
      throw new Error(error.message);
    }

    // Log del cambio
    const user = await getCurrentUser();
    if (user) {
      await logAuthEvent('password_reset', user.id);
    }

    console.log('✅ Contraseña cambiada exitosamente');
    return true;

  } catch (error: any) {
    console.error('❌ Error cambiando contraseña:', error);
    throw error;
  }
}

// Función para solicitar reseteo de contraseña
export async function requestPasswordReset(email: string): Promise<boolean> {
  try {
    console.log('📧 Solicitando reseteo de contraseña para:', email);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      console.error('❌ Error solicitando reseteo:', error);
      throw new Error(error.message);
    }

    console.log('✅ Email de reseteo enviado');
    return true;

  } catch (error: any) {
    console.error('❌ Error en reseteo:', error);
    throw error;
  }
}

// Función para actualizar perfil de usuario
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  try {
    console.log('📝 Actualizando perfil...');

    const user = await getCurrentUser();
    if (!user) {
      throw new Error('No hay usuario autenticado');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error actualizando perfil:', error);
      throw new Error(error.message);
    }

    console.log('✅ Perfil actualizado');
    return data as UserProfile;

  } catch (error: any) {
    console.error('❌ Error actualizando perfil:', error);
    throw error;
  }
}

// ==========================================
// GESTIÓN DE USUARIOS - ADMIN
// ==========================================

export interface CreateUserData {
  email: string;
  password: string;
  full_name?: string;
  role: 'admin' | 'advisor' | 'user';
  phone?: string;
  department?: string;
  position?: string;
}

/**
 * Obtener lista de usuarios (solo administradores)
 */
export async function getUsers(options?: {
  role?: 'admin' | 'advisor' | 'user';
  is_active?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: UserProfile[]; total: number }> {
  try {
    console.log('👥 Obteniendo usuarios con opciones:', options);

    // Verificar permisos de admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      throw new Error('Solo los administradores pueden ver la lista de usuarios');
    }

    let query = supabase
      .from('user_profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (options?.role) {
      query = query.eq('role', options.role);
    }

    if (options?.is_active !== undefined) {
      query = query.eq('is_active', options.is_active);
    }

    if (options?.search) {
      query = query.or(`email.ilike.%${options.search}%,full_name.ilike.%${options.search}%`);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      throw error;
    }

    console.log(`✅ Obtenidos ${data?.length || 0} usuarios de ${count || 0} total`);
    return {
      data: data || [],
      total: count || 0
    };

  } catch (error: any) {
    console.error('❌ Error en getUsers:', error);
    throw error;
  }
}

/**
 * Crear un nuevo usuario (solo administradores)
 */
export async function createUser(userData: CreateUserData): Promise<UserProfile> {
  try {
    console.log('👤 Creando usuario:', userData.email);

    // Verificar permisos de admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      throw new Error('Solo los administradores pueden crear usuarios');
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name || userData.email.split('@')[0]
      }
    });

    if (authError) {
      console.error('❌ Error creando usuario en auth:', authError);
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario');
    }

    // Crear perfil en user_profiles
    const profileData = {
      id: authData.user.id,
      email: userData.email,
      full_name: userData.full_name || userData.email.split('@')[0],
      role: userData.role,
      phone: userData.phone || null,
      department: userData.department || null,
      position: userData.position || null,
      is_active: true
    };

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creando perfil:', profileError);
      // Intentar limpiar el usuario de auth si falló el perfil
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error('⚠️ Error limpiando usuario de auth:', cleanupError);
      }
      throw new Error(profileError.message);
    }

    console.log('✅ Usuario creado exitosamente:', profile.email);
    return profile as UserProfile;

  } catch (error: any) {
    console.error('❌ Error en createUser:', error);
    throw error;
  }
}

/**
 * Actualizar un usuario (solo administradores)
 */
export async function updateUser(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  try {
    console.log('📝 Actualizando usuario:', userId);

    // Verificar permisos de admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      throw new Error('Solo los administradores pueden actualizar usuarios');
    }

    // Preparar datos de actualización
    const updateData: any = { ...updates };
    delete updateData.id;
    delete updateData.email; // El email no se puede cambiar desde aquí
    delete updateData.created_at;

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error actualizando usuario:', error);
      throw new Error(error.message);
    }

    console.log('✅ Usuario actualizado exitosamente');
    return data as UserProfile;

  } catch (error: any) {
    console.error('❌ Error en updateUser:', error);
    throw error;
  }
}

/**
 * Eliminar un usuario (solo administradores)
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    console.log('🗑️ Eliminando usuario:', userId);

    // Verificar permisos de admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      throw new Error('Solo los administradores pueden eliminar usuarios');
    }

    // No permitir eliminar al propio usuario
    const currentUser = await getCurrentUser();
    if (currentUser?.id === userId) {
      throw new Error('No puedes eliminar tu propio usuario');
    }

    // Eliminar perfil (esto debería activar el trigger de eliminación en cascada)
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('❌ Error eliminando usuario:', error);
      throw new Error(error.message);
    }

    console.log('✅ Usuario eliminado exitosamente');

  } catch (error: any) {
    console.error('❌ Error en deleteUser:', error);
    throw error;
  }
}

/**
 * Resetear contraseña de un usuario (solo administradores)
 */
export async function resetUserPassword(userId: string, newPassword: string): Promise<void> {
  try {
    console.log('🔑 Reseteando contraseña para usuario:', userId);

    // Verificar permisos de admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      throw new Error('Solo los administradores pueden resetear contraseñas');
    }

    // Resetear contraseña usando Supabase Admin API
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) {
      console.error('❌ Error reseteando contraseña:', error);
      throw new Error(error.message);
    }

    console.log('✅ Contraseña reseteada exitosamente');

  } catch (error: any) {
    console.error('❌ Error en resetUserPassword:', error);
    throw error;
  }
}

/**
 * Activar/desactivar un usuario (solo administradores)
 */
export async function toggleUserStatus(userId: string, isActive: boolean): Promise<UserProfile> {
  try {
    console.log(`${isActive ? '✅ Activando' : '🚫 Desactivando'} usuario:`, userId);

    // Verificar permisos de admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      throw new Error('Solo los administradores pueden cambiar el estado de usuarios');
    }

    // No permitir desactivar al propio usuario
    const currentUser = await getCurrentUser();
    if (currentUser?.id === userId && !isActive) {
      throw new Error('No puedes desactivar tu propio usuario');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ is_active: isActive })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error cambiando estado del usuario:', error);
      throw new Error(error.message);
    }

    console.log(`✅ Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`);
    return data as UserProfile;

  } catch (error: any) {
    console.error('❌ Error en toggleUserStatus:', error);
    throw error;
  }
}

// Función auxiliar para logging de eventos de autenticación
async function logAuthEvent(
  action: 'login' | 'logout' | 'failed_login' | 'password_reset' | 'email_change',
  userId: string | null,
  metadata: any = {}
): Promise<void> {
  try {
    await supabase.from('auth_logs').insert({
      user_id: userId,
      action,
      ip_address: null, // Se puede obtener del cliente si es necesario
      user_agent: navigator.userAgent,
      metadata
    });
  } catch (error) {
    console.error('⚠️ Error logging auth event:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
}

// Función para escuchar cambios en la autenticación
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔔 Auth state changed:', event);
    callback(event, session);
  });
}

// Función para limpiar autenticación (solo desarrollo)
export async function clearAuth() {
  await supabase.auth.signOut();
  console.log('🧹 Autenticación limpiada');
}

// ==========================================
// FUNCIONES EXISTENTES
// ==========================================

// Función para verificar si las tablas existen (solo para desarrollo)
export async function debugTables() {
  try {
    // Verificar específicamente la tabla property_appointments
    const { data: appointmentsTest, error: appointmentsError } = await supabase
      .from('property_appointments')
      .select('*')
      .limit(1);
    
    if (appointmentsError) {
      console.error('❌ Error con tabla property_appointments:', appointmentsError);
      return null;
    }
    
    return { appointmentsTest };
  } catch (error) {
    console.error('❌ Error en debugTables:', error);
    return null;
  }
}

// Función para obtener todas las citas (para debugging)
export async function getAllPropertyAppointments() {
  try {
    const { data, error } = await supabase
      .from('property_appointments')
      .select('*')
      .is('deleted_at', null)  // Excluir citas eliminadas
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error al obtener todas las citas:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error en getAllPropertyAppointments:', error);
    return [];
  }
}

// Función para obtener citas por propiedad
export async function getAppointmentsByPropertyId(propertyId: number) {
  try {
    const { data, error } = await supabase
      .from('property_appointments')
      .select('*')
      .eq('property_id', propertyId)
      .is('deleted_at', null)  // Excluir citas eliminadas
      .order('appointment_date', { ascending: true });
    
    if (error) {
      console.error('❌ Error al obtener citas por propiedad:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error en getAppointmentsByPropertyId:', error);
    return [];
  }
}

// Función para obtener citas por asesor
export async function getAppointmentsByAdvisorId(advisorId: string) {
  try {
    const { data, error } = await supabase
      .from('property_appointments')
      .select('*, properties(*)')
      .eq('advisor_id', advisorId)
      .is('deleted_at', null)  // Excluir citas eliminadas
      .order('appointment_date', { ascending: true });
    
    if (error) {
      console.error('❌ Error al obtener citas por asesor:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error en getAppointmentsByAdvisorId:', error);
    return [];
  }
}

// Actualizar una cita existente
export async function updateAppointment(appointmentId: string, appointmentData: Partial<PropertyAppointment>): Promise<PropertyAppointment> {
  try {
    const { data, error } = await supabase
      .from('property_appointments')
      .update({
        ...appointmentData,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error actualizando cita:', error);
      throw error;
    }

    console.log('✅ Cita actualizada exitosamente:', data);
    return data;
  } catch (error) {
    console.error('❌ Error en updateAppointment:', error);
    throw error;
  }
}

// Eliminar una cita (soft delete)
export async function deleteAppointment(appointmentId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('property_appointments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', appointmentId);

    if (error) {
      console.error('❌ Error eliminando cita:', error);
      throw error;
    }

    console.log('✅ Cita eliminada exitosamente (soft delete)');
  } catch (error) {
    console.error('❌ Error en deleteAppointment:', error);
    throw error;
  }
}

// Cambiar el estado de una cita
export async function updateAppointmentStatus(appointmentId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled'): Promise<PropertyAppointment> {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    // Agregar timestamp específico según el estado
    switch (status) {
      case 'confirmed':
        updateData.confirmed_at = new Date().toISOString();
        break;
      case 'completed':
        updateData.completed_at = new Date().toISOString();
        break;
      case 'cancelled':
        updateData.cancelled_at = new Date().toISOString();
        break;
      case 'no_show':
        updateData.no_show_at = new Date().toISOString();
        break;
      case 'rescheduled':
        updateData.rescheduled_at = new Date().toISOString();
        break;
    }

    const { data, error } = await supabase
      .from('property_appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error actualizando estado de cita:', error);
      throw error;
    }

    console.log('✅ Estado de cita actualizado exitosamente:', data);
    return data;
  } catch (error) {
    console.error('❌ Error en updateAppointmentStatus:', error);
    throw error;
  }
}

// Obtener una cita por ID
export async function getAppointmentById(appointmentId: string): Promise<PropertyAppointment | null> {
  try {
    const { data, error } = await supabase
      .from('property_appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No se encontró la cita
        return null;
      }
      console.error('❌ Error obteniendo cita por ID:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('❌ Error en getAppointmentById:', error);
    throw error;
  }
}

// Función para obtener la URL pública de imágenes de asesores
export function getAdvisorImageUrl(photoUrl: string | null): string {
  if (!photoUrl) {
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=90';
  }
  
  // Si ya es una URL completa, devolverla
  if (photoUrl.startsWith('http')) {
    return photoUrl;
  }
  
  // Construir URL para el bucket property-images carpeta Asesores
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${baseUrl}/storage/v1/object/public/property-images/Asesores/${photoUrl}`;
}

// Función para obtener todos los asesores activos
export async function getAdvisors(): Promise<Advisor[]> {
  try {
    const { data, error } = await supabase
      .from('advisors')
      .select('*')
      .is('deleted_at', null)
      .order('name');
    
    if (error) {
      console.error('❌ Error al obtener asesores:', error);
      throw error;
    }
    
    const advisors: Advisor[] = data.map(advisor => ({
      id: advisor.id,
      name: advisor.name,
      email: advisor.email,
      phone: advisor.phone,
      photo: getAdvisorImageUrl(advisor.photo_url),
      specialty: advisor.specialty,
      whatsapp: advisor.whatsapp,
      rating: advisor.rating || 0,
      reviews: advisor.reviews_count || 0,
      availability: {
        weekdays: advisor.availability_weekdays || '9:00 AM - 6:00 PM',
        weekends: advisor.availability_weekends || 'No disponible'
      },
      calendar_link: advisor.calendar_link,
      availability_hours: `Lun-Vie: ${advisor.availability_weekdays}, Sáb-Dom: ${advisor.availability_weekends}`,
      bio: advisor.bio,
      experience_years: advisor.experience_years || 0
    }));
    
    return advisors;
    
  } catch (error) {
    console.error('❌ Error en getAdvisors:', error);
    // Devolver datos por defecto en caso de error
    return [
      {
        id: 'advisor-1',
        name: 'Santiago Sánchez',
        email: 'santiago.sanchez@inmobiliaria.com',
        phone: '+57 302 584 56 30',
        whatsapp: '573025845630',
        photo: getAdvisorImageUrl('1.jpeg'),
        specialty: 'Propiedades Residenciales y Apartamentos',
        rating: 4.8,
        reviews: 127,
        availability: {
          weekdays: '9:00 AM - 5:00 PM',
          weekends: 'No disponible'
        },
        bio: 'Especialista en propiedades residenciales con más de 8 años de experiencia.',
        experience_years: 8,
        availability_hours: 'Lun-Vie: 9:00 AM - 5:00 PM (No laboramos sábados, domingos ni festivos)'
      },
      {
        id: 'advisor-2',
        name: 'Andrés Metrio',
        email: 'andres.metrio@inmobiliaria.com',
        phone: '+57 302 810 80 90',
        whatsapp: '573028108090',
        photo: getAdvisorImageUrl('2 (2).jpg'),
        specialty: 'Propiedades Comerciales y Oficinas',
        rating: 4.6,
        reviews: 94,
        availability: {
          weekdays: '9:00 AM - 5:00 PM',
          weekends: 'No disponible'
        },
        bio: 'Experto en propiedades comerciales e inversiones inmobiliarias.',
        experience_years: 6,
        availability_hours: 'Lun-Vie: 9:00 AM - 5:00 PM (No laboramos sábados, domingos ni festivos)'
      }
    ];
  }
}

// Función para obtener un asesor específico por ID
export async function getAdvisorById(id: string): Promise<Advisor | null> {
  try {
    const { data, error } = await supabase
      .from('advisors')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error('❌ Error al obtener asesor por ID:', error);
      throw error;
    }
    
    if (!data) {
      return null;
    }
    
    const advisor: Advisor = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      photo: getAdvisorImageUrl(data.photo_url),
      specialty: data.specialty,
      whatsapp: data.whatsapp,
      rating: data.rating || 0,
      reviews: data.reviews_count || 0,
      availability: {
        weekdays: data.availability_weekdays || '9:00 AM - 6:00 PM',
        weekends: data.availability_weekends || 'No disponible'
      },
      calendar_link: data.calendar_link,
      availability_hours: `Lun-Vie: ${data.availability_weekdays}, Sáb-Dom: ${data.availability_weekends}`,
      bio: data.bio,
      experience_years: data.experience_years || 0
    };
    
    return advisor;
    
  } catch (error) {
    console.error('❌ Error en getAdvisorById:', error);
    return null;
  }
}

/**
 * Crear un nuevo asesor (solo administradores)
 */
export async function createAdvisor(advisorData: Omit<Advisor, 'id'>): Promise<Advisor> {
  try {
    console.log('👤 Creando asesor:', advisorData.name);

    // Verificar permisos de admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      throw new Error('Solo los administradores pueden crear asesores');
    }

    // Validar datos requeridos
    if (!advisorData.name || !advisorData.email || !advisorData.phone) {
      throw new Error('Nombre, email y teléfono son campos obligatorios');
    }

    // Preparar datos para la base de datos
    const dbData = {
      name: advisorData.name,
      email: advisorData.email,
      phone: advisorData.phone,
      whatsapp: advisorData.whatsapp || advisorData.phone,
      specialty: advisorData.specialty || 'General',
      bio: advisorData.bio || null,
      experience_years: advisorData.experience_years || 0,
      rating: advisorData.rating || 0,
      reviews_count: advisorData.reviews || 0,
      photo_url: advisorData.photo ? advisorData.photo.replace(getAdvisorImageUrl(''), '') : null,
      availability_weekdays: advisorData.availability?.weekdays || '9:00 AM - 5:00 PM',
      availability_weekends: advisorData.availability?.weekends || 'No disponible',
      calendar_link: advisorData.calendar_link || null,
      commission_rate: 3.00, // Valor por defecto
      license_number: null,
      languages: ['Español'],
      areas_of_expertise: [advisorData.specialty || 'General'],
      education: null,
      certifications: [],
      social_media: {},
      is_active: true,
      joined_date: new Date().toISOString().split('T')[0]
    };

    const { data, error } = await supabase
      .from('advisors')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando asesor:', error);
      if (error.code === '23505') {
        throw new Error('Ya existe un asesor con ese email');
      }
      throw new Error(error.message);
    }

    console.log('✅ Asesor creado exitosamente:', data.name);
    return getAdvisorById(data.id) as Promise<Advisor>;

  } catch (error: any) {
    console.error('❌ Error en createAdvisor:', error);
    throw error;
  }
}

/**
 * Actualizar un asesor (solo administradores)
 */
export async function updateAdvisor(advisorId: string, updates: Partial<Advisor>): Promise<Advisor> {
  try {
    console.log('📝 Actualizando asesor:', advisorId);

    // Verificar permisos de admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      throw new Error('Solo los administradores pueden actualizar asesores');
    }

    // Preparar datos de actualización
    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.whatsapp !== undefined) updateData.whatsapp = updates.whatsapp;
    if (updates.specialty !== undefined) updateData.specialty = updates.specialty;
    if (updates.bio !== undefined) updateData.bio = updates.bio;
    if (updates.experience_years !== undefined) updateData.experience_years = updates.experience_years;
    if (updates.rating !== undefined) updateData.rating = updates.rating;
    if (updates.reviews !== undefined) updateData.reviews_count = updates.reviews;
    if (updates.calendar_link !== undefined) updateData.calendar_link = updates.calendar_link;

    // Manejar imagen
    if (updates.photo !== undefined) {
      if (updates.photo && updates.photo.startsWith('http')) {
        // Extraer el path relativo de la URL
        updateData.photo_url = updates.photo.replace(getAdvisorImageUrl(''), '');
      } else {
        updateData.photo_url = updates.photo;
      }
    }

    // Manejar disponibilidad
    if (updates.availability?.weekdays !== undefined) {
      updateData.availability_weekdays = updates.availability.weekdays;
    }
    if (updates.availability?.weekends !== undefined) {
      updateData.availability_weekends = updates.availability.weekends;
    }

    const { error } = await supabase
      .from('advisors')
      .update(updateData)
      .eq('id', advisorId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error actualizando asesor:', error);
      throw new Error(error.message);
    }

    console.log('✅ Asesor actualizado exitosamente');
    return getAdvisorById(advisorId) as Promise<Advisor>;

  } catch (error: any) {
    console.error('❌ Error en updateAdvisor:', error);
    throw error;
  }
}

/**
 * Eliminar un asesor (solo administradores)
 */
export async function deleteAdvisor(advisorId: string): Promise<void> {
  try {
    console.log('🗑️ Eliminando asesor:', advisorId);

    // Verificar permisos de admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      throw new Error('Solo los administradores pueden eliminar asesores');
    }

    // Verificar que el asesor existe
    const advisor = await getAdvisorById(advisorId);
    if (!advisor) {
      throw new Error('Asesor no encontrado');
    }

    // Verificar si tiene citas pendientes
    const { data: appointments, error: appointmentsError } = await supabase
      .from('property_appointments')
      .select('id')
      .eq('advisor_id', advisorId)
      .in('status', ['pending', 'confirmed'])
      .is('deleted_at', null);

    if (appointmentsError) {
      console.warn('⚠️ Error verificando citas:', appointmentsError);
    }

    if (appointments && appointments.length > 0) {
      throw new Error(`No se puede eliminar el asesor. Tiene ${appointments.length} citas pendientes o confirmadas.`);
    }

    // Soft delete - marcar como inactivo
    const { error } = await supabase
      .from('advisors')
      .update({ is_active: false })
      .eq('id', advisorId);

    if (error) {
      console.error('❌ Error eliminando asesor:', error);
      throw new Error(error.message);
    }

    console.log('✅ Asesor eliminado exitosamente (soft delete)');

  } catch (error: any) {
    console.error('❌ Error en deleteAdvisor:', error);
    throw error;
  }
}

// Utilidad para obtener la URL pública de Supabase Storage (propiedades)
export function getPublicImageUrl(path: string) {
  // Validación básica
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg';
  }
  
  // Si ya es una URL completa, devolverla
  if (path.startsWith('http')) {
    return path;
  }
  
  // Limpiar el path
  let cleanPath = path.trim();
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  // Para el nuevo bucket property-images
  // La estructura será: property-images/CA-XXX/imagen.jpg
  if (cleanPath.includes('CA-')) {
    // Extraer solo la parte del código de propiedad y la imagen
    let propertyPath = cleanPath;
    
    // Si viene del bucket anterior, extraer la parte relevante
    if (cleanPath.includes('imagenes/imagenes/')) {
      propertyPath = cleanPath.replace('imagenes/imagenes/', '');
    } else if (cleanPath.includes('imagenes/')) {
      propertyPath = cleanPath.replace('imagenes/', '');
    }
    
    // Construir URL para el nuevo bucket
    const finalUrl = `${baseUrl}/storage/v1/object/public/property-images/${propertyPath}`;
    return finalUrl;
  }
  
  // Si después de limpiar queda vacío, usar imagen por defecto
  if (!cleanPath) {
    return 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg';
  }
  
  // Para otros casos, usar bucket por defecto
  const finalUrl = `${baseUrl}/storage/v1/object/public/imagenes/${cleanPath}`;
  return finalUrl;
}

// Función principal para obtener propiedades
export async function getProperties(onlyAvailable: boolean = false): Promise<Property[]> {
  try {
    console.log('🔍 getProperties called with onlyAvailable:', onlyAvailable);
    let query = supabase
      .from('properties')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Si solo queremos propiedades disponibles para mostrar en la página pública
    if (onlyAvailable) {
      // Incluir solo propiedades con status: 'rent', 'sale', 'available', o 'both'
      // Estas son las únicas que deben aparecer en la página web pública
      query = query.or('status.eq.rent,status.eq.sale,status.eq.available,status.eq.both');
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error al obtener propiedades:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No se encontraron propiedades en la base de datos');
      return [];
    }

    console.log('✅ Propiedades obtenidas de BD:', data.length, 'propiedades');
    
    // Transformar datos de Supabase a formato de la aplicación
    const properties: Property[] = data.map(prop => {
      
      // Procesar array de imágenes
      let processedImages: string[] = [];
      
      if (prop.images && Array.isArray(prop.images)) {
        processedImages = prop.images.map((img: string) => {
          const processedUrl = getPublicImageUrl(img);
          return processedUrl;
        });
      } else if (typeof prop.images === 'string') {
        // Si es una cadena, intentar parsear como JSON
        try {
          const parsed = JSON.parse(prop.images);
          if (Array.isArray(parsed)) {
            processedImages = parsed.map(img => getPublicImageUrl(img));
          } else {
            processedImages = [getPublicImageUrl(prop.images)];
          }
        } catch {
          processedImages = [getPublicImageUrl(prop.images)];
        }
      }
      
      // Si no hay imágenes, usar imagen por defecto
      if (processedImages.length === 0) {
        processedImages = ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'];
      }
      
      // Procesar array de videos
      let processedVideos: any[] = [];
      
      if (prop.videos && Array.isArray(prop.videos)) {
        processedVideos = prop.videos;
      } else if (typeof prop.videos === 'string') {
        // Si es una cadena, intentar parsear como JSON
        try {
          const parsed = JSON.parse(prop.videos);
          if (Array.isArray(parsed)) {
            processedVideos = parsed;
          }
        } catch (e) {
          console.warn('No se pudo parsear videos:', e);
          processedVideos = [];
        }
      }
      
      return {
        id: prop.id,
        code: prop.code, // ← CÓDIGO DE PROPIEDAD
        title: prop.title,
        location: prop.location,
        price: prop.price,
        availability_type: prop.availability_type,
        sale_price: prop.sale_price,
        rent_price: prop.rent_price,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        area: prop.area,
        type: prop.type as 'apartment' | 'house' | 'office' | 'commercial',
        status: prop.status as 'sale' | 'rent' | 'both' | 'sold' | 'rented',
        images: processedImages,
        videos: processedVideos,
        cover_image: prop.cover_image,
        cover_video: prop.cover_video,
        amenities: prop.amenities || [],
        featured: prop.featured || false,
        description: prop.description,
        latitude: prop.latitude,
        longitude: prop.longitude,
        advisor_id: prop.advisor_id,
        created_at: prop.created_at,
        updated_at: prop.updated_at
      };
    });
    
    return properties;
    
  } catch (error) {
    console.error('❌ Error en getProperties:', error);
    return [];
  }
}

// Función para obtener propiedades destacadas
export async function getFeaturedProperties(): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('featured', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(6);
    
    if (error) {
      console.error('❌ Error al obtener propiedades destacadas:', error);
      throw error;
    }
    
    
    if (!data || data.length === 0) {
      // Si no hay propiedades destacadas, obtener las 6 más recientes
      const { data: recentData, error: recentError } = await supabase
        .from('properties')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(6);
        
      if (recentError) {
        console.error('❌ Error al obtener propiedades recientes:', recentError);
        return [];
      }
      
      if (!recentData) return [];
      
      // Procesar las propiedades recientes
      const recentProperties: Property[] = recentData.map(prop => {
        
        // Procesar array de imágenes
        let processedImages: string[] = [];
        
        if (prop.images && Array.isArray(prop.images)) {
          processedImages = prop.images.map((img: string) => getPublicImageUrl(img));
        } else if (typeof prop.images === 'string') {
          try {
            const parsed = JSON.parse(prop.images);
            if (Array.isArray(parsed)) {
              processedImages = parsed.map(img => getPublicImageUrl(img));
            } else {
              processedImages = [getPublicImageUrl(prop.images)];
            }
          } catch {
            processedImages = [getPublicImageUrl(prop.images)];
          }
        }
        
        if (processedImages.length === 0) {
          processedImages = ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'];
        }
        
        return {
          id: prop.id,
          code: prop.code, // ← CÓDIGO DE PROPIEDAD
          title: prop.title,
          location: prop.location,
          price: prop.price,
          availability_type: prop.availability_type,
          sale_price: prop.sale_price,
          rent_price: prop.rent_price,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          area: prop.area,
          type: prop.type as 'apartment' | 'house' | 'office' | 'commercial',
          status: prop.status as 'sale' | 'rent' | 'both' | 'sold' | 'rented',
          images: processedImages,
          amenities: prop.amenities || [],
          featured: prop.featured || false,
          description: prop.description,
          latitude: prop.latitude,
          longitude: prop.longitude,
          advisor_id: prop.advisor_id,
          created_at: prop.created_at,
          updated_at: prop.updated_at
        };
      });
      
      return recentProperties;
    }
    
    if (!data) return [];
    
    // Transformar datos usando la misma lógica que getProperties
    const properties: Property[] = data.map(prop => {
      
      // Procesar array de imágenes
      let processedImages: string[] = [];
      
      if (prop.images && Array.isArray(prop.images)) {
        processedImages = prop.images.map((img: string) => getPublicImageUrl(img));
      } else if (typeof prop.images === 'string') {
        try {
          const parsed = JSON.parse(prop.images);
          if (Array.isArray(parsed)) {
            processedImages = parsed.map(img => getPublicImageUrl(img));
          } else {
            processedImages = [getPublicImageUrl(prop.images)];
          }
        } catch {
          processedImages = [getPublicImageUrl(prop.images)];
        }
      }
      
      if (processedImages.length === 0) {
        processedImages = ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'];
      }
      
      return {
        id: prop.id,
        code: prop.code, // ← CÓDIGO DE PROPIEDAD
        title: prop.title,
        location: prop.location,
        price: prop.price,
        availability_type: prop.availability_type,
        sale_price: prop.sale_price,
        rent_price: prop.rent_price,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        area: prop.area,
        type: prop.type as 'apartment' | 'house' | 'office' | 'commercial',
        status: prop.status as 'sale' | 'rent' | 'both' | 'sold' | 'rented',
        images: processedImages,
        amenities: prop.amenities || [],
        featured: prop.featured || false,
        description: prop.description,
        latitude: prop.latitude,
        longitude: prop.longitude,
        advisor_id: prop.advisor_id,
        created_at: prop.created_at,
        updated_at: prop.updated_at
      };
    });
    
    return properties;
    
  } catch (error) {
    console.error('❌ Error en getFeaturedProperties:', error);
    return [];
  }
}

// ============================================
// FUNCIONES PARA CONSULTAS DE SERVICIOS
// ============================================

import type { ServiceInquiry } from '../types';

/**
 * Crear una nueva consulta de servicio
 */
export async function createServiceInquiry(inquiry: Omit<ServiceInquiry, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceInquiry | null> {
  try {
    
    // Verificar conexión a Supabase
    if (!supabase) {
      throw new Error('Supabase client no está inicializado');
    }
    
    
    const dataToInsert = {
      client_name: inquiry.client_name,
      client_email: inquiry.client_email,
      client_phone: inquiry.client_phone,
      service_type: inquiry.service_type,
      urgency: inquiry.urgency,
      budget: inquiry.budget,
      details: inquiry.details,
      selected_questions: inquiry.selected_questions,
      status: inquiry.status || 'pending',
      assigned_advisor_id: inquiry.assigned_advisor_id,
      whatsapp_sent: inquiry.whatsapp_sent || false,
      source: inquiry.source || 'website'
    };
    
    
    const { data, error } = await supabase
      .from('service_inquiries')
      .insert([dataToInsert])
      .select()
      .single();
    
    if (error) {
      console.error('❌ [SUPABASE] Error detallado:', error);
      console.error('❌ [SUPABASE] Código de error:', error.code);
      console.error('❌ [SUPABASE] Mensaje:', error.message);
      console.error('❌ [SUPABASE] Detalles:', error.details);
      console.error('❌ [SUPABASE] Hint:', error.hint);
      throw error;
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ [SUPABASE] Error en createServiceInquiry:', error);
    
    // Información adicional para debugging
    if (error instanceof Error) {
      console.error('❌ [SUPABASE] Error name:', error.name);
      console.error('❌ [SUPABASE] Error message:', error.message);
    }
    
    return null;
  }
}

/**
 * Obtener todas las consultas de servicios (solo para administradores)
 */
export async function getServiceInquiries(filters?: {
  service_type?: string;
  status?: string;
  limit?: number;
}): Promise<ServiceInquiry[]> {
  try {
    
    let query = supabase
      .from('service_inquiries')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (filters?.service_type) {
      query = query.eq('service_type', filters.service_type);
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error al obtener consultas de servicios:', error);
      throw error;
    }
    
    return data || [];
    
  } catch (error) {
    console.error('❌ Error en getServiceInquiries:', error);
    return [];
  }
}

/**
 * Actualizar el estado de una consulta de servicio
 */
export async function updateServiceInquiry(
  id: string, 
  updates: Partial<ServiceInquiry>
): Promise<ServiceInquiry | null> {
  try {
    
    const { data, error } = await supabase
      .from('service_inquiries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ [SUPABASE] Error al actualizar consulta de servicio:', error);
      console.error('❌ [SUPABASE] ID buscado:', id);
      console.error('❌ [SUPABASE] Updates a aplicar:', updates);
      
      // Si no encuentra el registro, intentemos verificar si existe
      const { error: checkError } = await supabase
        .from('service_inquiries')
        .select('id')
        .eq('id', id)
        .single();
        
      if (checkError) {
        console.error('❌ [SUPABASE] El registro no existe:', checkError);
      }
      
      throw error;
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ [SUPABASE] Error en updateServiceInquiry:', error);
    return null;
  }
}

/**
 * Marcar una consulta como enviada por WhatsApp
 */
export async function markInquiryAsWhatsAppSent(id: string): Promise<boolean> {
  try {
    
    // Hacer la actualización sin intentar obtener el resultado
    const { error } = await supabase
      .from('service_inquiries')
      .update({ 
        whatsapp_sent: true, 
        whatsapp_sent_at: new Date().toISOString() 
      })
      .eq('id', id);
    
    if (error) {
      console.error('❌ [SUPABASE] Error al marcar como enviado por WhatsApp:', error);
      // No arrojar error, solo loggearlo
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ [SUPABASE] Error en markInquiryAsWhatsAppSent:', error);
    return false;
  }
}

/**
 * Eliminar una consulta de servicio (soft delete)
 */
export async function deleteServiceInquiry(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('service_inquiries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('❌ [SUPABASE] Error al eliminar consulta de servicio:', error);
      console.error('❌ [SUPABASE] ID a eliminar:', id);
      throw error;
    }

    console.log('✅ [SUPABASE] Consulta de servicio eliminada correctamente (soft delete):', id);
    return true;  } catch (error) {
    console.error('❌ [SUPABASE] Error en deleteServiceInquiry:', error);
    return false;
  }
}

/**
 * Obtener estadísticas de consultas de servicios
 */
export async function getServiceInquiriesStats(): Promise<{
  total: number;
  by_service: Record<string, number>;
  by_status: Record<string, number>;
  pending: number;
  this_month: number;
}> {
  try {
    
    const { data, error } = await supabase
      .from('service_inquiries')
      .select('service_type, status, created_at')
      .is('deleted_at', null);
    
    if (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      throw error;
    }
    
    const total = data?.length || 0;
    const by_service: Record<string, number> = {};
    const by_status: Record<string, number> = {};
    let pending = 0;
    let this_month = 0;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    data?.forEach(inquiry => {
      // Por servicio
      by_service[inquiry.service_type] = (by_service[inquiry.service_type] || 0) + 1;
      
      // Por estado
      by_status[inquiry.status] = (by_status[inquiry.status] || 0) + 1;
      
      // Pendientes
      if (inquiry.status === 'pending') {
        pending++;
      }
      
      // Este mes
      const inquiryDate = new Date(inquiry.created_at);
      if (inquiryDate.getMonth() === currentMonth && inquiryDate.getFullYear() === currentYear) {
        this_month++;
      }
    });
    
    const stats = {
      total,
      by_service,
      by_status,
      pending,
      this_month
    };
    
    return stats;
    
  } catch (error) {
    console.error('❌ Error en getServiceInquiriesStats:', error);
    return {
      total: 0,
      by_service: {},
      by_status: {},
      pending: 0,
      this_month: 0
    };
  }
}

/**
 * Obtener tendencias de ingresos de los últimos 12 meses
 */
export async function getRevenueTrends(): Promise<{
  month: string;
  revenue: number;
  commissions: number;
}[]> {
  try {
    const trends = [];
    const currentDate = new Date();

    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1);

      // Ingresos de arriendo del mes
      const { data: monthlyPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'paid')
        .eq('payment_type', 'rent')
        .gte('payment_date', monthStart.toISOString())
        .lt('payment_date', monthEnd.toISOString());

      const revenue = monthlyPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      // Comisiones del mes
      const { data: monthlySales } = await supabase
        .from('contracts')
        .select('sale_price')
        .eq('contract_type', 'sale')
        .eq('status', 'active')
        .gte('signature_date', monthStart.toISOString())
        .lt('signature_date', monthEnd.toISOString());

      const commissionRate = 0.03;
      const commissions = monthlySales?.reduce((sum, contract) =>
        sum + ((contract.sale_price || 0) * commissionRate), 0) || 0;

      trends.push({
        month: targetDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        revenue,
        commissions
      });
    }

    return trends;

  } catch (error) {
    console.error('❌ Error obteniendo tendencias de ingresos:', error);
    return [];
  }
}

/**
 * Obtener alertas inteligentes del sistema
 */
export async function getSmartAlerts(): Promise<{
  critical: Array<{
    id: string;
    type: 'overdue_payment' | 'expiring_contract' | 'unfollowed_lead' | 'maintenance_due';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    actionRequired: string;
    data: any;
  }>;
  warnings: Array<{
    id: string;
    type: 'upcoming_payment' | 'contract_renewal' | 'inactive_property' | 'property_no_views' | 'lead_no_contact';
    title: string;
    description: string;
    priority: 'medium' | 'low';
    actionRequired: string;
    data: any;
  }>;
  totalCount: number;
}> {
  try {
    const currentDate = new Date();
    const sevenDaysFromNow = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const fifteenDaysFromNow = new Date(currentDate.getTime() + 15 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000);

    const critical: Array<{
      id: string;
      type: 'overdue_payment' | 'expiring_contract' | 'unfollowed_lead' | 'maintenance_due';
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      actionRequired: string;
      data: any;
    }> = [];

    const warnings: Array<{
      id: string;
      type: 'upcoming_payment' | 'contract_renewal' | 'inactive_property' | 'property_no_views' | 'lead_no_contact';
      title: string;
      description: string;
      priority: 'medium' | 'low';
      actionRequired: string;
      data: any;
    }> = [];

    // 1. Pagos vencidos (CRÍTICO)
    const { data: overduePayments } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        due_date,
        contracts!inner (
          clients!inner (
            full_name
          ),
          properties!inner (
            title,
            code
          )
        )
      `)
      .eq('status', 'pending')
      .lt('due_date', currentDate.toISOString());

    overduePayments?.forEach((payment: any) => {
      const clientName = payment.contracts?.clients?.full_name || 'Cliente desconocido';
      const propertyName = payment.contracts?.properties?.title || payment.contracts?.properties?.code || 'Propiedad sin nombre';
      critical.push({
        id: `overdue_payment_${payment.id}`,
        type: 'overdue_payment',
        title: 'Pago Vencido',
        description: `${clientName} - ${propertyName} - $${payment.amount?.toLocaleString()}`,
        priority: 'high',
        actionRequired: 'Contactar al cliente inmediatamente',
        data: payment
      });
    });

    // 2. Contratos próximos a vencer (CRÍTICO - 7 días)
    const { data: expiringContracts } = await supabase
      .from('contracts')
      .select(`
        id,
        end_date,
        clients!inner (
          full_name
        ),
        properties!inner (
          title,
          code
        )
      `)
      .eq('status', 'active')
      .gte('end_date', currentDate.toISOString())
      .lte('end_date', sevenDaysFromNow.toISOString());

    expiringContracts?.forEach((contract: any) => {
      const daysUntilExpiry = Math.ceil((new Date(contract.end_date).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      const clientName = contract.clients?.full_name || 'Cliente desconocido';
      const propertyName = contract.properties?.title || contract.properties?.code || 'Propiedad sin nombre';
      critical.push({
        id: `expiring_contract_${contract.id}`,
        type: 'expiring_contract',
        title: 'Contrato Vence Pronto',
        description: `${clientName} - ${propertyName} vence en ${daysUntilExpiry} días`,
        priority: 'high',
        actionRequired: 'Renovar o notificar al cliente',
        data: contract
      });
    });

    // 3. Propiedades sin visitas en 30 días (WARNING)
    const { data: inactiveProperties } = await supabase
      .from('properties')
      .select('id, title, code, created_at')
      .eq('status', 'available')
      .lt('created_at', thirtyDaysAgo.toISOString())
      .limit(10); // Limitar para no sobrecargar

    inactiveProperties?.forEach((property: any) => {
      warnings.push({
        id: `inactive_property_${property.id}`,
        type: 'inactive_property',
        title: 'Propiedad Sin Actividad',
        description: `${property.title || property.code} no ha tenido visitas en más de 30 días`,
        priority: 'medium',
        actionRequired: 'Revisar precio o promoción',
        data: property
      });
    });

    // 4. Leads sin seguimiento en 48 horas (CRÍTICO)
    const { data: unfollowedLeads } = await supabase
      .from('service_inquiries')
      .select('id, client_name, service_type, created_at')
      .is('deleted_at', null)
      .eq('status', 'pending')
      .lt('created_at', twoDaysAgo.toISOString());

    unfollowedLeads?.forEach((lead: any) => {
      critical.push({
        id: `unfollowed_lead_${lead.id}`,
        type: 'unfollowed_lead',
        title: 'Lead Sin Seguimiento',
        description: `${lead.client_name} - ${lead.service_type} - Sin contacto desde hace 48+ horas`,
        priority: 'high',
        actionRequired: 'Contactar inmediatamente',
        data: lead
      });
    });

    // 5. Pagos próximos a vencer (WARNING - 7 días)
    const { data: upcomingPayments } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        due_date,
        contracts!inner (
          clients!inner (
            full_name
          ),
          properties!inner (
            title,
            code
          )
        )
      `)
      .eq('status', 'pending')
      .gte('due_date', currentDate.toISOString())
      .lte('due_date', sevenDaysFromNow.toISOString());

    upcomingPayments?.forEach((payment: any) => {
      const daysUntilDue = Math.ceil((new Date(payment.due_date).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      const clientName = payment.contracts?.clients?.full_name || 'Cliente desconocido';
      const propertyName = payment.contracts?.properties?.title || payment.contracts?.properties?.code || 'Propiedad sin nombre';
      warnings.push({
        id: `upcoming_payment_${payment.id}`,
        type: 'upcoming_payment',
        title: 'Pago Próximo',
        description: `${clientName} - ${propertyName} vence en ${daysUntilDue} días`,
        priority: 'medium',
        actionRequired: 'Recordar al cliente',
        data: payment
      });
    });

    // 6. Contratos para renovación (WARNING - 15 días)
    const { data: renewalContracts } = await supabase
      .from('contracts')
      .select(`
        id,
        end_date,
        clients!inner (
          full_name
        ),
        properties!inner (
          title,
          code
        )
      `)
      .eq('status', 'active')
      .gte('end_date', sevenDaysFromNow.toISOString())
      .lte('end_date', fifteenDaysFromNow.toISOString());

    renewalContracts?.forEach((contract: any) => {
      const daysUntilExpiry = Math.ceil((new Date(contract.end_date).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      const clientName = contract.clients?.full_name || 'Cliente desconocido';
      const propertyName = contract.properties?.title || contract.properties?.code || 'Propiedad sin nombre';
      warnings.push({
        id: `contract_renewal_${contract.id}`,
        type: 'contract_renewal',
        title: 'Renovación Próxima',
        description: `${clientName} - ${propertyName} requiere renovación en ${daysUntilExpiry} días`,
        priority: 'low',
        actionRequired: 'Preparar renovación',
        data: contract
      });
    });

    return {
      critical,
      warnings,
      totalCount: critical.length + warnings.length
    };

  } catch (error) {
    console.error('❌ Error obteniendo alertas inteligentes:', error);
    return {
      critical: [],
      warnings: [],
      totalCount: 0
    };
  }
}
export async function getFinancialStats(): Promise<{
  monthlyRevenue: number;
  annualRevenue: number;
  commissionsThisMonth: number;
  commissionsThisYear: number;
  pendingPayments: number;
  overduePayments: number;
  averagePropertyROI: number;
  salesPipeline: number;
  leadConversionRate: number;
}> {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Calcular ingresos mensuales (pagos de arriendo recibidos este mes)
    const { data: monthlyPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'paid')
      .eq('payment_type', 'rent')
      .gte('payment_date', new Date(currentYear, currentMonth, 1).toISOString())
      .lt('payment_date', new Date(currentYear, currentMonth + 1, 1).toISOString());

    const monthlyRevenue = monthlyPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

    // Calcular ingresos anuales
    const { data: annualPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'paid')
      .eq('payment_type', 'rent')
      .gte('payment_date', new Date(currentYear, 0, 1).toISOString())
      .lt('payment_date', new Date(currentYear + 1, 0, 1).toISOString());

    const annualRevenue = annualPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

    // Calcular comisiones de ventas este mes
    const { data: monthlySales } = await supabase
      .from('contracts')
      .select('sale_price')
      .eq('contract_type', 'sale')
      .eq('status', 'active')
      .gte('signature_date', new Date(currentYear, currentMonth, 1).toISOString())
      .lt('signature_date', new Date(currentYear, currentMonth + 1).toISOString());

    // Asumiendo comisión del 3% para ventas
    const commissionRate = 0.03;
    const commissionsThisMonth = monthlySales?.reduce((sum, contract) =>
      sum + ((contract.sale_price || 0) * commissionRate), 0) || 0;

    // Comisiones del año
    const { data: annualSales } = await supabase
      .from('contracts')
      .select('sale_price')
      .eq('contract_type', 'sale')
      .eq('status', 'active')
      .gte('signature_date', new Date(currentYear, 0, 1).toISOString())
      .lt('signature_date', new Date(currentYear + 1, 0, 1).toISOString());

    const commissionsThisYear = annualSales?.reduce((sum, contract) =>
      sum + ((contract.sale_price || 0) * commissionRate), 0) || 0;

    // Pagos pendientes
    const { data: pendingPaymentsData } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'pending')
      .lt('due_date', currentDate.toISOString());

    const pendingPayments = pendingPaymentsData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

    // Pagos vencidos
    const { data: overduePaymentsData } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'overdue');

    const overduePayments = overduePaymentsData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

    // Calcular ROI promedio de propiedades (ingreso mensual / precio de venta * 100)
    const { data: properties } = await supabase
      .from('properties')
      .select('price')
      .eq('status', 'rented');

    const { data: rentalContracts } = await supabase
      .from('contracts')
      .select('monthly_rent')
      .eq('contract_type', 'rental')
      .eq('status', 'active');

    const averageMonthlyRent = rentalContracts?.reduce((sum, contract) =>
      sum + (contract.monthly_rent || 0), 0) || 0;
    const averagePropertyPrice = properties?.reduce((sum, property) =>
      sum + (property.price || 0), 0) || 0;

    const averagePropertyROI = properties && properties.length > 0 && rentalContracts && rentalContracts.length > 0
      ? ((averageMonthlyRent / rentalContracts.length) / (averagePropertyPrice / properties.length)) * 100 * 12
      : 0;

    // Pipeline de ventas (valor de propiedades en negociación)
    const { data: pipelineProperties } = await supabase
      .from('properties')
      .select('price')
      .eq('status', 'reserved');

    const salesPipeline = pipelineProperties?.reduce((sum, property) =>
      sum + (property.price || 0), 0) || 0;

    // Tasa de conversión de leads (consultas que resultaron en contratos)
    const { data: totalInquiries } = await supabase
      .from('service_inquiries')
      .select('id')
      .is('deleted_at', null)
      .gte('created_at', new Date(currentYear, 0, 1).toISOString());

    const { data: convertedInquiries } = await supabase
      .from('service_inquiries')
      .select('id')
      .is('deleted_at', null)
      .eq('status', 'completed')
      .gte('created_at', new Date(currentYear, 0, 1).toISOString());

    const leadConversionRate = totalInquiries && totalInquiries.length > 0
      ? (convertedInquiries?.length || 0) / totalInquiries.length * 100
      : 0;

    return {
      monthlyRevenue,
      annualRevenue,
      commissionsThisMonth,
      commissionsThisYear,
      pendingPayments,
      overduePayments,
      averagePropertyROI,
      salesPipeline,
      leadConversionRate
    };

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas financieras:', error);

    // Retornar valores por defecto en caso de error
    return {
      monthlyRevenue: 0,
      annualRevenue: 0,
      commissionsThisMonth: 0,
      commissionsThisYear: 0,
      pendingPayments: 0,
      overduePayments: 0,
      averagePropertyROI: 0,
      salesPipeline: 0,
      leadConversionRate: 0
    };
  }
}
export async function getDashboardStats(): Promise<{
  properties: {
    total: number;
    forSale: number;
    forRent: number;
    sold: number;
    rented: number;
    featured: number;
  };
  appointments: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
  };
  inquiries: {
    total: number;
    pending: number;
    thisMonth: number;
    byService: Record<string, number>;
  };
  advisors: {
    total: number;
    active: number;
  };
  clients: {
    unique: number;
    thisMonth: number;
  };
  financial: {
    monthlyRevenue: number;
    annualRevenue: number;
    commissionsThisMonth: number;
    commissionsThisYear: number;
    pendingPayments: number;
    overduePayments: number;
    averagePropertyROI: number;
    salesPipeline: number;
    leadConversionRate: number;
  };
}> {
  try {

    // Obtener datos en paralelo
    const [
      properties,
      advisors,
      appointments,
      inquiriesStats,
      financialStats
    ] = await Promise.all([
      getProperties(),
      getAdvisors(),
      getAllPropertyAppointments(),
      getServiceInquiriesStats(),
      getFinancialStats()
    ]);

    // Procesar estadísticas de propiedades
    const propertiesStats = {
      total: properties.length,
      forSale: properties.filter((p: Property) => p.status === 'sale').length,
      forRent: properties.filter((p: Property) => p.status === 'rent').length,
      sold: properties.filter((p: Property) => p.status === 'sold').length,
      rented: properties.filter((p: Property) => p.status === 'rented').length,
      featured: properties.filter((p: Property) => p.featured).length
    };

    // Procesar estadísticas de citas
    const appointmentsStats = {
      total: appointments.length,
      pending: appointments.filter((apt: any) => apt.status === 'pending').length,
      confirmed: appointments.filter((apt: any) => apt.status === 'confirmed').length,
      completed: appointments.filter((apt: any) => apt.status === 'completed').length
    };

    // Procesar estadísticas de asesores
    const advisorsStats = {
      total: advisors.length,
      active: advisors.filter((advisor: any) => advisor.active !== false).length
    };

    // Procesar estadísticas de clientes
    const uniqueClients = new Set();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let clientsThisMonth = 0;


    appointments.forEach((apt: any) => {
      if (apt.client_email) {
        uniqueClients.add(apt.client_email);

        const aptDate = new Date(apt.created_at);
        if (aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear) {
          clientsThisMonth++;
        }
      }
    });

    const clientsStats = {
      unique: uniqueClients.size,
      thisMonth: clientsThisMonth
    };

    const dashboardStats = {
      properties: propertiesStats,
      appointments: appointmentsStats,
      inquiries: {
        total: inquiriesStats.total,
        pending: inquiriesStats.pending,
        thisMonth: inquiriesStats.this_month,
        byService: inquiriesStats.by_service
      },
      advisors: advisorsStats,
      clients: clientsStats,
      financial: financialStats
    };

    return dashboardStats;

  } catch (error) {
    console.error('❌ Error en getDashboardStats:', error);
    throw error;
  }
}

// ==========================================
// GESTIÓN DE IMÁGENES - STORAGE
// ==========================================

// Función para subir imagen a Supabase Storage (mejorada con código de propiedad)
export async function uploadPropertyImage(file: File, propertyCode?: string, withWatermark: boolean = true): Promise<string> {
  try {
    console.log(`📤 Subiendo imagen${propertyCode ? ` para ${propertyCode}` : ''}...`);
    
    // Validar archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      throw new Error('Formato de archivo no válido. Solo JPG, PNG y WebP permitidos.');
    }
    
    if (file.size > maxSize) {
      throw new Error('Archivo muy grande. Máximo 5MB por imagen.');
    }

    // ✨ AGREGAR MARCA DE AGUA SI ESTÁ HABILITADA
    let fileToUpload = file;
    if (withWatermark) {
      try {
        console.log('🎨 ========================================');
        console.log('🎨 INICIANDO PROCESO DE MARCA DE AGUA');
        console.log('🎨 ========================================');
        console.log('📄 Archivo a procesar:', file.name, `(${(file.size / 1024).toFixed(2)} KB)`);
        
        const { addWatermarkToImage } = await import('./watermark');
        
        fileToUpload = await addWatermarkToImage(file, '/LogoEnBlancoo.png', {
          opacity: 0.25, // Transparencia sutil
          position: 'center', // Centrado perfecto
          scale: 0.6, // Marca de agua más grande (60% del ancho)
          margin: 0,
          rotation: 0 // SIN rotación - perfectamente alineada
        });
        
        console.log('✅ ========================================');
        console.log('✅ MARCA DE AGUA APLICADA EXITOSAMENTE');
        console.log('✅ ========================================');
        console.log('📄 Archivo original:', file.name, `(${(file.size / 1024).toFixed(2)} KB)`);
        console.log('📄 Archivo procesado:', fileToUpload.name, `(${(fileToUpload.size / 1024).toFixed(2)} KB)`);
        
      } catch (watermarkError) {
        console.error('❌ ========================================');
        console.error('❌ ERROR AL AGREGAR MARCA DE AGUA');
        console.error('❌ ========================================');
        console.error('Error completo:', watermarkError);
        console.warn('⚠️ Subiendo imagen original sin marca de agua');
        fileToUpload = file; // Si falla, usar imagen original
      }
    } else {
      console.log('ℹ️ Subiendo imagen sin marca de agua (opción deshabilitada por el usuario)');
    }
    
    // Generar nombre único para el archivo
    const fileExt = fileToUpload.name.split('.').pop();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const fileName = `${timestamp}-${randomId}.${fileExt}`;
    
    // Organizar por código de propiedad si está disponible
    const filePath = propertyCode 
      ? `${propertyCode}/${fileName}` 
      : `properties/${fileName}`;
    
    console.log(`📁 Ruta de archivo: ${filePath}`);
    
    // Subir archivo a Supabase Storage
    const { error } = await supabase.storage
      .from('property-images')
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Error subiendo imagen:', error);
      throw error;
    }
    
    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath);
    
    console.log('✅ Imagen subida exitosamente');
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('❌ Error en uploadPropertyImage:', error);
    throw error;
  }
}

// Función para eliminar imagen de Supabase Storage
export async function deletePropertyImage(imageUrl: string): Promise<boolean> {
  try {
    // Extraer el path del archivo de la URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `properties/${fileName}`;
    
    
    const { error } = await supabase.storage
      .from('property-images')
      .remove([filePath]);
    
    if (error) {
      console.error('❌ Error eliminando imagen:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error en deletePropertyImage:', error);
    return false;
  }
}

// ==================== PROPERTY STATISTICS ====================

// Función para obtener estadísticas de una propiedad
export async function getPropertyStats(propertyId: number) {
  try {
    console.log('📊 Obteniendo estadísticas para propiedad:', propertyId);
    
    // Por ahora retornamos estadísticas por defecto hasta que se cree la tabla property_stats
    const defaultStats = {
      property_id: propertyId,
      views: Math.floor(Math.random() * 50) + 1, // Datos simulados
      inquiries: Math.floor(Math.random() * 10),
      appointments: Math.floor(Math.random() * 5),
      last_viewed: new Date().toISOString()
    };

    console.log('✅ Estadísticas obtenidas:', defaultStats);
    return defaultStats;

    /* Comentado hasta que se cree la tabla
    const { data, error } = await supabase
      .from('property_stats')
      .select('*')
      .eq('property_id', propertyId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 es "no rows found"
      throw error;
    }

    return data || defaultStats;
    */
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de propiedad:', error);
    return {
      property_id: propertyId,
      views: 0,
      inquiries: 0,
      appointments: 0,
      last_viewed: null
    };
  }
}

// Función para incrementar vistas de propiedad
export async function incrementPropertyViews(propertyId: number, userInfo: any = {}) {
  try {
    const { error } = await supabase.rpc('increment_property_views', {
      prop_id: propertyId,
      user_info: userInfo
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Error incrementando vistas:', error);
    return false;
  }
}

// Función para incrementar consultas de propiedad
export async function incrementPropertyInquiries(propertyId: number, inquiryDetails: any = {}) {
  try {
    const { error } = await supabase.rpc('increment_property_inquiries', {
      prop_id: propertyId,
      inquiry_details: inquiryDetails
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Error incrementando consultas:', error);
    return false;
  }
}

// Función para incrementar citas de propiedad
export async function incrementPropertyAppointments(propertyId: number, appointmentDetails: any = {}) {
  try {
    const { error } = await supabase.rpc('increment_property_appointments', {
      prop_id: propertyId,
      appointment_details: appointmentDetails
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Error incrementando citas:', error);
    return false;
  }
}

// Función para obtener actividad reciente de una propiedad (usando property_appointments como alternativa)
export async function getPropertyActivity(propertyId: number, limit: number = 10) {
  try {
    // Usamos property_appointments como tabla de actividad alternativa
    const { data, error } = await supabase
      .from('property_appointments')
      .select('*')
      .eq('property_id', propertyId)
      .is('deleted_at', null)  // Excluir citas eliminadas
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Error obteniendo actividad de propiedad:', error);
    return [];
  }
}

// Función para registrar actividad personalizada
export async function logPropertyActivity(
  propertyId: number, 
  activityType: string, 
  details: any = {}
) {
  try {
    // TEMPORAL: Tabla property_activity no existe aún
    console.log('📝 Actividad registrada (modo temporal):', { propertyId, activityType, details });
    return true;
    
    /* 
    const { error } = await supabase
      .from('property_activity')
      .insert({
        property_id: propertyId,
        activity_type: activityType,
        details,
        user_info: userInfo
      });

    if (error) throw error;
    return true;
    */
  } catch (error) {
    console.error('❌ Error registrando actividad:', error);
    return false;
  }
}

// ==========================================
// GESTIÓN DE PROPIEDADES - ADMIN
// ==========================================

// Función para crear una nueva propiedad
export async function createProperty(propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at'>) {
  try {
    // Validar datos requeridos
    if (!propertyData.title || !propertyData.location) {
      throw new Error('Título y ubicación son campos obligatorios');
    }

    // Validar availability_type
    if (!propertyData.availability_type || !['sale', 'rent', 'both'].includes(propertyData.availability_type)) {
      throw new Error('Tipo de disponibilidad debe ser: sale, rent o both');
    }

    // Validar precios basados en availability_type
    if (propertyData.availability_type === 'sale' || propertyData.availability_type === 'both') {
      if (!propertyData.sale_price || propertyData.sale_price <= 0) {
        throw new Error('Precio de venta es obligatorio para propiedades en venta');
      }
    }

    if (propertyData.availability_type === 'rent' || propertyData.availability_type === 'both') {
      if (!propertyData.rent_price || propertyData.rent_price <= 0) {
        throw new Error('Precio de arriendo es obligatorio para propiedades en arriendo');
      }
    }

    // Validar que bedrooms, bathrooms y area sean números positivos
    if (propertyData.bedrooms !== undefined && propertyData.bedrooms < 0) {
      throw new Error('El número de habitaciones no puede ser negativo');
    }

    if (propertyData.bathrooms !== undefined && propertyData.bathrooms < 0) {
      throw new Error('El número de baños no puede ser negativo');
    }

    if (propertyData.area !== undefined && propertyData.area <= 0) {
      throw new Error('El área debe ser mayor a 0');
    }

    // Preparar los datos sin created_at y updated_at (son automáticos)
    const processedData = {
      ...propertyData,
      amenities: propertyData.amenities || [],
      images: propertyData.images || [],
      featured: propertyData.featured || false
    };

    console.log('📝 Creando propiedad con datos:', processedData);

    const { data, error } = await supabase
      .from('properties')
      .insert([processedData])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error al crear propiedad:', error);
      if (error.code === '23505') {
        throw new Error('Ya existe una propiedad con ese título');
      }
      throw new Error(`Error al crear la propiedad: ${error.message}`);
    }

    // Registrar actividad
    if (data) {
      await logPropertyActivity(data.id, 'created', { property: processedData });
      console.log('✅ Propiedad creada exitosamente:', data.id);
    }
    
    return data as Property;
  } catch (error) {
    console.error('❌ Error en createProperty:', error);
    throw error;
  }
}

// Función para actualizar una propiedad
// Normaliza valores de status para que coincidan con el esquema de la base de datos
function normalizePropertyStatus(s: string): Property['status'] {
  const v = (s || '').toLowerCase().trim();
  if (['sale','venta','sale','for sale'].includes(v)) return 'sale';
  if (['rent','renta','rental','alquiler','for rent'].includes(v)) return 'rent';
  if (['both','venta y arriendo','venta y alquiler','ambos','sale and rent'].includes(v)) return 'both';
  if (['sold','vendido','vendida','sale','venta','for sale'].includes(v)) return 'sold';
  if (['rented','arrendada','arrendado','occupied','ocupada','ocupado'].includes(v)) return 'rented';
  if (['reserved','reservada','reservado','booked'].includes(v)) return 'reserved';
  if (['maintenance','mantenimiento','in_repair'].includes(v)) return 'maintenance';
  if (['pending','pendiente','en_revision'].includes(v)) return 'pending';
  // fallback
  return 'available';
}

export async function updateProperty(propertyId: number, propertyData: Partial<Property>) {
  try {
    // Validar que exista al menos un campo para actualizar
    const updateFields = Object.keys(propertyData).filter(key => 
      key !== 'id' && 
      key !== 'created_at' && 
      key !== 'updated_at' && // Este campo no existe en la tabla
      propertyData[key as keyof Property] !== undefined && 
      propertyData[key as keyof Property] !== null
    );
    
    if (updateFields.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    // Validaciones específicas basadas en availability_type
    if (propertyData.availability_type) {
      if (!['sale', 'rent', 'both'].includes(propertyData.availability_type)) {
        throw new Error('Tipo de disponibilidad debe ser: sale, rent o both');
      }

      // Validar precios basados en availability_type
      if (propertyData.availability_type === 'sale' || propertyData.availability_type === 'both') {
        if (propertyData.sale_price !== undefined && propertyData.sale_price <= 0) {
          throw new Error('Precio de venta debe ser mayor a 0');
        }
      }

      if (propertyData.availability_type === 'rent' || propertyData.availability_type === 'both') {
        if (propertyData.rent_price !== undefined && propertyData.rent_price <= 0) {
          throw new Error('Precio de arriendo debe ser mayor a 0');
        }
      }
    }

    // Validaciones específicas
    if (propertyData.price !== undefined && propertyData.price <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }

    if (propertyData.bedrooms !== undefined && propertyData.bedrooms < 0) {
      throw new Error('El número de habitaciones no puede ser negativo');
    }

    if (propertyData.bathrooms !== undefined && propertyData.bathrooms < 0) {
      throw new Error('El número de baños no puede ser negativo');
    }

    if (propertyData.area !== undefined && propertyData.area <= 0) {
      throw new Error('El área debe ser mayor a 0');
    }

  // Preparar datos para actualización, mapeando campos correctamente
    const updateData: any = { ...propertyData };
    
    // Limpiar campos que no deben ser actualizados o no existen
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at; // No existe en la tabla
    delete updateData.neighborhood_info; // No existe en la tabla
    delete updateData.price_history; // No existe en la tabla
    delete updateData.virtual_tour_url; // No existe en la tabla
    
    // Mapear coordenadas si existen
    if (propertyData.latitude !== undefined) {
      updateData.lat = propertyData.latitude;
      delete updateData.latitude;
    }
    
    if (propertyData.longitude !== undefined) {
      updateData.lng = propertyData.longitude;
      delete updateData.longitude;
    }

    console.log(`📝 Actualizando propiedad ${propertyId} con datos:`, updateData);

    // Normalizar status si viene en payload para evitar violaciones de check constraint
    // IMPORTANT: normalizar incluso si viene como cadena vacía ('')
    if (Object.prototype.hasOwnProperty.call(updateData, 'status')) {
      updateData.status = normalizePropertyStatus(String(updateData.status || ''));
    }
    
    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', propertyId)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error al actualizar propiedad:', error);
      if (error.code === 'PGRST116') {
        throw new Error('Propiedad no encontrada');
      }
      throw new Error(`Error al actualizar la propiedad: ${error.message}`);
    }

    // Registrar actividad (comentado temporalmente para evitar errores)
    if (data) {
      try {
        // await logPropertyActivity(propertyId, 'updated', { updates: updateData });
        console.log('✅ Propiedad actualizada exitosamente:', propertyId);
      } catch (logError) {
        console.warn('⚠️ Error al registrar actividad, pero actualización exitosa:', logError);
      }
    }
    
    return data as Property;
  } catch (error) {
    console.error('❌ Error en updateProperty:', error);
    throw error;
  }
}

// Función para actualizar la imagen de portada de una propiedad
export async function updatePropertyCoverImage(propertyId: number, coverImageUrl: string) {
  try {
    console.log(`📸 Actualizando imagen de portada para propiedad ${propertyId}:`, coverImageUrl);
    
    const { data, error } = await supabase
      .from('properties')
      .update({ cover_image: coverImageUrl })
      .eq('id', propertyId)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error al actualizar imagen de portada:', error);
      if (error.code === 'PGRST116') {
        throw new Error('Propiedad no encontrada');
      }
      throw new Error(`Error al actualizar la imagen de portada: ${error.message}`);
    }

    console.log('✅ Imagen de portada actualizada exitosamente');
    return data as Property;
  } catch (error) {
    console.error('❌ Error en updatePropertyCoverImage:', error);
    throw error;
  }
}

// Función para eliminar una propiedad
export async function deleteProperty(propertyId: number) {
  try {
    console.log(`🗑️ Iniciando eliminación de propiedad: ${propertyId}`);

    // Verificar que la propiedad existe antes de eliminar
    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (fetchError) {
      console.error('❌ Error al buscar propiedad:', fetchError);
      if (fetchError.code === 'PGRST116') {
        throw new Error('Propiedad no encontrada');
      }
      throw new Error(`Error al buscar la propiedad: ${fetchError.message}`);
    }

    if (!property) {
      throw new Error('Propiedad no encontrada');
    }

    // Verificar si la propiedad tiene citas pendientes (excluir las soft-deleted)
    const { data: appointments, error: appointmentsError } = await supabase
      .from('property_appointments')
      .select('id, status')
      .eq('property_id', propertyId)
      .in('status', ['pending', 'confirmed'])
      .is('deleted_at', null)  // Solo contar citas que NO han sido eliminadas

    if (appointmentsError) {
      console.warn('⚠️ Error al verificar citas:', appointmentsError);
    }

    if (appointments && appointments.length > 0) {
      throw new Error(`No se puede eliminar la propiedad. Tiene ${appointments.length} citas pendientes o confirmadas.`);
    }

    // Registrar actividad antes de eliminar
    await logPropertyActivity(propertyId, 'deleted', { 
      property: property,
      deleted_at: new Date().toISOString() 
    });

    // Soft delete - marcar como eliminada en lugar de eliminar físicamente
    const { error } = await supabase
      .from('properties')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', propertyId);    if (error) {
      console.error('❌ Error al eliminar propiedad:', error);
      throw new Error(`Error al eliminar la propiedad: ${error.message}`);
    }

    console.log('✅ Propiedad eliminada exitosamente (soft delete):', propertyId);
    return true;
  } catch (error) {
    console.error('❌ Error en deleteProperty:', error);
    throw error;
  }
}

// ==========================================
// FUNCIONES DE NOTIFICACIONES Y ESTADO
// ==========================================

// Función para obtener propiedades por estado
export async function getPropertiesByStatus(status: string) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        advisor:advisor_id (
          id,
          name,
          email,
          phone,
          specialization,
          image_url
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener propiedades por estado:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error en getPropertiesByStatus:', error);
    throw error;
  }
}

// Función para cambiar estado de propiedad
export async function updatePropertyStatus(propertyId: number, newStatus: string, reason?: string) {
  try {
    const normalized = normalizePropertyStatus(newStatus);
    const { data, error } = await supabase
      .from('properties')
      .update({ 
        status: normalized,
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al actualizar estado:', error);
      throw error;
    }

    // Registrar actividad de cambio de estado
    await logPropertyActivity(propertyId, 'status_changed', { 
      newStatus, 
      reason: reason || 'Sin razón especificada' 
    });

    return data;
  } catch (error) {
    console.error('❌ Error en updatePropertyStatus:', error);
    throw error;
  }
}

// Función para obtener resumen de actividades recientes
export async function getRecentActivities(limit: number = 10) {
  try {
    // TEMPORAL: Tabla property_activity no existe aún
    console.log('📊 Obteniendo actividades recientes (modo temporal)', { limit });
    return [];
    
    /*
    const { data, error } = await supabase
      .from('property_activity')
      .select(`
        *,
        property:property_id (
          id,
          title,
          location
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error al obtener actividades recientes:', error);
      throw error;
    }

    return data || [];
    */
  } catch (error) {
    console.error('❌ Error en getRecentActivities:', error);
    throw error;
  }
}

// Función para obtener propiedades que requieren atención
export async function getPropertiesNeedingAttention() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        advisor:advisor_id (
          id,
          name,
          email
        )
      `)
      // Use canonical status 'available' (was 'disponible') and check updated_at
      .or(`status.eq.available,updated_at.lt.${thirtyDaysAgo.toISOString()}`)
      .order('updated_at', { ascending: true });

    if (error) {
      console.error('❌ Error al obtener propiedades que necesitan atención:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error en getPropertiesNeedingAttention:', error);
    throw error;
  }
}

// Obtener inquilinos activos para una lista de property ids
export async function getActiveTenantsForProperties(propertyIds: number[] | string[]) {
  try {
    const ids = propertyIds.map(id => String(id));
    const { data, error } = await supabase
      .from('client_property_relations')
      .select('id, property_id, client_id, relation_type, status, client:client_id ( id, full_name, email, phone )')
      .in('property_id', ids)
      .eq('relation_type', 'tenant')
      .eq('status', 'active');

    if (error) {
      console.error('❌ Error en getActiveTenantsForProperties:', error);
      return {};
    }

    const map: Record<string, any> = {};
    (data || []).forEach((r: any) => {
      map[String(r.property_id)] = r.client || null;
    });

    return map;
  } catch (error) {
    console.error('❌ Error en getActiveTenantsForProperties:', error);
    return {};
  }
}

// ==========================================
// FUNCIONES DE MANEJO DE IMÁGENES AVANZADAS
// ==========================================

// Función para subir múltiples imágenes con código de propiedad
export async function bulkUploadPropertyImages(
  files: File[], 
  propertyCode: string,
  onProgress?: (current: number, total: number) => void,
  withWatermark: boolean = true
): Promise<string[]> {
  
  console.log(`📤 Subida masiva: ${files.length} imágenes para ${propertyCode}`);
  console.log(`🎨 Marca de agua: ${withWatermark ? 'ACTIVADA ✅' : 'DESACTIVADA ❌'}`);
  
  const uploadedUrls: string[] = [];
  const errors: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    try {
      onProgress?.(i + 1, files.length);
      const url = await uploadPropertyImage(files[i], propertyCode, withWatermark);
      uploadedUrls.push(url);
      
    } catch (error) {
      console.error(`❌ Error subiendo ${files[i].name}:`, error);
      errors.push(`${files[i].name}: ${(error as Error).message || 'Error desconocido'}`);
    }
  }
  
  if (errors.length > 0) {
    console.warn('⚠️ Algunos archivos no se pudieron subir:', errors);
  }
  
  console.log(`✅ Subida completada: ${uploadedUrls.length}/${files.length} exitosas`);
  return uploadedUrls;
}

// Función para obtener todas las imágenes de una propiedad por código
export async function getPropertyImagesByCode(propertyCode: string): Promise<string[]> {
  try {
    console.log(`🖼️ Obteniendo imágenes para propiedad ${propertyCode}...`);
    
    const { data, error } = await supabase.storage
      .from('property-images')
      .list(propertyCode, {
        limit: 20,
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) {
      console.error('❌ Error obteniendo imágenes:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log(`📭 No se encontraron imágenes para ${propertyCode}`);
      return [];
    }
    
    // Generar URLs públicas
    const imageUrls = data.map(file => {
      const { data: publicUrlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(`${propertyCode}/${file.name}`);
      return publicUrlData.publicUrl;
    });
    
    console.log(`✅ ${imageUrls.length} imágenes encontradas para ${propertyCode}`);
    return imageUrls;
    
  } catch (error) {
    console.error('❌ Error en getPropertyImagesByCode:', error);
    return [];
  }
}

// Función para generar próximo código de propiedad disponible
/**
 * Genera automáticamente un código único para una propiedad
 * Reutiliza códigos de propiedades eliminadas si existen
 * Formato: CA-001, CA-002, etc.
 */
export async function generatePropertyCode(): Promise<string> {
  try {
    console.log('🔢 Generando código de propiedad automático...');
    
    // 1. Obtener TODOS los códigos existentes
    const { data: existingProperties, error: fetchError } = await supabase
      .from('properties')
      .select('code')
      .not('code', 'is', null)
      .order('code', { ascending: true });
    
    if (fetchError) {
      console.error('❌ Error obteniendo códigos existentes:', fetchError);
      return 'CA-001'; // Código por defecto
    }
    
    // 2. Si no hay propiedades, retornar el primer código
    if (!existingProperties || existingProperties.length === 0) {
      console.log('✨ Primera propiedad, código: CA-001');
      return 'CA-001';
    }
    
    // 3. Extraer números de los códigos existentes
    const usedNumbers = new Set<number>();
    existingProperties.forEach(prop => {
      if (prop.code) {
        const match = prop.code.match(/CA-(\d+)/);
        if (match) {
          usedNumbers.add(parseInt(match[1]));
        }
      }
    });
    
    console.log(`📊 Códigos en uso: ${usedNumbers.size}`);
    
    // 4. Buscar el primer número disponible (gaps en la secuencia)
    let nextNumber = 1;
    while (usedNumbers.has(nextNumber)) {
      nextNumber++;
    }
    
    const newCode = `CA-${nextNumber.toString().padStart(3, '0')}`;
    
    if (nextNumber <= usedNumbers.size) {
      console.log(`♻️ Reutilizando código disponible: ${newCode} (había gap en la secuencia)`);
    } else {
      console.log(`✅ Nuevo código generado: ${newCode}`);
    }
    
    return newCode;
    
  } catch (error) {
    console.error('❌ Error en generatePropertyCode:', error);
    return 'CA-001';
  }
}

// ==========================================
// FUNCIONES DE DEBUG Y TESTING
// ==========================================

// Función para debug: verificar usuarios en la base de datos
export async function debugUsers() {
  try {
    
    const { data: users, error } = await supabase
      .from('system_users')
      .select('*');
    
    if (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      return;
    }
    
    return users;
  } catch (error) {
    console.error('❌ Error en debugUsers:', error);
  }
}

// ==========================================
// RE-EXPORTAR FUNCIONES DE VIDEOS
// ==========================================

export {
  uploadPropertyVideo,
  bulkUploadPropertyVideos,
  getPropertyVideos,
  deletePropertyVideo,
  updatePropertyVideos,
  type PropertyVideo
} from './supabase-videos';

// ==========================================
// DEBUG FUNCTIONS (solo desarrollo)
// ==========================================

/**
 * DEBUG: Obtener usuarios sin verificar permisos (solo para diagnóstico)
 */
export async function getUsersDebug(): Promise<{ data: UserProfile[]; total: number }> {
  try {
    console.log('🔍 DEBUG: getUsersDebug called - bypassing permissions');

    // Query directa sin verificar permisos de admin
    const { data, error, count } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    console.log('🔍 DEBUG: Query result:', { data: data?.length || 0, count, error });

    if (error) {
      console.error('❌ DEBUG: Error obteniendo usuarios:', error);
      throw error;
    }

    return {
      data: data || [],
      total: count || 0
    };
  } catch (error) {
    console.error('❌ DEBUG: Error en getUsersDebug:', error);
    throw error;
  }
}

/**
 * DEBUG: Verificar si las políticas RLS están funcionando
 */
export async function debugRLSPolicies(): Promise<{
  currentUserId: string | null;
  currentUserRole: string | null;
  isAdminResult: boolean;
  directQueryResult: any[];
  policyTest: any[];
}> {
  try {
    console.log('🔍 DEBUG: Testing RLS policies...');

    // Obtener usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('No authenticated user');
    }

    const currentUserId = user.id;
    console.log('🔍 DEBUG: Current user ID:', currentUserId);

    // Verificar rol del usuario actual
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role, is_active')
      .eq('id', currentUserId)
      .single();

    if (profileError) {
      console.error('❌ DEBUG: Error getting profile:', profileError);
      throw profileError;
    }

    console.log('🔍 DEBUG: Current user profile:', profile);

    // Probar función is_admin()
    const { data: isAdminResult, error: adminError } = await supabase.rpc('is_admin');
    console.log('🔍 DEBUG: is_admin() result:', isAdminResult, 'error:', adminError);

    // Intentar query directa (debería funcionar con RLS)
    const { data: directQueryResult, error: directError } = await supabase
      .from('user_profiles')
      .select('id, email, role')
      .limit(10);

    console.log('🔍 DEBUG: Direct query result:', directQueryResult, 'error:', directError);

    // Query sin RLS (usando service role si está disponible)
    let policyTest: any[] = [];
    try {
      // Esta query podría fallar si no tenemos permisos de service role
      const { data: allUsers, error: allError } = await supabase
        .from('user_profiles')
        .select('id, email, role')
        .limit(10);

      policyTest = allUsers || [];
      console.log('🔍 DEBUG: All users query result:', allUsers, 'error:', allError);
    } catch (e) {
      console.log('🔍 DEBUG: Could not query all users (expected with RLS):', e);
    }

    return {
      currentUserId,
      currentUserRole: profile?.role || null,
      isAdminResult: isAdminResult || false,
      directQueryResult: directQueryResult || [],
      policyTest
    };

  } catch (error) {
    console.error('❌ DEBUG: Error in debugRLSPolicies:', error);
    throw error;
  }
}

/**
 * DEBUG: Crear usuario manualmente (solo para desarrollo/testing)
 * Versión mejorada que maneja usuarios existentes en auth
 */
export async function createUserManually(userData: {
  email: string;
  password: string;
  full_name?: string;
  role?: 'admin' | 'advisor' | 'user';
}): Promise<any> {
  try {
    console.log('🛠️ Creando usuario manualmente:', userData.email);

    // PRIMERO: Verificar si el usuario ya existe en auth.users
    console.log('🔍 Verificando si usuario ya existe en auth...');
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Error listando usuarios:', listError);
      throw listError;
    }

    const existingUser = existingUsers.users.find(u => u.email === userData.email);
    let userId: string;

    if (existingUser) {
      console.log('✅ Usuario ya existe en auth:', existingUser.email, 'ID:', existingUser.id);
      userId = existingUser.id;

      // Actualizar contraseña si se proporcionó una nueva
      if (userData.password) {
        console.log('🔄 Actualizando contraseña...');
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
          password: userData.password
        });
        if (updateError) {
          console.warn('⚠️ No se pudo actualizar contraseña:', updateError);
        } else {
          console.log('✅ Contraseña actualizada');
        }
      }
    } else {
      console.log('🆕 Usuario no existe, creando en auth...');
      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name || userData.email.split('@')[0]
        }
      });

      if (authError) {
        console.error('❌ Error creando usuario en auth:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario');
      }

      userId = authData.user.id;
      console.log('✅ Usuario creado en auth:', authData.user.email);
    }

    // SEGUNDO: Crear o actualizar perfil usando UPSERT
    console.log('📝 Creando/actualizando perfil...');
    const profileData = {
      id: userId,
      email: userData.email,
      full_name: userData.full_name || userData.email.split('@')[0],
      role: userData.role || 'user',
      phone: null,
      department: null,
      position: null,
      is_active: true
    };

    // Usar UPSERT para evitar conflictos si el perfil ya existe
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .upsert(profileData, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creando/actualizando perfil:', profileError);
      throw profileError;
    }

    console.log('✅ Perfil creado/actualizado exitosamente:', profile.email, 'Rol:', profile.role);
    return profile;

  } catch (error: any) {
    console.error('❌ Error en createUserManually:', error);
    throw error;
  }
}

// Exponer funciones de debug globalmente solo para desarrollo
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).debugRLSPolicies = debugRLSPolicies;
  (window as any).getUsersDebug = getUsersDebug;
  (window as any).createUserManually = createUserManually;
}

// ==========================================
// FUNCIONES DE WHATSAPP
// ==========================================

/**
 * Enviar mensaje de WhatsApp al cliente para confirmar cita
 */
export async function sendWhatsAppToClient(
  phoneNumber: string,
  data: {
    client_name: string;
    appointment_date: string;
    appointment_type: string;
    property_title: string;
    advisor_name: string;
    appointment_id?: string;
  }
): Promise<boolean> {
  try {
    console.log('📱 Enviando WhatsApp al cliente:', phoneNumber);

    // Formatear fecha para Colombia
    const appointmentDate = new Date(data.appointment_date);
    const formattedDate = appointmentDate.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Crear mensaje de WhatsApp
    const message = `Hola ${data.client_name}! 👋

Tu cita ha sido agendada exitosamente:

🏠 *Propiedad:* ${data.property_title}
📅 *Fecha:* ${formattedDate}
🏷️ *Tipo:* ${data.appointment_type}
👨‍💼 *Asesor:* ${data.advisor_name}

Te esperamos en nuestras oficinas.
¿Tienes alguna pregunta?

*Inmobiliaria Coworking*`;

    // Codificar mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    console.log('✅ WhatsApp URL generado:', whatsappUrl);

    // En un entorno real, aquí se haría la llamada a la API de WhatsApp
    // Por ahora, solo simulamos el envío
    console.log('📤 Simulando envío de WhatsApp al cliente');

    // En producción, aquí iría la integración con Twilio, 360Dialog, etc.
    // Por ejemplo:
    // const response = await fetch('/api/whatsapp/send', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ phoneNumber, message })
    // });

    return true;

  } catch (error) {
    console.error('❌ Error enviando WhatsApp al cliente:', error);
    return false;
  }
}

/**
 * Enviar mensaje de WhatsApp al asesor confirmando cita asignada
 */
export async function sendWhatsAppConfirmationToAdvisor(
  phoneNumber: string,
  data: {
    client_name: string;
    appointment_date: string;
    appointment_type: string;
    property_title: string;
    advisor_name: string;
    client_phone: string;
    client_email: string;
  }
): Promise<boolean> {
  try {
    console.log('📱 Enviando WhatsApp al asesor:', phoneNumber);

    // Formatear fecha para Colombia
    const appointmentDate = new Date(data.appointment_date);
    const formattedDate = appointmentDate.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Crear mensaje de WhatsApp para el asesor
    const message = `Hola ${data.advisor_name}! 👋

Se ha confirmado una nueva cita a tu nombre:

👤 *Cliente:* ${data.client_name}
📧 *Email:* ${data.client_email}
📱 *Teléfono:* ${data.client_phone}
🏠 *Propiedad:* ${data.property_title}
📅 *Fecha:* ${formattedDate}
🏷️ *Tipo:* ${data.appointment_type}

Por favor confirma tu disponibilidad.

*Sistema de Citas - Inmobiliaria Coworking*`;

    // Codificar mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    console.log('✅ WhatsApp URL generado para asesor:', whatsappUrl);

    // En un entorno real, aquí se haría la llamada a la API de WhatsApp
    console.log('📤 Simulando envío de WhatsApp al asesor');

    // En producción, aquí iría la integración con Twilio, 360Dialog, etc.

    return true;

  } catch (error) {
    console.error('❌ Error enviando WhatsApp al asesor:', error);
    return false;
  }
}

