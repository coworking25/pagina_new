// 🌐 Funciones helper para traducir términos de inglés a español
// Centraliza las traducciones para mantener consistencia en toda la aplicación

/**
 * Traduce los tipos de citas de inglés/español a español
 */
export const getAppointmentTypeText = (type: string): string => {
  switch (type) {
    case 'visita':
    case 'viewing':
      return 'Visita';
    case 'consulta':
    case 'consultation':
      return 'Consulta';
    case 'avaluo':
    case 'valuation':
    case 'appraisal':
      return 'Avalúo';
    case 'asesoria':
    case 'follow_up':
      return 'Asesoría';
    case 'meeting':
      return 'Reunión';
    default:
      return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Sin especificar';
  }
};

/**
 * Traduce los tipos de visita de inglés/español a español
 */
export const getVisitTypeText = (type: string): string => {
  switch (type) {
    case 'presencial':
    case 'in_person':
      return 'Presencial';
    case 'virtual':
    case 'virtual_tour':
      return 'Virtual';
    case 'mixta':
      return 'Mixta';
    case 'phone_call':
      return 'Llamada Telefónica';
    default:
      return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Sin especificar';
  }
};

/**
 * Traduce los métodos de contacto de inglés/español a español
 */
export const getContactMethodText = (method: string): string => {
  switch (method) {
    case 'whatsapp':
      return 'WhatsApp';
    case 'phone':
      return 'Teléfono';
    case 'email':
      return 'Email';
    default:
      return method ? method.charAt(0).toUpperCase() + method.slice(1) : 'Sin especificar';
  }
};

/**
 * Traduce los estados de citas de inglés a español
 */
export const getAppointmentStatusText = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'confirmed':
      return 'Confirmado';
    case 'completed':
      return 'Completado';
    case 'cancelled':
      return 'Cancelado';
    case 'no_show':
      return 'No Asistió';
    case 'rescheduled':
      return 'Reprogramado';
    case 'scheduled':
      return 'Agendado';
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pendiente';
  }
};
