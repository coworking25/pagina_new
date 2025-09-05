import React from 'react';
import { motion } from 'framer-motion';

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glowEffect?: boolean;
  elevation?: 'low' | 'medium' | 'high';
  onClick?: () => void;
}

const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  className = '',
  hover = true,
  glowEffect = false,
  elevation = 'medium',
  onClick
}) => {
  const elevationClasses = {
    low: 'shadow-md hover:shadow-lg',
    medium: 'shadow-lg hover:shadow-xl',
    high: 'shadow-xl hover:shadow-2xl'
  };

  const glowClass = glowEffect ? 'hover:shadow-blue-500/25 dark:hover:shadow-blue-400/25' : '';
  
  const hoverAnimation = hover ? {
    whileHover: { 
      y: -4,
      transition: { duration: 0.2 }
    },
    whileTap: { 
      y: 0,
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  } : {};

  return (
    <motion.div
      {...hoverAnimation}
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 
        rounded-2xl 
        border border-gray-200 dark:border-gray-700 
        ${elevationClasses[elevation]} 
        ${glowClass}
        transition-all duration-300 
        backdrop-blur-sm
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default FloatingCard;
