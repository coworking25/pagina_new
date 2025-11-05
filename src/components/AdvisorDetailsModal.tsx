import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  Star,
  Award,
  Clock,
  User,
  Briefcase,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';
import { Advisor } from '../types';

interface AdvisorDetailsModalProps {
  advisor: Advisor | null;
  isOpen: boolean;
  onClose: () => void;
}

function AdvisorDetailsModal({ advisor, isOpen, onClose }: AdvisorDetailsModalProps) {
  if (!advisor) return null;

  const getRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${
            i <= rating
              ? 'text-yellow-500 fill-current'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      );
    }
    return stars;
  };

  const contactWhatsApp = () => {
    const message = encodeURIComponent(
      `¡Hola ${advisor.name}! Me interesa obtener información sobre propiedades. ¿Podrías ayudarme?`
    );
    const cleanPhone = advisor.whatsapp.replace(/[\s\-+]/g, '');
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-[#40534C] text-white p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center space-x-6">
                {advisor.photo ? (
                  <div className="relative">
                    <img
                      src={`${advisor.photo}?quality=100&format=auto&fit=face&facepad=2`}
                      alt={advisor.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.includes('?')) {
                          target.src = advisor.photo;
                        } else {
                          target.style.display = 'none';
                        }
                      }}
                    />
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white">
                    <ImageIcon className="w-8 h-8 text-white" />
                  </div>
                )}
                
                <div>
                  <h2 className="text-2xl font-bold mb-2">{advisor.name}</h2>
                  <div className="flex items-center space-x-4">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                      {advisor.specialty}
                    </span>
                    <div className="flex items-center">
                      {getRatingStars(advisor.rating)}
                      <span className="ml-2 font-medium">
                        {advisor.rating} ({advisor.reviews} reseñas)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Información Personal */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      Información Personal
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 mr-3 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                          <p className="text-gray-900 dark:text-white">{advisor.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Phone className="w-5 h-5 mr-3 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                          <p className="text-gray-900 dark:text-white">{advisor.phone}</p>
                        </div>
                      </div>
                      
                      {advisor.whatsapp && (
                        <div className="flex items-center">
                          <MessageCircle className="w-5 h-5 mr-3 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">WhatsApp</p>
                            <p className="text-gray-900 dark:text-white">{advisor.whatsapp}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Experiencia */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                      Experiencia Profesional
                    </h3>
                    
                    <div className="space-y-3">
                      {advisor.experience_years && (
                        <div className="flex items-center">
                          <Award className="w-5 h-5 mr-3 text-orange-500" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Años de experiencia</p>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {advisor.experience_years} años
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <TrendingUp className="w-5 h-5 mr-3 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Especialidad</p>
                          <p className="text-gray-900 dark:text-white font-medium">{advisor.specialty}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Biografía */}
                  {advisor.bio && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Acerca de mí
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {advisor.bio}
                      </p>
                    </div>
                  )}
                </div>

                {/* Disponibilidad y Contacto */}
                <div className="space-y-6">
                  {/* Horarios */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-blue-600" />
                      Horarios de Atención
                    </h3>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      {advisor.availability_hours ? (
                        <p className="text-gray-900 dark:text-white">
                          {advisor.availability_hours}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Lunes - Viernes</span>
                            <span className="text-gray-900 dark:text-white font-medium">
                              {advisor.availability?.weekdays || '9:00 AM - 5:00 PM'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Fin de semana</span>
                            <span className="text-gray-900 dark:text-white font-medium">
                              {advisor.availability?.weekends || 'No disponible'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estadísticas */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Estadísticas
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {advisor.rating}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Rating promedio
                        </div>
                      </div>
                      
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {advisor.reviews}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Reseñas totales
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botones de Contacto */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Contactar
                    </h3>
                    
                    <div className="space-y-3">
                      {advisor.whatsapp && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={contactWhatsApp}
                          className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Contactar por WhatsApp
                        </motion.button>
                      )}
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.open(`tel:${advisor.phone}`)}
                        className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        Llamar Teléfono
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.open(`mailto:${advisor.email}`)}
                        className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Mail className="w-5 h-5 mr-2" />
                        Enviar Email
                      </motion.button>
                      
                      {advisor.calendar_link && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => window.open(advisor.calendar_link, '_blank')}
                          className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Calendar className="w-5 h-5 mr-2" />
                          Ver Calendario
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AdvisorDetailsModal;
