import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Award, Heart } from 'lucide-react';

const CompanyPresentation: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: 'Confianza y Seguridad',
      description: 'Más de 10 años de experiencia en el sector inmobiliario, con procesos transparentes y seguros.'
    },
    {
      icon: Users,
      title: 'Equipo Experto',
      description: 'Nuestros asesores especializados te guían en cada paso del proceso de compra, venta o arriendo.'
    },
    {
      icon: Award,
      title: 'Excelencia en Servicio',
      description: 'Comprometidos con la calidad y satisfacción de nuestros clientes en cada transacción.'
    },
    {
      icon: Heart,
      title: 'Pasión por el Servicio',
      description: 'Amamos ayudar a las personas a encontrar su hogar ideal y hacer realidad sus sueños.'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            ¿Por qué elegir <span className="text-green-600">Coworking Inmobiliario</span>?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Somos líderes en el mercado inmobiliario de Medellín y Colombia, ofreciendo servicios integrales
            con la experiencia y confianza que necesitas para tus proyectos inmobiliarios.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-6">
                <feature.icon className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-300">Propiedades Gestionadas</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">800+</div>
              <div className="text-gray-600 dark:text-gray-300">Clientes Satisfechos</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">7+</div>
              <div className="text-gray-600 dark:text-gray-300">Años de Experiencia</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-300">Soporte Disponible</div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-3">
              ¿Listo para hacer realidad tu proyecto inmobiliario?
            </h3>
            <p className="text-green-100 mb-4 text-sm">
              Con más de 10 años de experiencia y miles de clientes satisfechos, estamos aquí para guiarte en cada paso.
            </p>
            <button
              onClick={() => window.location.href = '/contact'}
              className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              Contactar Ahora
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CompanyPresentation;