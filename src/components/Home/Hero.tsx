import React from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import GradientText from '../../../@/components/GradientText';
import AdvancedSearch from './AdvancedSearch';
import FeaturedPropertiesSlider from './FeaturedPropertiesSlider';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen lg:min-h-[120vh] flex flex-col items-start justify-center overflow-hidden bg-white dark:bg-gray-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-green-400/30 rounded-full"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
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
      <div className="relative z-10 w-full pt-2 pb-2 lg:pb-10 flex flex-col items-start justify-center">
        {/* Logo and Search Row */}
        <motion.div 
          className="flex flex-col lg:flex-row items-start justify-center w-full max-w-[1700px] mx-auto px-4 sm:px-10 lg:px-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
            className="flex-shrink-0 flex items-center justify-center"
            style={{ minWidth: 260, minHeight: 260 }}
          >
            <div className="relative inline-block">
              <img
                src="/logo-13962586_transparent (1).png"
                alt="Coworking Inmobiliario"
                className="w-44 h-44 lg:w-56 lg:h-56 object-contain drop-shadow-2xl transition-all duration-500 hover:scale-105 dark:hidden"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'w-56 h-56 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl';
                  fallback.innerHTML = `<span class="text-white font-bold text-7xl">CI</span>`;
                  const blurDiv = document.createElement('div');
                  blurDiv.className = 'absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl blur-xl opacity-30';
                  fallback.appendChild(blurDiv);
                  e.currentTarget.parentNode?.appendChild(fallback);
                }}
              />
              <img
                src="/LogoEnBlancoo.png"
                alt="Coworking Inmobiliario"
                className="w-44 h-44 lg:w-56 lg:h-56 object-contain drop-shadow-2xl transition-all duration-500 hover:scale-105 hidden dark:block"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'w-56 h-56 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl';
                  fallback.innerHTML = `<span class="text-white font-bold text-7xl">CI</span>`;
                  const blurDiv = document.createElement('div');
                  blurDiv.className = 'absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl blur-xl opacity-30';
                  fallback.appendChild(blurDiv);
                  e.currentTarget.parentNode?.appendChild(fallback);
                }}
              />
            </div>
          </motion.div>

          {/* Advanced Search */}
          <motion.div 
            className="flex-1 flex items-center justify-center lg:justify-start ml-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <AdvancedSearch />
          </motion.div>
        </motion.div>

        {/* Featured Properties Slider - FULL WIDTH */}
        <motion.div 
          className="w-full px-0 mt-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <FeaturedPropertiesSlider />
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