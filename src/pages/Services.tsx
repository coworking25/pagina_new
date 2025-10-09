import React from 'react';
import { motion } from 'framer-motion';
import Services from '../components/Home/Services';

const ServicesPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20"
    >
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Nuestros Servicios
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-green-50 max-w-3xl mx-auto"
          >
            Soluciones integrales en el sector inmobiliario para todas tus necesidades
          </motion.p>
        </div>
      </div>

      {/* Services Component */}
      <div className="py-8">
        <Services />
      </div>
    </motion.div>
  );
};

export default ServicesPage;
