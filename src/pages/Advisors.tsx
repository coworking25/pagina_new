import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  Clock,
  MessageSquare,
  Briefcase,
  Users
} from 'lucide-react';
import { Advisor } from '../types';
import { advisors as localAdvisors } from '../data/advisors';
import Button from '../components/UI/Button';
import { CONTACT_INFO, WHATSAPP_MESSAGES } from '../constants/contact';

const Advisors: React.FC = () => {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdvisors = () => {
      try {
        setLoading(true);
        console.log('🔍 Cargando asesores locales...');
        console.log('📋 Datos de asesores:', localAdvisors);
        setAdvisors(localAdvisors);
        console.log('✅ Asesores cargados exitosamente');
      } catch (error) {
        console.error('❌ Error al cargar asesores:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAdvisors();
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
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-20">
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
            <p className="text-xl md:text-2xl text-teal-100 max-w-3xl mx-auto">
              Conoce a nuestro equipo de expertos inmobiliarios, 
              comprometidos con encontrar la propiedad perfecta para ti
            </p>
          </motion.div>
        </div>
      </div>

      {/* Advisors Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-wrap justify-center gap-8">
          {advisors.map((advisor, index) => (
            <motion.div
              key={advisor.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 w-full max-w-sm"
            >
              {/* Advisor Photo */}
              <div className="relative h-72 bg-gradient-to-br from-teal-400 to-teal-600 overflow-hidden rounded-t-2xl">
                <img
                  src={advisor.photo}
                  alt={advisor.name}
                  className="asesor-img transform hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.error(`❌ Error cargando imagen de ${advisor.name}:`, advisor.photo);
                    // Si falla la imagen específica, usar imagen por defecto del avatar profesional
                    target.src = 'https://gfczfjpyyyyvteyrvhgt.supabase.co/storage/v1/object/public/property-images/Asesores/default-advisor.jpg';
                  }}
                  onLoad={() => {
                    console.log(`✅ Imagen cargada exitosamente para ${advisor.name}:`, advisor.photo);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent"></div>
                
                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold text-gray-800">
                      {advisor.rating}
                    </span>
                  </div>
                </div>

                {/* Experience Badge */}
                <div className="absolute top-4 left-4 bg-teal-600/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4 text-white" />
                    <span className="text-sm font-semibold text-white">
                      {advisor.experience_years} años
                    </span>
                  </div>
                </div>
              </div>

              {/* Advisor Info */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {advisor.name}
                  </h3>
                  <p className="text-teal-600 dark:text-teal-400 font-medium mb-3">
                    {advisor.specialty}
                  </p>
                  
                  {/* Rating and Reviews */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(advisor.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ({advisor.reviews} reseñas)
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {advisor.bio}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Briefcase className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {advisor.experience_years}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Años exp.
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {advisor.reviews}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Clientes
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Disponibilidad:</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Lun-Vie:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {advisor.availability?.weekdays}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Sáb-Dom:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
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
                      <Phone className="w-4 h-4 mr-2 text-teal-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Llamar
                      </span>
                    </a>
                    
                    <a
                      href={`mailto:${advisor.email}`}
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Mail className="w-4 h-4 mr-2 text-teal-600" />
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
                      className="w-full flex items-center justify-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
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
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              ¿Necesitas asesoría personalizada?
            </h2>
            <p className="text-teal-100 mb-6 max-w-2xl mx-auto">
              Nuestros asesores están listos para ayudarte a encontrar la propiedad perfecta. 
              Contáctanos y recibe atención especializada.
            </p>
            <Button
              onClick={() => window.open(CONTACT_INFO.urls.whatsapp(WHATSAPP_MESSAGES.advisory), '_blank')}
              className="bg-white text-teal-600 hover:bg-gray-100"
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
