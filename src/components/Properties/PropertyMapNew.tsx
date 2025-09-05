import React from 'react';
import { Property } from '../../types';

interface PropertyMapProps {
  properties: Property[];
  onPropertySelect: (property: Property) => void;
  selectedProperty?: Property;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  onPropertySelect,
  selectedProperty,
}) => {
  // Mapa temporalmente deshabilitado debido a conflictos de dependencias
  return (
    <div className="h-full w-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-center p-8">
        <div className="text-4xl mb-4">🗺️</div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Mapa Temporalmente No Disponible
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Estamos actualizando el componente del mapa.
          <br />
          Mientras tanto, puedes ver las propiedades en la lista.
        </p>
        <div className="mt-4 text-xs text-gray-400">
          {properties.length} propiedades disponibles
        </div>
        {selectedProperty && (
          <div className="mt-2 text-xs text-blue-500">
            Seleccionada: {selectedProperty.title}
          </div>
        )}
        {properties.length > 0 && (
          <button 
            onClick={() => onPropertySelect(properties[0])}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
          >
            Ver Primera Propiedad
          </button>
        )}
      </div>
    </div>
  );
};

export default PropertyMap;
