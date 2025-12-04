import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  MapPin, 
  Clock,
  MessageSquare,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Users
} from 'lucide-react';
import { Advisor } from '../types';
import { getAdvisors } from '../lib/supabase';
import Button from '../components/UI/Button';
import { CONTACT_INFO, WHATSAPP_MESSAGES } from '../constants/contact';

const Advisors: React.FC = () => {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        setLoading(true);
        const data = await getAdvisors();
        setAdvisors(data);
      } catch (error) {
        console.error('Error al cargar asesores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisors();
  }, []);

  const contactWhatsApp = (advisor: Advisor) => {
    const message = encodeURIComponent(
      `¡Hola ${advisor.name}! Me interesa obtener información sobre propiedades. ¿Podrías ayudarme?`
    );
    window.open(`https://wa.me/${advisor.whatsapp}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando asesores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Nuestros Asesores
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Conoce a nuestro equipo de expertos inmobiliarios, 
              comprometidos con encontrar la propiedad perfecta para ti
            </p>
          </motion.div>
        </div>
      </div>

      {/* Advisors Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advisors.map((advisor, index) => (
            <motion.div
              key={advisor.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Advisor Photo - Diseño mejorado */}
              <div className="relative">
                {/* Contenedor de imagen con aspect ratio */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                  <img
                    src={advisor.photo}
                    alt={advisor.name}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                    }}
                  />
                  {/* Overlay gradiente sutil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                
                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-bold text-gray-800">
                      {advisor.rating}
                    </span>
                  </div>
                </div>

                {/* Experience Badge */}
                <div className="absolute top-4 left-4 bg-blue-600 rounded-full px-3 py-1.5 shadow-lg">
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4 text-white" />
                    <span className="text-sm font-bold text-white">
                      {advisor.experience_years} años
                    </span>
                  </div>
                </div>

                {/* Nombre y especialidad sobre la imagen */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">
                    {advisor.name}
                  </h3>
                  <p className="text-blue-200 text-sm font-medium drop-shadow-md">
                    {advisor.specialty}
                  </p>
                </div>
              </div>

              {/* Advisor Info */}
              <div className="p-5">
                {/* Rating and Reviews */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(advisor.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ({advisor.reviews} reseñas)
                  </span>
                </div>

                {/* Bio */}
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {advisor.bio}
                </p>

                {/* Stats compactos */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-gray-900 dark:text-white">{advisor.experience_years}</span> años exp.
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-gray-900 dark:text-white">{advisor.reviews}</span> clientes
                    </span>
                  </div>
                </div>

                {/* Availability compacta */}
                <div className="mb-5">
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Disponibilidad:</span>
                  </div>
                  <div className="text-xs space-y-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Lun-Vie:</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">
                        {advisor.availability?.weekdays}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Sáb-Dom:</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">
                        {advisor.availability?.weekends}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={() => contactWhatsApp(advisor)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={`tel:${advisor.phone}`}
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Phone className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Llamar
                      </span>
                    </a>
                    
                    <a
                      href={`mailto:${advisor.email}`}
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Mail className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </span>
                    </a>
                  </div>

                  {advisor.calendar_link && (
                    <a
                      href={advisor.calendar_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar Cita
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              ¿Necesitas asesoría personalizada?
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Nuestros asesores están listos para ayudarte a encontrar la propiedad perfecta. 
              Contáctanos y recibe atención especializada.
            </p>
            <Button
              onClick={() => window.open(CONTACT_INFO.urls.whatsapp(WHATSAPP_MESSAGES.advisory), '_blank')}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Contactar Equipo
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Advisors;
