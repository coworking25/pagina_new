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
import ScheduleAppointmentModalEnhanced from '../components/Modals/ScheduleAppointmentModalEnhanced';
import { CONTACT_INFO, WHATSAPP_MESSAGES } from '../constants/contact';

const Advisors: React.FC = () => {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

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
    const cleanPhone = advisor.whatsapp.replace(/[\s\-\+]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    
    // 🎯 iOS/Safari compatible
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isIOS || isSafari) {
      const link = document.createElement('a');
      link.href = whatsappUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleScheduleAppointment = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setIsScheduleModalOpen(true);
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
      <div className="bg-[#40534C] text-white py-20">
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
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto">
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
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                boxShadow: "0 25px 50px -12px rgba(64, 83, 76, 0.25)"
              }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 w-full max-w-sm cursor-pointer"
            >
              {/* Advisor Photo */}
              <div className="relative h-72 bg-[#40534C] overflow-hidden rounded-t-2xl group">
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                  src={advisor.photo}
                  alt={advisor.name}
                  className="asesor-img w-full h-full object-cover"
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent group-hover:from-black/60 transition-all duration-300"></div>
                
                {/* Rating Badge */}
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1"
                >
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold text-gray-800">
                      {advisor.rating}
                    </span>
                  </div>
                </motion.div>

                {/* Experience Badge */}
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  className="absolute top-4 left-4 bg-[#40534C]/90 backdrop-blur-sm rounded-full px-3 py-1"
                >
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4 text-white" />
                    <span className="text-sm font-semibold text-white">
                      {advisor.experience_years} años
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Advisor Info */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {advisor.name}
                  </h3>
                  <p className="text-[#40534C] dark:text-[#6B8E7F] font-medium mb-3">
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
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -3 }}
                    className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-center mb-1">
                      <Briefcase className="w-4 h-4 text-[#40534C]" />
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {advisor.experience_years}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Años exp.
                    </div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -3 }}
                    className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-[#40534C]" />
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {advisor.reviews}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Clientes
                    </div>
                  </motion.div>
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
                  <motion.div
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      onClick={() => contactWhatsApp(advisor)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  </motion.div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <motion.a
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      href={`tel:${advisor.phone}`}
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-[#40534C] hover:border-[#40534C] hover:text-white transition-all duration-300"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">
                        Llamar
                      </span>
                    </motion.a>
                    
                    <motion.a
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      href={`mailto:${advisor.email}`}
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-[#40534C] hover:border-[#40534C] hover:text-white transition-all duration-300"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">
                        Email
                      </span>
                    </motion.a>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleScheduleAppointment(advisor)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-[#40534C] hover:bg-[#2C3A36] text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar Cita
                  </motion.button>
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
          <div className="bg-[#40534C] rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              ¿Necesitas asesoría personalizada?
            </h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Nuestros asesores están listos para ayudarte a encontrar la propiedad perfecta. 
              Contáctanos y recibe atención especializada.
            </p>
            <Button
              onClick={() => window.open(CONTACT_INFO.urls.whatsapp(WHATSAPP_MESSAGES.advisory), '_blank')}
              className="bg-white text-[#40534C] hover:bg-gray-100"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Contactar Equipo
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Schedule Appointment Modal */}
      {selectedAdvisor && (
        <ScheduleAppointmentModalEnhanced
          property={null} // No hay propiedad específica cuando se agenda desde asesores
          advisor={selectedAdvisor}
          isOpen={isScheduleModalOpen}
          onClose={() => {
            setIsScheduleModalOpen(false);
            setSelectedAdvisor(null);
          }}
        />
      )}
    </div>
  );
};

export default Advisors;
