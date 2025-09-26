import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../UI/Button';
// @ts-ignore
import GradientText from '../../../@/components/GradientText';
import AdvancedSearch from './AdvancedSearch';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlogan, setCurrentSlogan] = useState(0);
  const [currentBackground, setCurrentBackground] = useState(0);

  const slogans = [
    "La luz te guía a casa",
    "y la calidez te mantiene en ella"
  ];

  // Local background images from public/img folder - Medellín properties
  const backgroundImages = [
    '/img/medellin.jpg',           // Medellín city view
    '/img/Paisaje_Medellin.jpg',   // Medellín landscape
    '/img/apar.jpg',               // Apartment building
    '/img/casa.jpg',               // House/Residence
    '/img/1.mede.jpg',             // Medellín view 1
    '/img/2.mede.jpg',             // Medellín view 2
    '/img/pentho.jpg',
    '/img/mede.1.jpg',
    '/img/mede.2.jpg',
    '/img/nuev.1.jpg',
    '/img/nuev.2.jpg',
    '/img/nuev.3.jpg',
    '/img/nuev.4.jpg'
            // Penthouse/High-end property
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % slogans.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [slogans.length]);

  // Background image rotation
  useEffect(() => {
    const bgInterval = setInterval(() => {
      setCurrentBackground((prev) => (prev + 1) % backgroundImages.length);
    }, 8000); // Change every 8 seconds

    return () => clearInterval(bgInterval);
  }, [backgroundImages.length]);

  return (
    <section className="relative min-h-screen lg:min-h-[120vh] flex items-center justify-center overflow-hidden">
      {/* Dynamic Background with Multiple Images */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Rotating Background Images - Smooth transitions without gaps */}
        {backgroundImages.map((image, index) => {
          const isCurrent = index === currentBackground;
          const isPrevious = index === ((currentBackground - 1 + backgroundImages.length) % backgroundImages.length);

          return (
            <motion.div
              key={image}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${image})`,
              }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: isCurrent ? 0.12 : isPrevious ? 0.06 : 0
              }}
              transition={{
                duration: 3,
                ease: "easeInOut",
                delay: isCurrent ? 0 : 0.5
              }}
            />
          );
        })}
        {/* Enhanced overlay for better logo contrast - More subtle */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-black/30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/10 via-transparent to-purple-900/10"></div>
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
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-8 lg:py-16">
        {/* Logo - Clean and Simple */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-16 lg:mb-20"
        >
          <div className="relative inline-block">
            <img
              src="/logo-13962586_transparent (1).png"
              alt="Coworking Inmobiliario"
              className="w-56 h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 object-contain drop-shadow-2xl transition-all duration-500 hover:scale-105"
              onError={(e) => {
                // Fallback to CSS logo if image fails
                e.currentTarget.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-56 h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl';
                fallback.innerHTML = `<span class="text-white font-bold text-7xl md:text-8xl lg:text-9xl">CI</span>`;
                const blurDiv = document.createElement('div');
                blurDiv.className = 'absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl blur-xl opacity-30';
                fallback.appendChild(blurDiv);
                e.currentTarget.parentNode?.appendChild(fallback);
              }}
            />
          </div>
        </motion.div>

        {/* Company Name - Smaller below logo */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-12 lg:mb-16"
        >
          <GradientText
            colors={["#14532d", "#1145b8ff", "#15803d", "#166534", "#0b576eff"]}
            animationSpeed={3}
            showBorder={false}
            className="custom-class"
          >
            Coworking Inmobiliario
          </GradientText>
        </motion.h2>

        {/* Animated Slogan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-12 lg:mb-16 h-16 flex items-center justify-center"
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

        {/* Advanced Search */}
        <AdvancedSearch />

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 lg:mt-12 mb-12 lg:mb-16 text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Encuentra tu próximo hogar
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Con más de 10 años de experiencia, te ayudamos a encontrar la propiedad perfecta para ti
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12 lg:mb-16"
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