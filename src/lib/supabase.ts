import { createClient } from '@supabase/supabase-js';
import { Property, Advisor } from '../types';

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
      property_id: appointmentData.property_id.toString(), // VARCHAR en la tabla
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

export async function savePropertyAppointment(appointmentData: {
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
// SISTEMA DE AUTENTICACIÓN
// ==========================================

// Función para login de usuario
export async function loginUser(email: string, password: string) {
  try {
    // Verificación simple de credenciales hardcodeadas
    const validCredentials = [
      { email: 'admincoworkin@inmobiliaria.com', password: '21033384', name: 'Admin Coworkin', role: 'admin' },
      { email: 'admin@inmobiliaria.com', password: 'admin123', name: 'Administrador', role: 'admin' }
    ];
    
    const user = validCredentials.find(cred => 
      cred.email === email && cred.password === password
    );
    
    if (!user) {
      throw new Error('Credenciales incorrectas');
    }
    
    // Crear sesión simple
    const sessionToken = generateSessionToken();
    const userData = {
      id: 'user_' + Date.now(),
      email: user.email,
      full_name: user.name,
      role: user.role
    };
    
    // Guardar sesión en localStorage
    localStorage.setItem('auth_token', sessionToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
    
    return {
      user: userData,
      session: { token: sessionToken }
    };
    
  } catch (error) {
    console.error('❌ Error en login:', error);
    throw error;
  }
}

// Función para logout
export async function logoutUser() {
  try {
    // Limpiar localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    return true;
  } catch (error) {
    console.error('❌ Error en logout:', error);
    // Limpiar localStorage aunque haya error
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    return false;
  }
}

// Función para verificar si el usuario está autenticado
export async function isAuthenticated(): Promise<boolean> {
  try {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (!token || !userData) {
      return false;
    }
    
    try {
      JSON.parse(userData); // Validar que los datos sean válidos JSON
      return true;
    } catch (parseError) {
      console.error('❌ Error parseando datos de usuario:', parseError);
      // Limpiar datos corruptos
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      return false;
    }
  } catch (error) {
    console.error('❌ Error verificando autenticación:', error);
    return false;
  }
}

// Función para obtener usuario actual
export function getCurrentUser() {
  try {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('❌ Error obteniendo usuario actual:', error);
    return null;
  }
}

// Función para verificar si el usuario es admin
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

// Función para generar token de sesión
function generateSessionToken(): string {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
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
      .eq('is_active', true)
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
        photo: getAdvisorImageUrl('2.jpg'),
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
export async function getProperties(): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error al obtener propiedades:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
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
      
      return {
        id: prop.id,
        title: prop.title,
        location: prop.location,
        price: prop.price,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        area: prop.area,
        type: prop.type as 'apartment' | 'house' | 'office' | 'commercial',
        status: prop.status as 'sale' | 'rent' | 'sold' | 'rented',
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
          title: prop.title,
          location: prop.location,
          price: prop.price,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          area: prop.area,
          type: prop.type as 'apartment' | 'house' | 'office' | 'commercial',
          status: prop.status as 'sale' | 'rent' | 'sold' | 'rented',
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
        title: prop.title,
        location: prop.location,
        price: prop.price,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        area: prop.area,
        type: prop.type as 'apartment' | 'house' | 'office' | 'commercial',
        status: prop.status as 'sale' | 'rent' | 'sold' | 'rented',
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
      .select('service_type, status, created_at');
    
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
 * Obtener estadísticas completas del dashboard
 */
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
}> {
  try {
    
    // Obtener datos en paralelo
    const [
      properties,
      advisors,
      appointments,
      inquiriesStats
    ] = await Promise.all([
      getProperties(),
      getAdvisors(),
      getAllPropertyAppointments(),
      getServiceInquiriesStats()
    ]);

    // Procesar estadísticas de propiedades
    const propertiesStats = {
      total: properties.length,
      forSale: properties.filter(p => p.status === 'sale').length,
      forRent: properties.filter(p => p.status === 'rent').length,
      sold: properties.filter(p => p.status === 'sold').length,
      rented: properties.filter(p => p.status === 'rented').length,
      featured: properties.filter(p => p.featured).length
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
      clients: clientsStats
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
export async function uploadPropertyImage(file: File, propertyCode?: string): Promise<string> {
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
    
    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop();
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
      .upload(filePath, file, {
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
export async function getPropertyStats(propertyId: string) {
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
export async function incrementPropertyViews(propertyId: string, userInfo: any = {}) {
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
export async function incrementPropertyInquiries(propertyId: string, inquiryDetails: any = {}) {
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
export async function incrementPropertyAppointments(propertyId: string, appointmentDetails: any = {}) {
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
export async function getPropertyActivity(propertyId: string, limit: number = 10) {
  try {
    // Usamos property_appointments como tabla de actividad alternativa
    const { data, error } = await supabase
      .from('property_appointments')
      .select('*')
      .eq('property_id', propertyId)
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
  propertyId: string, 
  activityType: string, 
  details: any = {}, 
  userInfo: any = {}
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
    if (!propertyData.title || !propertyData.price || !propertyData.location) {
      throw new Error('Título, precio y ubicación son campos obligatorios');
    }

    // Validar que el precio sea un número positivo
    if (propertyData.price <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }

    // Validar que bedrooms, bathrooms y area sean números positivos
    if (propertyData.bedrooms < 0) {
      throw new Error('El número de habitaciones no puede ser negativo');
    }

    if (propertyData.bathrooms < 0) {
      throw new Error('El número de baños no puede ser negativo');
    }

    if (propertyData.area <= 0) {
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
export async function updateProperty(propertyId: string, propertyData: Partial<Property>) {
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

// Función para eliminar una propiedad
export async function deleteProperty(propertyId: string) {
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

    // Verificar si la propiedad tiene citas pendientes
    const { data: appointments, error: appointmentsError } = await supabase
      .from('property_appointments')
      .select('id, status')
      .eq('property_id', propertyId)
      .in('status', ['pending', 'confirmed']);

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

    // Eliminar las imágenes asociadas si existen
    if (property.images && Array.isArray(property.images) && property.images.length > 0) {
      console.log(`🖼️ Eliminando ${property.images.length} imágenes asociadas...`);
      for (const imageUrl of property.images) {
        try {
          await deletePropertyImage(imageUrl);
        } catch (imageError) {
          console.warn('⚠️ Error al eliminar imagen:', imageUrl, imageError);
          // No fallar por errores de imágenes
        }
      }
    }
    
    // Eliminar la propiedad
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);
    
    if (error) {
      console.error('❌ Error al eliminar propiedad:', error);
      throw new Error(`Error al eliminar la propiedad: ${error.message}`);
    }
    
    console.log('✅ Propiedad eliminada exitosamente:', propertyId);
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
export async function updatePropertyStatus(propertyId: string, newStatus: string, reason?: string) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .update({ 
        status: newStatus,
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
      .or(`status.eq.disponible,updated_at.lt.${thirtyDaysAgo.toISOString()}`)
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

// ==========================================
// FUNCIONES DE MANEJO DE IMÁGENES AVANZADAS
// ==========================================

// Función para subir múltiples imágenes con código de propiedad
export async function bulkUploadPropertyImages(
  files: File[], 
  propertyCode: string,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  
  console.log(`📤 Subida masiva: ${files.length} imágenes para ${propertyCode}`);
  
  const uploadedUrls: string[] = [];
  const errors: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    try {
      onProgress?.(i + 1, files.length);
      const url = await uploadPropertyImage(files[i], propertyCode);
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
export async function generatePropertyCode(): Promise<string> {
  try {
    // Obtener el último código usado
    const { data, error } = await supabase
      .from('properties')
      .select('code')
      .not('code', 'is', null)
      .order('code', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('❌ Error obteniendo último código:', error);
      return 'CA-001'; // Código por defecto
    }
    
    if (!data || data.length === 0) {
      return 'CA-001'; // Primer código
    }
    
    const lastCode = data[0].code;
    const match = lastCode.match(/CA-(\d+)/);
    
    if (match) {
      const nextNumber = parseInt(match[1]) + 1;
      return `CA-${nextNumber.toString().padStart(3, '0')}`;
    }
    
    return 'CA-001'; // Fallback
    
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

// Función para limpiar completamente la autenticación
export function clearAuth() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
}

// Exponer funciones de debug globalmente
if (typeof window !== 'undefined') {
  (window as any).debugUsers = debugUsers;
  (window as any).clearAuth = clearAuth;
  (window as any).isAuth = isAuthenticated;
}
