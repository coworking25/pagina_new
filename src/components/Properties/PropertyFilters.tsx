import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import Button from '../UI/Button';
import { ZONES } from '../../constants/zones';

interface FilterState {
  search: string;
  zone: string;
  neighborhood: string;
  type: string;
  transactionType: string;
  status: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  featured: boolean;
}

interface PropertyFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleInputChange = (field: keyof FilterState, value: string | boolean) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'search' || key === 'zone' || key === 'neighborhood') return value !== '';
    if (key === 'featured') return value === true;
    return value !== '';
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar propiedades por ubicación, tipo..."
          value={filters.search}
          onChange={(e) => handleInputChange('search', e.target.value)}
          className="w-full pl-12 pr-4 py-4 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Button
          variant="ghost"
          icon={Filter}
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-600 dark:text-gray-400 justify-center sm:justify-start py-3 px-4"
        >
          Filtros Avanzados
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            icon={X}
            onClick={onClearFilters}
            className="text-red-600 dark:text-red-400 justify-center sm:justify-start py-3 px-4"
          >
            Limpiar Filtros
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Zona y Barrio en móviles */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Zona
              </label>
              <select
                value={filters.zone}
                onChange={(e) => handleInputChange('zone', e.target.value)}
                className="w-full px-3 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                {ZONES.map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Barrio
              </label>
              <input
                type="text"
                placeholder="Ej: San José, San Remo..."
                value={filters.neighborhood}
                onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                className="w-full px-3 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Tipo de Propiedad y Transacción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Propiedad
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="apartment">Apartamento</option>
                <option value="apartaestudio">Apartaestudio</option>
                <option value="house">Casa</option>
                <option value="office">Oficina</option>
                <option value="commercial">Local Comercial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Transacción
              </label>
              <select
                value={filters.transactionType}
                onChange={(e) => handleInputChange('transactionType', e.target.value)}
                className="w-full px-3 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="Arriendo">Arriendo</option>
                <option value="Venta">Venta</option>
                <option value="Both">Venta y Arriendo</option>
              </select>
            </div>

            {/* Habitaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Habitaciones
              </label>
              <select
                value={filters.bedrooms}
                onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                className="w-full px-3 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Cualquiera</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            {/* Baños */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Baños
              </label>
              <select
                value={filters.bathrooms}
                onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                className="w-full px-3 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Cualquiera</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>
            </div>

            {/* Rango de Precio - Ocupa toda la fila en móviles */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rango de Precio
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Mínimo"
                  value={filters.minPrice}
                  onChange={(e) => handleInputChange('minPrice', e.target.value)}
                  className="px-3 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Máximo"
                  value={filters.maxPrice}
                  onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                  className="px-3 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Checkbox destacado - Centrado en móviles */}
            <div className="sm:col-span-2 lg:col-span-4 flex justify-center items-center py-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                  Solo Propiedades Destacadas
                </span>
              </label>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default React.memo(PropertyFilters, (prevProps, nextProps) => {
  // Solo re-renderizar si los filtros realmente cambiaron
  return (
    JSON.stringify(prevProps.filters) === JSON.stringify(nextProps.filters)
  );
});