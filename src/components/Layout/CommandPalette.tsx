import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModalStore } from '../../store/modalStore';
import {
  MagnifyingGlassIcon,
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  XMarkIcon,
  ArrowRightIcon,
  ClockIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { openPropertyModal, openClientModal, openAppointmentModal, openAdvisorModal } = useModalStore();

  const commands = [
    // Navigation Commands
    { 
      id: 'dashboard', 
      title: 'Dashboard Principal', 
      subtitle: 'Ir al panel principal',
      icon: HomeIcon, 
      action: () => navigate('/admin/dashboard'),
      category: 'Navegación',
      shortcut: 'D'
    },
    { 
      id: 'properties', 
      title: 'Propiedades', 
      subtitle: 'Gestionar inmuebles',
      icon: BuildingOfficeIcon, 
      action: () => navigate('/admin/properties'),
      category: 'Navegación',
      shortcut: 'P'
    },
    { 
      id: 'clients', 
      title: 'Clientes', 
      subtitle: 'Base de datos de clientes',
      icon: UserGroupIcon, 
      action: () => navigate('/admin/clients'),
      category: 'Navegación',
      shortcut: 'C'
    },
    { 
      id: 'advisors', 
      title: 'Asesores', 
      subtitle: 'Equipo comercial',
      icon: UserGroupIcon, 
      action: () => navigate('/admin/advisors'),
      category: 'Navegación',
      shortcut: 'A'
    },
    { 
      id: 'appointments', 
      title: 'Citas', 
      subtitle: 'Programación de citas',
      icon: CalendarIcon, 
      action: () => navigate('/admin/appointments'),
      category: 'Navegación',
      shortcut: 'I'
    },
    { 
      id: 'analytics', 
      title: 'Análisis', 
      subtitle: 'Reportes y métricas',
      icon: ChartBarIcon, 
      action: () => navigate('/admin/analytics'),
      category: 'Navegación',
      shortcut: 'N'
    },
    
    // Quick Actions
    { 
      id: 'new-property', 
      title: 'Nueva Propiedad', 
      subtitle: 'Agregar inmueble',
      icon: PlusIcon, 
      action: () => { openPropertyModal(); onClose(); },
      category: 'Acciones Rápidas',
      shortcut: 'Ctrl+N'
    },
    { 
      id: 'new-client', 
      title: 'Nuevo Cliente', 
      subtitle: 'Registrar cliente',
      icon: PlusIcon, 
      action: () => { openClientModal(); onClose(); },
      category: 'Acciones Rápidas',
      shortcut: 'Ctrl+C'
    },
    { 
      id: 'new-appointment', 
      title: 'Nueva Cita', 
      subtitle: 'Programar cita',
      icon: PlusIcon, 
      action: () => { openAppointmentModal(); onClose(); },
      category: 'Acciones Rápidas',
      shortcut: 'Ctrl+T'
    },
    { 
      id: 'new-advisor', 
      title: 'Nuevo Asesor', 
      subtitle: 'Agregar asesor',
      icon: PlusIcon, 
      action: () => { openAdvisorModal(); onClose(); },
      category: 'Acciones Rápidas',
      shortcut: 'Ctrl+A'
    },
    
    // Settings & Admin
    { 
      id: 'settings', 
      title: 'Configuración', 
      subtitle: 'Configuración del sistema',
      icon: CogIcon, 
      action: () => navigate('/admin/settings'),
      category: 'Administración',
      shortcut: 'S'
    },
    { 
      id: 'reports', 
      title: 'Reportes', 
      subtitle: 'Informes detallados',
      icon: DocumentTextIcon, 
      action: () => navigate('/admin/reports'),
      category: 'Administración',
      shortcut: 'R'
    },
    
    // Recent Actions
    { 
      id: 'recent-properties', 
      title: 'Propiedades Recientes', 
      subtitle: 'Últimas propiedades agregadas',
      icon: ClockIcon, 
      action: () => navigate('/admin/properties?filter=recent'),
      category: 'Recientes',
      shortcut: ''
    },
    { 
      id: 'recent-clients', 
      title: 'Clientes Recientes', 
      subtitle: 'Últimos clientes registrados',
      icon: ClockIcon, 
      action: () => navigate('/admin/clients?filter=recent'),
      category: 'Recientes',
      shortcut: ''
    },
  ];

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(query.toLowerCase()) ||
    command.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    command.category.toLowerCase().includes(query.toLowerCase())
  );

  const groupedCommands = filteredCommands.reduce((groups, command) => {
    const category = command.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(command);
    return groups;
  }, {} as Record<string, typeof commands>);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isOpen) {
          // This will be handled by the parent component
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-start justify-center p-4 pt-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Search Header */}
              <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Buscar acciones, páginas, funciones..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-0 outline-none text-gray-900 dark:text-white placeholder-gray-500"
                  autoFocus
                />
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {Object.keys(groupedCommands).length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p>No se encontraron resultados para "{query}"</p>
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([category, commands]) => (
                    <div key={category} className="p-2">
                      <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {category}
                      </h3>
                      {commands.map((command) => (
                        <button
                          key={command.id}
                          onClick={() => {
                            command.action();
                            onClose();
                          }}
                          className="w-full flex items-center px-3 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                        >
                          <command.icon className="h-5 w-5 text-gray-400 group-hover:text-green-500 mr-3 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {command.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {command.subtitle}
                            </p>
                          </div>
                          {command.shortcut && (
                            <div className="flex items-center ml-2">
                              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {command.shortcut}
                              </span>
                            </div>
                          )}
                          <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 ml-2 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>
                      <kbd className="bg-gray-200 dark:bg-gray-700 px-1 rounded">Enter</kbd> para ejecutar
                    </span>
                    <span>
                      <kbd className="bg-gray-200 dark:bg-gray-700 px-1 rounded">Esc</kbd> para cerrar
                    </span>
                  </div>
                  <span>
                    <kbd className="bg-gray-200 dark:bg-gray-700 px-1 rounded">Ctrl+K</kbd> para abrir
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
