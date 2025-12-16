import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Home,
  FileText,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import ReportsModalExpanded from '../components/Modals/ReportsModalExpanded';
import FloatingCard from '../components/UI/FloatingCard';

const AdminReports: React.FC = () => {
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);

  const reportSections = [
    {
      title: 'Analytics de Propiedades',
      description: 'Estadísticas detalladas de visualizaciones, likes y contactos por propiedad',
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500',
      action: () => setIsReportsModalOpen(true),
      available: true
    },
    {
      title: 'Reportes de Clientes',
      description: 'Análisis de actividad de clientes y contratos',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      action: () => setIsReportsModalOpen(true),
      available: true
    },
    {
      title: 'Reportes de Citas',
      description: 'Estadísticas de citas agendadas, canceladas y completadas',
      icon: Calendar,
      color: 'from-purple-500 to-indigo-500',
      action: () => setIsReportsModalOpen(true),
      available: true
    },
    {
      title: 'Reportes Financieros',
      description: 'Análisis de ingresos, pagos y comisiones',
      icon: TrendingUp,
      color: 'from-orange-500 to-amber-500',
      action: () => setIsReportsModalOpen(true),
      available: true
    },
    {
      title: 'Reportes de Propiedades',
      description: 'Estadísticas de propiedades activas, vendidas y rentadas',
      icon: Home,
      color: 'from-red-500 to-pink-500',
      action: () => setIsReportsModalOpen(true),
      available: true
    },
    {
      title: 'Reportes de Documentos',
      description: 'Análisis de documentos subidos y procesados',
      icon: FileText,
      color: 'from-indigo-500 to-purple-500',
      action: () => setIsReportsModalOpen(true),
      available: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-5 lg:p-6 text-white"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">Centro de Reportes</h1>
            <p className="text-blue-100 mt-1 sm:mt-2 text-sm sm:text-base truncate">
              Análisis completo y reportes detallados de tu inmobiliaria
            </p>
          </div>
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsReportsModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm sm:text-base"
            >
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Ver Analytics</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Reportes</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">24</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex-shrink-0 ml-2">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Datos</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">1,247</p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/20 rounded-lg flex-shrink-0 ml-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Exportaciones</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">8</p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex-shrink-0 ml-2">
              <Download className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Último</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Hoy</p>
            </div>
            <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex-shrink-0 ml-2">
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Report Sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <FloatingCard hover elevation="high" className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                Tipos de Reportes Disponibles
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">
                Selecciona el tipo de reporte que deseas generar
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Filtrar</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {reportSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`relative bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 ${
                    section.available ? 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-600' : 'opacity-60'
                  }`}
                  onClick={section.available ? section.action : undefined}
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className={`p-2 sm:p-3 bg-gradient-to-br ${section.color} rounded-lg`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    {!section.available && (
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                        Próximamente
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                    {section.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 line-clamp-2">
                    {section.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      section.available
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {section.available ? 'Disponible' : 'En desarrollo'}
                    </span>
                    {section.available && (
                      <motion.div
                        whileHover={{ x: 3 }}
                        className="text-blue-600 dark:text-blue-400"
                      >
                        →
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </FloatingCard>
      </motion.div>

      {/* Reports Modal */}
      <ReportsModalExpanded
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
      />
    </div>
  );
};

export default AdminReports;