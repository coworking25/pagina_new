import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../UI/Button';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlogan, setCurrentSlogan] = useState(0);

  const slogans = [
    "La luz te guía a casa",
    "y la calidez te mantiene en ella"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % slogans.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/properties');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-green-400/30 rounded-full"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Logo with Glow Effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-white font-bold text-3xl">CI</span>
            </div>
            <div className="absolute inset-0 bg-green-400 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
        >
          Coworking{' '}
          <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            Inmobiliario
          </span>
        </motion.h1>

        {/* Animated Slogan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-8 h-16 flex items-center justify-center"
        >
          <motion.p
            key={currentSlogan}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-xl sm:text-2xl text-gray-300 font-light"
          >
            {slogans[currentSlogan]}
          </motion.p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2">
              <Search className="w-5 h-5 text-gray-400 ml-3" />
              <input
                type="text"
                placeholder="¿Qué tipo de propiedad buscas? Ej: Apartamento en Medellín..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none"
              />
              <Button
                onClick={handleSearch}
                variant="primary"
                icon={ArrowRight}
                iconPosition="right"
              >
                Buscar
              </Button>
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
        >
          <Button
            onClick={() => navigate('/properties')}
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          >
            Ver Todas las Propiedades
          </Button>
          <Button
            onClick={() => navigate('/advisors')}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto text-white border-white/30 hover:bg-white/10"
          >
            Hablar con un Asesor
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8"
        >
          {[
            { number: '500+', label: 'Propiedades' },
            { number: '1000+', label: 'Clientes Satisfechos' },
            { number: '10+', label: 'Años de Experiencia' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                className="text-3xl sm:text-4xl font-bold text-green-400 mb-2"
              >
                {stat.number}
              </motion.div>
              <p className="text-gray-300">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/50 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;