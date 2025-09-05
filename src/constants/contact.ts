// Información de contacto centralizada
export const CONTACT_INFO = {
  // Ubicación
  address: {
    street: 'Carrera 41 #38 Sur - 43',
    building: 'Edificio Emporio Local 306',
    city: 'Envigado, Antioquia, Colombia',
    coordinates: '6.168766, -75.586844',
    plusCode: '5C97+F6 Envigado, Antioquia, Colombia'
  },
  
  // Teléfonos
  phones: {
    primary: '+57 314 886 0404',
    secondary: '604 202 63 83',
    whatsapp: '573148860404' // Sin el + para URLs de WhatsApp
  },
  
  // Email
  email: {
    primary: 'inmobiliariocoworking5@gmail.com'
  },
  
  // Horarios
  schedule: {
    weekdays: 'Lun - Vie: 9:00 AM - 5:00 PM',
    weekend: 'Sáb - Dom sin atención al cliente'
  },
  
  // URLs de contacto
  urls: {
    whatsapp: (message: string = 'Hola, me gustaría obtener información sobre sus servicios') => 
      `https://wa.me/573148860404?text=${encodeURIComponent(message)}`,
    phone: '+573148860404',
    email: 'mailto:inmobiliariocoworking5@gmail.com',
    maps: 'https://maps.app.goo.gl/4B28YNWDEBy2kEkj8'
  }
};

// Mensajes predeterminados para WhatsApp
export const WHATSAPP_MESSAGES = {
  general: 'Hola, me gustaría obtener información sobre sus servicios',
  property: (propertyTitle: string, location: string) => 
    `Hola, estoy interesado en la propiedad: ${propertyTitle} ubicada en ${location}. Me gustaría obtener más información.`,
  advisory: 'Hola, necesito asesoría inmobiliaria'
};
