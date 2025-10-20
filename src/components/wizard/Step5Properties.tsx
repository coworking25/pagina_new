// Paso 5: Propiedades Asignadas al Cliente
import { useState, useMemo } from 'react';
import { 
  Home, Search, MapPin, DollarSign, X, Plus, 
  Building2, CheckCircle, AlertCircle, Filter
} from 'lucide-react';
import type { ClientWizardData } from '../ClientWizard';

interface Property {
  id: string;
  code: string;
  title: string;
  type: string;
  price: number;
  location: string;
  status: string;
  image_url?: string;
}

interface Step5Props {
  formData: ClientWizardData;
  onChange: (data: Partial<ClientWizardData>) => void;
  properties: Property[];
  loadingProperties: boolean;
}

export default function Step5Properties({ 
  formData, 
  onChange, 
  properties,
  loadingProperties 
}: Step5Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Propiedades seleccionadas
  const selectedPropertyIds = formData.assigned_property_ids || [];

  // Filtrar y buscar propiedades
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = 
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || property.type === filterType;
      const matchesStatus = filterStatus === 'all' || property.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [properties, searchTerm, filterType, filterStatus]);

  // Agregar propiedad
  const addProperty = (propertyId: string) => {
    if (!selectedPropertyIds.includes(propertyId)) {
      onChange({
        assigned_property_ids: [...selectedPropertyIds, propertyId]
      });
    }
  };

  // Remover propiedad
  const removeProperty = (propertyId: string) => {
    onChange({
      assigned_property_ids: selectedPropertyIds.filter((id: string) => id !== propertyId)
    });
  };

  // Obtener propiedad por ID
  const getPropertyById = (id: string) => {
    return properties.find(p => p.id === id);
  };

  // Tipos únicos de propiedades
  const propertyTypes = useMemo(() => {
    const types = new Set(properties.map(p => p.type));
    return Array.from(types);
  }, [properties]);

  // Estadísticas
  const selectedPropertiesTotal = useMemo(() => {
    return selectedPropertyIds.reduce((sum: number, id: string) => {
      const property = getPropertyById(id);
      return sum + (property?.price || 0);
    }, 0);
  }, [selectedPropertyIds, properties]);

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Propiedades Asignadas
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Selecciona las propiedades que gestionará este cliente
        </p>
      </div>

      {/* Alerta informativa según tipo de cliente */}
      {formData.client_type === 'landlord' ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex gap-3">
            <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Cliente Propietario
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Selecciona las propiedades que son de su propiedad y que gestionarás en tu sistema
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex gap-3">
            <Home className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Cliente Arrendatario
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Selecciona las propiedades que tiene arrendadas o está interesado en arrendar
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Propiedades Seleccionadas */}
      {selectedPropertyIds.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              Propiedades Seleccionadas ({selectedPropertyIds.length})
            </h4>
            {selectedPropertiesTotal > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-600 dark:text-gray-400">Valor Total</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  ${selectedPropertiesTotal.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedPropertyIds.map((propertyId: string) => {
              const property = getPropertyById(propertyId);
              if (!property) return null;

              return (
                <div
                  key={propertyId}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-purple-200 dark:border-purple-700 shadow-sm group hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                      {property.code}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {property.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {property.location}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProperty(propertyId)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remover"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Búsqueda y Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5 text-indigo-600" />
          Buscar Propiedades
        </h4>

        <div className="space-y-4">
          {/* Buscador */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, código o ubicación..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro por tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Propiedad
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Todos los tipos</option>
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Filtro por estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="available">Disponible</option>
                <option value="rented">Arrendada</option>
                <option value="maintenance">Mantenimiento</option>
              </select>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              {filteredProperties.length} {filteredProperties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
            </span>
            {(searchTerm || filterType !== 'all' || filterStatus !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterStatus('all');
                }}
                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de Propiedades */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Propiedades Disponibles
        </h4>

        {loadingProperties ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Cargando propiedades...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No se encontraron propiedades
            </p>
            {(searchTerm || filterType !== 'all' || filterStatus !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterStatus('all');
                }}
                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-sm"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
            {filteredProperties.map(property => {
              const isSelected = selectedPropertyIds.includes(property.id);

              return (
                <div
                  key={property.id}
                  className={`group relative rounded-lg border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg'
                  }`}
                  onClick={() => isSelected ? removeProperty(property.id) : addProperty(property.id)}
                >
                  {/* Badge de seleccionado */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="bg-purple-600 text-white rounded-full p-1 shadow-lg">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    </div>
                  )}

                  {/* Imagen o Placeholder */}
                  <div className="relative h-32 rounded-t-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    {property.image_url ? (
                      <img
                        src={property.image_url}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    {/* Código */}
                    <div className="absolute top-2 left-2">
                      <span className="bg-black/70 text-white text-xs px-2 py-1 rounded font-mono">
                        {property.code}
                      </span>
                    </div>
                    {/* Estado */}
                    <div className="absolute top-2 right-2">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        property.status === 'available'
                          ? 'bg-green-500 text-white'
                          : property.status === 'rented'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {property.status === 'available' ? 'Disponible' :
                         property.status === 'rented' ? 'Arrendada' : 
                         'Mantenimiento'}
                      </span>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-4">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                      {property.title}
                    </h5>
                    
                    <div className="space-y-1 mb-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {property.type}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {property.location}
                      </p>
                      <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${property.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Botón de acción */}
                    <button
                      type="button"
                      className={`w-full py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <X className="w-4 h-4" />
                          Remover
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Agregar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Nota informativa */}
      {selectedPropertyIds.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Sin Propiedades Asignadas
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Puedes continuar sin asignar propiedades y agregarlas más tarde desde el panel de administración.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
