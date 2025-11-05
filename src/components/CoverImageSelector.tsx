import { useState } from 'react';
import { CheckCircle, Star } from 'lucide-react';

interface CoverImageSelectorProps {
  images: string[];
  onSelectCover: (imageUrl: string) => void;
  propertyCode?: string;
}

export const CoverImageSelector = ({ 
  images, 
  onSelectCover,
  propertyCode 
}: CoverImageSelectorProps) => {
  // La primera imagen es siempre la portada en nuestro sistema temporal
  const [selectedImage, setSelectedImage] = useState<string>(images[0] || '');

  const handleSelectCover = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    onSelectCover(imageUrl);
  };

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-2">📷</div>
        <p className="text-gray-500">No hay imágenes disponibles</p>
        <p className="text-sm text-gray-400">Sube imágenes para poder seleccionar una portada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900">
          Seleccionar Imagen de Portada
        </h3>
        {propertyCode && (
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {propertyCode}
          </span>
        )}
      </div>
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>Nota:</strong> La imagen seleccionada como portada se moverá a la primera posición 
          y será la que aparezca en las listas de propiedades.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((imageUrl, index) => {
          const isSelected = selectedImage === imageUrl;
          const isCurrentCover = index === 0; // La primera imagen es la portada actual
          
          return (
            <div
              key={index}
              className={`relative group cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                isSelected 
                  ? 'ring-4 ring-blue-500 shadow-lg transform scale-105' 
                  : 'hover:ring-2 hover:ring-blue-300 hover:shadow-md'
              }`}
              onClick={() => handleSelectCover(imageUrl)}
            >
              <div className="aspect-square relative">
                <img
                  src={imageUrl}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                
                {/* Overlay de selección */}
                <div className={`absolute inset-0 transition-all duration-200 ${
                  isSelected 
                    ? 'bg-blue-600 bg-opacity-20' 
                    : 'bg-black bg-opacity-0 group-hover:bg-opacity-10'
                }`}>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-6 h-6 text-blue-600 bg-white rounded-full" />
                    </div>
                  )}
                  
                  {isCurrentCover && !isSelected && (
                    <div className="absolute top-2 right-2">
                      <Star className="w-6 h-6 text-yellow-500 bg-white rounded-full p-1" />
                    </div>
                  )}
                </div>

                {/* Número de imagen */}
                <div className="absolute bottom-2 left-2">
                  <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                </div>

                {/* Indicador de portada actual */}
                {isCurrentCover && (
                  <div className="absolute bottom-2 right-2">
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded font-medium">
                      Portada Actual
                    </span>
                  </div>
                )}
              </div>

              {/* Información adicional al hacer hover */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3">
                <p className="text-white text-sm font-medium">
                  {isSelected ? '✓ Seleccionada' : 'Clic para seleccionar'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {selectedImage && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Imagen de portada seleccionada</h4>
              <p className="text-sm text-blue-700 mt-1">
                Esta imagen se moverá a la primera posición y aparecerá como la principal en la vista de propiedades.
              </p>
              {selectedImage !== images[0] && (
                <p className="text-sm text-blue-600 mt-2 font-medium">
                  💾 Los cambios se aplicarán automáticamente al hacer la selección
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoverImageSelector;
