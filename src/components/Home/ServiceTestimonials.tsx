import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star,
  Quote
} from 'lucide-react';

const ServiceTestimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'María González',
      service: 'Arrendamientos',
      rating: 5,
      comment: 'Encontré el apartamento perfecto en solo 2 días. El proceso fue súper ágil y el soporte excelente.',
      avatar: 'MG'
    },
    {
      name: 'Carlos Rodríguez',
      service: 'Ventas',
      rating: 5,
      comment: 'Vendieron mi casa en tiempo récord y por el precio que esperaba. Muy profesionales.',
      avatar: 'CR'
    },
    {
      name: 'Ana Martínez',
      service: 'Remodelación',
      rating: 5,
      comment: 'La remodelación de mi cocina quedó espectacular. Cumplieron todos los tiempos prometidos.',
      avatar: 'AM'
    }
  ];

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Lo que Dicen Nuestros Clientes
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Testimonios reales de personas que han confiado en nuestros servicios
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 bg-cover bg-center bg-no-repeat relative overflow-hidden"
            style={{
              backgroundImage: "url('/img/pentho.jpg')"
            }}
          >
            {/* Overlay para legibilidad */}
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-[0.5px]"></div>
            
            {/* Contenido */}
            <div className="relative z-10">
              {/* Quote Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Quote className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex justify-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Comment */}
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6 italic">
                "{testimonial.comment}"
              </p>

              {/* User Info */}
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{testimonial.avatar}</span>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Cliente de {testimonial.service}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        viewport={{ once: true }}
        className="text-center mt-8"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          ¿Quieres ser nuestro próximo cliente satisfecho?
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const message = encodeURIComponent(
              '¡Hola! Me interesa conocer más sobre sus servicios inmobiliarios. ¿Podrían brindarme más información?'
            );
            window.open(`https://wa.me/+573028240488?text=${message}`, '_blank');
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Únete a Nuestros Clientes Felices
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ServiceTestimonials;
