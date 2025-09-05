import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  FileText,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import Button from '../UI/Button';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    title: string;
    url: string;
    type: string;
    size: string;
  };
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(5); // Simulado para demo

  const handleDownload = () => {
    // Crear un enlace temporal para descargar
    const link = window.document.createElement('a');
    link.href = document.url;
    link.download = `${document.title}.${document.type.toLowerCase()}`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const zoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const rotate = () => setRotation(prev => (prev + 90) % 360);
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl ${
            isFullscreen 
              ? 'w-full h-full rounded-none' 
              : 'w-11/12 h-5/6 max-w-6xl max-h-[90vh]'
          } flex flex-col`}
        >
          {/* Header con controles */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {document.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {document.type} • {document.size}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Controles de zoom y rotación */}
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={zoomOut}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  disabled={zoom <= 50}
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-2 text-sm font-medium min-w-[60px] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={zoomIn}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  disabled={zoom >= 200}
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={rotate}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <Button
                variant="primary"
                size="sm"
                icon={Download}
                onClick={handleDownload}
              >
                Descargar
              </Button>

              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Visor de documento */}
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
            <div 
              className="bg-white shadow-lg transition-transform duration-200"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                width: '595px', // Tamaño estándar de PDF A4
                height: '842px',
                maxWidth: '90%',
                maxHeight: '90%'
              }}
            >
              {/* Simulación de contenido PDF */}
              <div className="w-full h-full p-8 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-20 h-8 bg-blue-600 rounded"></div>
                  <div className="text-right">
                    <div className="w-32 h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="w-24 h-4 bg-gray-300 rounded"></div>
                  </div>
                </div>
                
                <div className="text-center mb-8">
                  <div className="w-48 h-6 bg-gray-800 rounded mx-auto mb-4"></div>
                  <div className="w-64 h-4 bg-gray-400 rounded mx-auto"></div>
                </div>

                <div className="space-y-3 flex-1">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="flex space-x-2">
                      <div className="w-4 h-4 bg-gray-300 rounded-full flex-shrink-0 mt-1"></div>
                      <div className="flex-1 space-y-2">
                        <div className="w-full h-3 bg-gray-200 rounded"></div>
                        {Math.random() > 0.5 && (
                          <div className="w-3/4 h-3 bg-gray-200 rounded"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <div className="w-24 h-4 bg-gray-300 rounded"></div>
                    <div className="w-16 h-4 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlay de carga */}
            {zoom !== 100 && (
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                Zoom: {zoom}%
              </div>
            )}
          </div>

          {/* Navegación de páginas */}
          <div className="flex items-center justify-center space-x-4 p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Página</span>
              <input
                type="number"
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    setCurrentPage(page);
                  }
                }}
                min={1}
                max={totalPages}
                className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">de {totalPages}</span>
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DocumentViewerModal;
