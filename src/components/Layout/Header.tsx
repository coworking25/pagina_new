import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Monitor, Home, Building, Users, Phone, Briefcase } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import Logo from '../UI/Logo';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const navigation = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Propiedades', href: '/properties', icon: Building },
    { name: 'Servicios', href: '/services', icon: Briefcase },
    { name: 'Asesores', href: '/advisors', icon: Users },
    { name: 'Contacto', href: '/contact', icon: Phone },
  ];

  const themeOptions = [
    { name: 'Claro', value: 'light' as const, icon: Sun },
    { name: 'Oscuro', value: 'dark' as const, icon: Moon },
    { name: 'Sistema', value: 'system' as const, icon: Monitor },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-700/20">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {location.pathname !== '/' && (
            <Link to="/" className="flex items-center mr-8">
              <Logo variant="header" size="header" animated={false} />
            </Link>
          )}
          <div className="flex-1 flex justify-center">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          {/* Theme Switcher & Login & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Portal de Acceso - Admin, Clientes y Asesores */}
            <Link
              to="/login"
              className="hidden md:flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
            >
              <Users className="w-4 h-4" />
              <span>Ingresar</span>
            </Link>

            {/* Theme Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {resolvedTheme === 'dark' ? (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>

              <AnimatePresence>
                {isThemeMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
                  >
                    {themeOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            setTheme(option.value);
                            setIsThemeMenuOpen(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                            theme === option.value ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{option.name}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4"
            >
              <div className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                          : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                {/* Portal de Acceso - Versión móvil */}
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
                >
                  <Users className="w-5 h-5" />
                  <span>Ingresar</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Header;