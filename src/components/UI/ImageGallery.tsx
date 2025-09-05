import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download, Maximize2 } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  title: string;
  currentIndex: number;
  onImageChange: (index: number) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  title,
  currentIndex,
  onImageChange,
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const nextLightboxImage = () => {
    setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevLightboxImage = () => {
    setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}-imagen-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const nextImage = () => {
    onImageChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const prevImage = () => {
    onImageChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="space-y-4">
        {/* Imagen Principal */}
        <div className="relative h-64 lg:h-80 rounded-xl overflow-hidden group">
          <motion.img
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            src={images[currentIndex]}
            alt={`${title} - Imagen ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay de controles */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
            {/* Botones de navegación */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Botones de acción */}
            <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={() => openLightbox(currentIndex)}
                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200"
                title="Ver en pantalla completa"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => downloadImage(images[currentIndex], currentIndex)}
                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200"
                title="Descargar imagen"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contador de imágenes */}
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Miniaturas */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.slice(0, 8).map((image, index) => (
              <button
                key={index}
                onClick={() => onImageChange(index)}
                className={`relative h-16 lg:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  index === currentIndex 
                    ? 'border-green-500 ring-2 ring-green-500/30' 
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img
                  src={image}
                  alt={`${title} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 7 && images.length > 8 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      +{images.length - 8}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <div className="fixed inset-0 z-[9999] bg-black">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              {/* Imagen en lightbox */}
              <motion.img
                key={lightboxIndex}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={images[lightboxIndex]}
                alt={`${title} - Imagen ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />

              {/* Controles del lightbox */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => downloadImage(images[lightboxIndex], lightboxIndex)}
                  className="p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200"
                  title="Descargar imagen"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={closeLightbox}
                  className="p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navegación del lightbox */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevLightboxImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextLightboxImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Contador en lightbox */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg">
                {lightboxIndex + 1} de {images.length}
              </div>

              {/* Miniaturas en lightbox */}
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-lg overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setLightboxIndex(index)}
                    className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === lightboxIndex 
                        ? 'border-white' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Miniatura ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageGallery;
