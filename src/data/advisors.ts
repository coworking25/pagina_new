import { Advisor } from '../types';

export const advisors: Advisor[] = [
  {
    id: 'advisor-1',
    name: 'Santiago Sánchez',
    email: 'santiago.sanchez@inmobiliaria.com',
    phone: '+57 302 584 56 30',
    whatsapp: '573025845630',
    photo: 'https://gfczfjpyyyyvteyrvhgt.supabase.co/storage/v1/object/public/property-images/Asesores/1.jpeg', // Santiago Sánchez - Imagen desde Supabase Storage
    specialty: 'Propiedades Residenciales y Apartamentos',
    rating: 4.8,
    reviews: 127,
    availability: {
      weekdays: '9:00 AM - 5:00 PM',
      weekends: 'No disponible'
    },
    bio: 'Especialista en propiedades residenciales con más de 8 años de experiencia en el mercado inmobiliario. Experto en apartamentos y casas familiares con un enfoque personalizado para cada cliente.',
    experience_years: 8,
    availability_hours: 'Lunes a Viernes: 9:00 AM - 5:00 PM (No laboramos sábados, domingos ni festivos)',
    calendar_link: 'https://calendly.com/santiago-sanchez'
  },
  {
    id: 'advisor-2',
    name: 'Andrés Metrio',
    email: 'andres.metrio@inmobiliaria.com',
    phone: '+57 302 824 04 88',
    whatsapp: '573028240488',
    photo: 'https://gfczfjpyyyyvteyrvhgt.supabase.co/storage/v1/object/public/property-images/Asesores/2.jpg', // Andrés Metrio - Imagen desde Supabase Storage
    specialty: 'Propiedades Comerciales y Oficinas',
    rating: 4.6,
    reviews: 94,
    availability: {
      weekdays: '9:00 AM - 5:00 PM',
      weekends: 'No disponible'
    },
    bio: 'Experto en propiedades comerciales e inversiones inmobiliarias con 6 años de experiencia. Especializado en oficinas, locales comerciales y proyectos de inversión con un enfoque analítico.',
    experience_years: 6,
    availability_hours: 'Lunes a Viernes: 9:00 AM - 5:00 PM (No laboramos sábados, domingos ni festivos)',
    calendar_link: 'https://calendly.com/andres-metrio'
  }
];

export const getAdvisorById = (id: string): Advisor | undefined => {
  return advisors.find(advisor => advisor.id === id);
};

export const getRandomAdvisor = (): Advisor => {
  return advisors[Math.floor(Math.random() * advisors.length)];
};
