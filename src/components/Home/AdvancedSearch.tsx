import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, DollarSign, Building, ArrowRight, Bed, Bath } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../UI/Button';
import { ZONES } from '../../constants/zones';

interface SearchFilters {
  query: string;
  zone: string;
  minPrice: string;
  maxPrice: string;
  propertyType: string;
  transactionType: string;
  bedrooms: string;
  bathrooms: string;
}

const AdvancedSearch: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    zone: '',
    minPrice: '',
    maxPrice: '',
    propertyType: '',
    transactionType: '',
    bedrooms: '',
    bathrooms: ''
  });

  const transactionTypes = [
    'Arriendo',
    'Venta'
  ];

  const handleFilterChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (filters.query.trim()) params.append('search', filters.query);
    if (filters.zone) params.append('zone', filters.zone);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.propertyType) params.append('type', filters.propertyType);
    if (filters.transactionType) params.append('transaction', filters.transactionType);
    if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
    if (filters.bathrooms) params.append('bathrooms', filters.bathrooms);

    const queryString = params.toString();
    navigate(`/properties${queryString ? `?${queryString}` : ''}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="w-full"
    >
      {/* Main Search Bar */}
      <div className="mb-4 lg:mb-6">
        <div className="relative">
          <div className="flex items-center bg-gray-100 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-xl p-2 w-full">
            <Search className="w-5 h-5 text-gray-500 dark:text-gray-400 ml-3" />
            <input
              type="text"
              placeholder="¿Qué buscas? Ej: Apartamento en El Poblado..."
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-4 text-base bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
            />
            <Button
              onClick={handleSearch}
              variant="primary"
              icon={ArrowRight}
              iconPosition="right"
              className="hidden sm:flex"
            >
              Buscar
            </Button>
          </div>
          {/* Botón de búsqueda móvil */}
          <div className="mt-3 sm:hidden">
            <Button
              onClick={handleSearch}
              variant="primary"
              icon={ArrowRight}
              iconPosition="right"
              className="w-full py-4 text-base"
            >
              Buscar Propiedades
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4 w-full">
        {/* Zona y Tipo de inmueble - juntos en móviles */}
        <div className="relative sm:col-span-2 lg:col-span-1">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
          <select
            value={filters.zone}
            onChange={(e) => handleFilterChange('zone', e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-base bg-gray-100 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="" className="text-gray-900">Zona</option>
            {ZONES.map(zone => (
              <option key={zone} value={zone} className="text-gray-900">{zone}</option>
            ))}
          </select>
        </div>

        <div className="relative sm:col-span-2 lg:col-span-1">
          <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
          <select
            value={filters.propertyType}
            onChange={(e) => handleFilterChange('propertyType', e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-base bg-gray-100 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="" className="text-gray-900">Tipo de inmueble</option>
            <option value="apartment" className="text-gray-900">Apartamento</option>
            <option value="house" className="text-gray-900">Casa</option>
          </select>
        </div>

        {/* Arriendo/Venta */}
        <div className="relative">
          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
          <select
            value={filters.transactionType}
            onChange={(e) => handleFilterChange('transactionType', e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-base bg-gray-100 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="" className="text-gray-900">Arriendo/Venta</option>
            {transactionTypes.map(type => (
              <option key={type} value={type} className="text-gray-900">{type}</option>
            ))}
          </select>
        </div>

        {/* Habitaciones y Baños */}
        <div className="relative">
          <Bed className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
          <select
            value={filters.bedrooms}
            onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-base bg-gray-100 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="" className="text-gray-900">Habitaciones</option>
            <option value="1" className="text-gray-900">1+</option>
            <option value="2" className="text-gray-900">2+</option>
            <option value="3" className="text-gray-900">3+</option>
            <option value="4" className="text-gray-900">4+</option>
          </select>
        </div>

        <div className="relative">
          <Bath className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
          <select
            value={filters.bathrooms}
            onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-base bg-gray-100 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="" className="text-gray-900">Baños</option>
            <option value="2" className="text-gray-900">2+</option>
            <option value="3" className="text-gray-900">3+</option>
            <option value="4" className="text-gray-900">4+</option>
          </select>
        </div>

        {/* Rango de precios - ocupa toda la fila en móviles */}
        <div className="relative sm:col-span-2 lg:col-span-2 xl:col-span-1">
          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
          <input
            type="number"
            placeholder="Precio mín"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-base bg-gray-100 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div className="relative sm:col-span-2 lg:col-span-2 xl:col-span-1">
          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
          <input
            type="number"
            placeholder="Precio máx"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-base bg-gray-100 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default AdvancedSearch;