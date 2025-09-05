import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Home, 
  Award, 
  Clock,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

const ServiceStats: React.FC = () => {
  const stats = [
    {
      icon: Users,
      value: '500+',
      label: 'Clientes Satisfechos',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Home,
      value: '1,200+',
      label: 'Propiedades Gestionadas',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Award,
      value: '5',
      label: 'Años de Experiencia',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Clock,
      value: '24/7',
      label: 'Soporte Disponible',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: TrendingUp,
      value: '98%',
      label: 'Tasa de Éxito',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: CheckCircle,
      value: '100%',
      label: 'Garantía de Calidad',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Nuestros Resultados Hablan por Sí Solos
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Cifras que demuestran nuestro compromiso con la excelencia
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="relative mb-4">
                <div className={`w-16 h-16 mx-auto bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className={`absolute inset-0 mx-auto w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
              </div>
              
              <motion.div
                initial={{ scale: 1 }}
                whileInView={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                viewport={{ once: true }}
                className="text-3xl font-bold text-gray-900 dark:text-white mb-1"
              >
                {stat.value}
              </motion.div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {stat.label}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceStats;
