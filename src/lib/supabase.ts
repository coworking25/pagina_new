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
    const userData = localStorage.getItem('user_data');
    
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
      const user = JSON.parse(userData);
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
      const { data: existingRecord, error: checkError } = await supabase
        .from('service_inquiries')
        .select('id')
        .eq('id', id)
        .single();
        
      if (checkError) {
        console.error('❌ [SUPABASE] El registro no existe:', checkError);
      } else {
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

// Función para subir imagen a Supabase Storage
export async function uploadPropertyImage(file: File): Promise<string> {
  try {
    
    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `properties/${fileName}`;
    
    // Subir archivo a Supabase Storage
    const { error } = await supabase.storage
      .from('propiedades')
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
      .from('propiedades')
      .getPublicUrl(filePath);
    
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
      .from('propiedades')
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

// ==========================================
// GESTIÓN DE PROPIEDADES - ADMIN
// ==========================================

// Función para crear una nueva propiedad
export async function createProperty(propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at'>) {
  try {
    
    const { data, error } = await supabase
      .from('properties')
      .insert([propertyData])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error al crear propiedad:', error);
      throw error;
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
    
    const { data, error } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('id', propertyId)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error al actualizar propiedad:', error);
      throw error;
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
    
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);
    
    if (error) {
      console.error('❌ Error al eliminar propiedad:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error en deleteProperty:', error);
    throw error;
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
    
    users?.forEach(user => {
    });
    
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
