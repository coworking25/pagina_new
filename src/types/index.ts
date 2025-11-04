// Re-export all client-related types
export * from './clients';

// Re-export notification types
export * from './notifications';

export interface PropertyVideo {
  url: string;
  thumbnail?: string;
  title?: string;
  duration?: number;
  size?: number;
  uploaded_at?: string;
  order?: number;
}

export interface Property {
  id: number;
  code?: string;  // Código único de la propiedad (ej: CA-001)
  title: string;
  price?: number; // Mantener para compatibilidad, pero ahora opcional
  availability_type: 'sale' | 'rent' | 'both'; // Nuevo: tipo de disponibilidad
  sale_price?: number; // Nuevo: precio de venta (opcional basado en availability_type)
  rent_price?: number; // Nuevo: precio de arriendo (opcional basado en availability_type)
  bedrooms: number;
  bathrooms: number;
  area: number;
  location?: string;
  estrato?: number; // Estrato socioeconómico (1-6)
  type: 'apartment' | 'apartaestudio' | 'house' | 'office' | 'commercial';
  // Estados posibles: incluimos tanto los legacy ('sale','rent') como los canónicos
  status: 'sale' | 'rent' | 'both' | 'sold' | 'rented' | 'available' | 'reserved' | 'maintenance' | 'pending';
  images: string[];
  videos?: PropertyVideo[];  // Videos de la propiedad
  cover_image?: string;  // URL de la imagen de portada seleccionada
  cover_video?: string;  // URL del video destacado
  amenities: string[];
  featured: boolean;
  description?: string;
  latitude?: number;
  longitude?: number;
  advisor_id?: string;
  neighborhood_info?: NeighborhoodInfo;
  price_history?: PriceHistory[];
  virtual_tour_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Advisor {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  specialty: string;
  whatsapp: string;
  rating: number;
  reviews: number;
  availability?: {
    weekdays: string;
    weekends?: string;
  };
  calendar_link?: string;
  availability_hours?: string;
  bio?: string;
  experience_years?: number;
}

export interface NeighborhoodInfo {
  public_transport: string[];
  nearby_services: string[];
  safety_rating: number;
  walkability_score: number;
  schools_nearby: string[];
  shopping_centers: string[];
}

export interface PriceHistory {
  date: string;
  price: number;
  type: 'sale' | 'rent';
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
  inquiry_type: 'rent' | 'buy' | 'sell' | 'visit' | 'info';
  preferred_contact_time: string;
  property_id?: string;
  advisor_id?: string;
}

export interface ServiceInquiry {
  id?: string;
  created_at?: string;
  updated_at?: string;
  client_name: string;
  client_email?: string;
  client_phone: string;
  service_type: 'arrendamientos' | 'ventas' | 'avaluos' | 'asesorias-contables' | 'remodelacion' | 'reparacion' | 'construccion';
  urgency: 'urgent' | 'normal' | 'flexible';
  budget?: string;
  details?: string;
  selected_questions?: any; // JSONB field
  status?: 'pending' | 'contacted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  assigned_advisor_id?: string;
  whatsapp_sent?: boolean;
  whatsapp_sent_at?: string;
  response_received?: boolean;
  response_received_at?: string;
  source?: string;
  notes?: string;
  // Legacy field for compatibility
  questions_and_answers?: QuestionAnswer[];
}

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface PropertyAppointment {
  id?: string;
  created_at?: string;
  updated_at?: string;
  
  // Información del cliente
  client_name: string;
  client_email: string;
  client_phone?: string;
  
  // Información de la propiedad y la cita
  property_id: number;
  advisor_id: string;
  appointment_date: string;
  appointment_type: 'visita' | 'consulta' | 'avaluo' | 'asesoria';
  visit_type: 'presencial' | 'virtual' | 'mixta';
  attendees: number;
  special_requests?: string;
  
  // Preferencias de contacto
  contact_method: 'whatsapp' | 'phone' | 'email';
  marketing_consent: boolean;
  
  // Estado de la cita
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  
  // Información adicional para seguimiento
  follow_up_notes?: string;
  rescheduled_date?: string;
  cancellation_reason?: string;
  actual_attendees?: number;
  appointment_duration?: number; // en minutos
  appointment_rating?: number; // 1-5 estrellas
  client_feedback?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'client' | 'advisor' | 'admin';
  created_at: string;
}