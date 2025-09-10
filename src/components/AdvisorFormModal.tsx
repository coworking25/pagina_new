import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Star,
  User,
  Mail,
  Phone,
  MessageCircle,
  Briefcase,
  Calendar,
  FileText,
  Award,
  Image as ImageIcon,
  Loader
} from 'lucide-react';
import { Advisor } from '../types';

interface AdvisorFormModalProps {
  advisor?: Advisor | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (advisorData: Omit<Advisor, 'id'> | Partial<Advisor>) => Promise<void>;
  isEditing?: boolean;
}

function AdvisorFormModal({ advisor, isOpen, onClose, onSave, isEditing = false }: AdvisorFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    photo: '',
    specialty: '',
    rating: 5.0,
    reviews: 0,
    availability_weekdays: '9:00 AM - 5:00 PM',
    availability_weekends: 'No disponible',
    calendar_link: '',
    bio: '',
    experience_years: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos del asesor si estamos editando
  useEffect(() => {
    if (advisor && isEditing) {
      setFormData({
        name: advisor.name || '',
        email: advisor.email || '',
        phone: advisor.phone || '',
        whatsapp: advisor.whatsapp || '',
        photo: advisor.photo || '',
        specialty: advisor.specialty || '',
        rating: advisor.rating || 5.0,
        reviews: advisor.reviews || 0,
        availability_weekdays: advisor.availability?.weekdays || '9:00 AM - 5:00 PM',
        availability_weekends: advisor.availability?.weekends || 'No disponible',
        calendar_link: advisor.calendar_link || '',
        bio: advisor.bio || '',
        experience_years: advisor.experience_years || 0
      });
    } else if (!isEditing) {
      // Reset form for new advisor
      setFormData({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        photo: '',
        specialty: '',
        rating: 5.0,
        reviews: 0,
        availability_weekdays: '9:00 AM - 5:00 PM',
        availability_weekends: 'No disponible',
        calendar_link: '',
        bio: '',
        experience_years: 0
      });
    }
  }, [advisor, isEditing, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (!formData.specialty.trim()) {
      newErrors.specialty = 'La especialidad es requerida';
    }

    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'El rating debe estar entre 1 y 5';
    }

    if (formData.experience_years < 0) {
      newErrors.experience_years = 'Los años de experiencia no pueden ser negativos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const advisorData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        photo: formData.photo,
        specialty: formData.specialty,
        rating: formData.rating,
        reviews: formData.reviews,
        availability: {
          weekdays: formData.availability_weekdays,
          weekends: formData.availability_weekends
        },
        calendar_link: formData.calendar_link,
        bio: formData.bio,
        experience_years: formData.experience_years
      };

      await onSave(advisorData);
      onClose();
    } catch (error) {
      console.error('Error saving advisor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const specialties = [
    'Propiedades Residenciales',
    'Propiedades Comerciales',
    'Apartamentos',
    'Casas',
    'Oficinas',
    'Locales Comerciales',
    'Inversiones Inmobiliarias',
    'Arriendos',
    'Ventas'
  ];

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
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {isEditing ? 'Editar Asesor' : 'Nuevo Asesor'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Información Personal */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      Información Personal
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nombre completo *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="Ej: Juan Pérez"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="juan@email.com"
                          />
                        </div>
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Teléfono *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="+57 300 123 4567"
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          WhatsApp
                        </label>
                        <div className="relative">
                          <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={formData.whatsapp}
                            onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="573001234567"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          URL de Foto
                        </label>
                        <div className="relative">
                          <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="url"
                            value={formData.photo}
                            onChange={(e) => handleInputChange('photo', e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com/photo.jpg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información Profesional */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                      Información Profesional
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Especialidad *
                        </label>
                        <select
                          value={formData.specialty}
                          onChange={(e) => handleInputChange('specialty', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.specialty ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <option value="">Seleccionar especialidad</option>
                          {specialties.map(specialty => (
                            <option key={specialty} value={specialty}>{specialty}</option>
                          ))}
                        </select>
                        {errors.specialty && (
                          <p className="text-red-500 text-sm mt-1">{errors.specialty}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Rating
                          </label>
                          <div className="relative">
                            <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="number"
                              min="1"
                              max="5"
                              step="0.1"
                              value={formData.rating}
                              onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
                              className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.rating ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                            />
                          </div>
                          {errors.rating && (
                            <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Reseñas
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.reviews}
                            onChange={(e) => handleInputChange('reviews', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Años de experiencia
                        </label>
                        <div className="relative">
                          <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            min="0"
                            value={formData.experience_years}
                            onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.experience_years ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                        </div>
                        {errors.experience_years && (
                          <p className="text-red-500 text-sm mt-1">{errors.experience_years}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Horarios Lunes-Viernes
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.availability_weekdays}
                            onChange={(e) => handleInputChange('availability_weekdays', e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="9:00 AM - 5:00 PM"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Horarios Fin de Semana
                        </label>
                        <input
                          type="text"
                          value={formData.availability_weekends}
                          onChange={(e) => handleInputChange('availability_weekends', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="No disponible"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Enlace de Calendario
                        </label>
                        <input
                          type="url"
                          value={formData.calendar_link}
                          onChange={(e) => handleInputChange('calendar_link', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://calendly.com/usuario"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Biografía
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <textarea
                            value={formData.bio}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            rows={4}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Describe tu experiencia y especialidades..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </motion.button>
                
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      {isEditing ? 'Actualizar Asesor' : 'Crear Asesor'}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AdvisorFormModal;
