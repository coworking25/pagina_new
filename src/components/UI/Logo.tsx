import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header';
  showText?: boolean;
  className?: string;
  animated?: boolean;
  variant?: 'default' | 'hero' | 'header' | 'admin';
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  animated = true,
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    header: 'w-14 h-14' // Custom size for header
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    header: 'text-2xl'
  };

  const LogoComponent = animated ? motion.div : 'div';

  const logoContent = (
    <div className={`flex items-center space-x-3 group ${className}`}>
      <div className="relative">
        <img
          src="/logo-13962586_transparent (1).png"
          alt="Coworking Inmobiliario"
          className={`${sizeClasses[size]} object-contain transition-all duration-300 ${
            variant === 'header' ? 'group-hover:scale-105' : 'group-hover:scale-110'
          }`}
          style={{
            imageRendering: variant === 'header' ? 'crisp-edges' : 'auto'
          }}
          onError={(e) => {
            // Fallback to CSS logo if image fails
            e.currentTarget.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.className = `${sizeClasses[size]} bg-gradient-to-br from-cyan-400 via-green-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg glow-cyan group-hover:glow-purple transition-all duration-300`;
            fallback.innerHTML = `<span class="text-white font-bold ${textSizeClasses[size]}">CI</span>`;
            const blurDiv = document.createElement('div');
            blurDiv.className = 'absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300 animate-pulse-slow';
            fallback.appendChild(blurDiv);
            e.currentTarget.parentElement?.appendChild(fallback);
          }}
        />
        {variant === 'hero' && (
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-green-400 to-purple-500 rounded-2xl blur-xl opacity-20 animate-pulse-slow"></div>
        )}
      </div>
      {showText && (
        <div className="hidden sm:block">
          <h1 className={`font-bold text-gray-900 dark:text-white ${variant === 'admin' ? 'bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent' : ''}`}>
            {variant === 'admin' ? 'Admin Panel' : 'Coworking Inmobiliario'}
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 -mt-1">
            {variant === 'admin' ? 'Coworking Inmobiliario' : 'La luz te guía a casa'}
          </p>
        </div>
      )}
    </div>
  );

  if (animated) {
    return (
      <LogoComponent
        initial={variant === 'hero' ? { opacity: 0, scale: 0.8 } : undefined}
        animate={variant === 'hero' ? { opacity: 1, scale: 1 } : undefined}
        transition={variant === 'hero' ? { duration: 0.8 } : undefined}
      >
        {logoContent}
      </LogoComponent>
    );
  }

  return logoContent;
};

export default Logo;