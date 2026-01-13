import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Building2, 
  DollarSign, 
  MapPin, 
  Scale, 
  Sparkles,
  X,
  ExternalLink,
  Eye,
  EyeOff,
  Newspaper
} from 'lucide-react';
import { 
  getActiveRealEstateNews, 
  incrementNewsViews, 
  incrementNewsClicks,
  RealEstateNews 
} from '../lib/supabase';

// Tipos
export type { RealEstateNews };

interface FloatingNewsBubblesProps {
  maxBubbles?: number;
  className?: string;
}

// Configuración de colores por categoría (siguiendo el branding verde)
const categoryColors = {
  market: {
    bg: 'from-green-400 to-emerald-500',
    border: 'border-green-400',
    icon: 'text-green-600',
    glow: 'shadow-green-500/50'
  },
  construction: {
    bg: 'from-orange-400 to-amber-500',
    border: 'border-orange-400',
    icon: 'text-orange-600',
    glow: 'shadow-orange-500/50'
  },
  economy: {
    bg: 'from-blue-400 to-cyan-500',
    border: 'border-blue-400',
    icon: 'text-blue-600',
    glow: 'shadow-blue-500/50'
  },
  urbanism: {
    bg: 'from-purple-400 to-violet-500',
    border: 'border-purple-400',
    icon: 'text-purple-600',
    glow: 'shadow-purple-500/50'
  },
  legal: {
    bg: 'from-red-400 to-rose-500',
    border: 'border-red-400',
    icon: 'text-red-600',
    glow: 'shadow-red-500/50'
  },
  trends: {
    bg: 'from-pink-400 to-fuchsia-500',
    border: 'border-pink-400',
    icon: 'text-pink-600',
    glow: 'shadow-pink-500/50'
  }
};

// Iconos por categoría
const categoryIcons = {
  market: TrendingUp,
  construction: Building2,
  economy: DollarSign,
  urbanism: MapPin,
  legal: Scale,
  trends: Sparkles
};

const FloatingNewsBubbles: React.FC<FloatingNewsBubblesProps> = ({ 
  maxBubbles = 6,
  className = ''
}) => {
  const [news, setNews] = useState<RealEstateNews[]>([]);
  const [selectedNews, setSelectedNews] = useState<RealEstateNews | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = className.includes('mobile-news');
  const [isExpanded, setIsExpanded] = useState(!isMobile); // Colapsado por defecto en móvil

  // Cargar noticias desde Supabase
  useEffect(() => {
    loadNews();
  }, [maxBubbles]);

  const loadNews = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 FloatingNewsBubbles: Cargando noticias...');
      const data = await getActiveRealEstateNews(maxBubbles || 8);
      console.log('✅ FloatingNewsBubbles: Noticias cargadas:', data.length);
      console.log('📰 Noticias:', data);
      setNews(data);
    } catch (error) {
      console.error('❌ FloatingNewsBubbles: Error cargando noticias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar clic en burbuja
  const handleBubbleClick = async (newsItem: RealEstateNews) => {
    setSelectedNews(newsItem);
    // Incrementar vistas cuando se abre el modal
    await incrementNewsViews(newsItem.id);
  };

  // Manejar clic en el enlace externo
  const handleExternalLink = async (newsItem: RealEstateNews) => {
    await incrementNewsClicks(newsItem.id);
  };

  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  // Estado vacío - no hay noticias
  if (news.length === 0) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex flex-col items-center justify-center h-64 text-center p-8">
          <Newspaper className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
            No hay noticias disponibles
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Las noticias aparecerán aquí próximamente
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Contenedor con toggle */}
      <div className={`relative ${className}`}>
        {/* Botón flotante para móvil (cuando está colapsado) */}
        {isMobile && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 p-4 flex items-center gap-2"
          >
            <Newspaper className="w-6 h-6" />
            <span className="font-bold">{news.length}</span>
          </button>
        )}

        {/* Panel expandido */}
        {isExpanded && (
          <div className={`${isMobile ? 'fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto' : ''}`}>
            {/* Header con título y botón toggle */}
            <div className={`flex items-center justify-between ${isMobile ? 'p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10 shadow-sm' : 'mb-4 px-2'}`}>
              <div className="flex items-center gap-2">
                <Newspaper className={`${isMobile ? 'w-6 h-6' : 'w-5 h-5'} text-green-600`} />
                <h3 className={`${isMobile ? 'text-base' : 'text-sm'} font-bold text-gray-900 dark:text-white`}>
                  Noticias Inmobiliarias
                </h3>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  {news.length}
                </span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className={`${isMobile ? 'p-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30' : 'p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800'} rounded-lg transition-colors flex items-center gap-2`}
                title="Cerrar noticias"
              >
                {isMobile ? (
                  <>
                    <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Cerrar</span>
                  </>
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>

            {/* Lista de noticias */}
            <div className={`relative overflow-y-auto ${isMobile ? 'p-4 pb-20' : 'max-h-[calc(100vh-200px)] pr-2'}`}>
              <div className="space-y-3">
              {news.map((newsItem, index) => {
                const Icon = categoryIcons[newsItem.category];
                const colors = categoryColors[newsItem.category];
                
                return (
                  <motion.div
                    key={newsItem.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => handleBubbleClick(newsItem)}
                  >
                    <div className={`relative bg-white dark:bg-gray-800 rounded-xl border-2 ${colors.border} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}>
                      {/* Barra de color superior */}
                      <div className={`h-1 bg-gradient-to-r ${colors.bg}`} />
                      
                      {/* Contenido */}
                      <div className="p-4">
                        {/* Header con icono y categoría */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-r ${colors.bg} flex items-center justify-center shadow-md`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${colors.border} ${colors.icon} bg-opacity-10`}>
                                {newsItem.category.toUpperCase()}
                              </span>
                              {newsItem.importance >= 4 && (
                                <div className="flex items-center gap-1">
                                  {[...Array(newsItem.importance)].map((_, i) => (
                                    <Sparkles key={i} className="w-3 h-3 text-yellow-500" />
                                  ))}
                                </div>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">
                              {newsItem.title}
                            </h4>
                          </div>
                        </div>

                        {/* Resumen */}
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {newsItem.summary}
                        </p>

                        {/* Footer con ubicación y fuente */}
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{newsItem.location}</span>
                          </div>
                          {newsItem.source && (
                            <span className="truncate max-w-[120px]" title={newsItem.source}>
                              {newsItem.source}
                            </span>
                          )}
                        </div>

                        {/* Indicador de más info */}
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400 dark:text-gray-600">
                              {new Date(newsItem.published_at).toLocaleDateString('es-CO', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                            <span className="text-xs text-green-600 dark:text-green-500 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                              Ver más
                              <ExternalLink className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Efecto hover */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${colors.bg} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`} />
                    </div>
                  </motion.div>
                );
              })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedNews(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del modal */}
              <div className="relative">
                <button
                  onClick={() => setSelectedNews(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors z-10"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="p-6">
                {/* Header con icono grande */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-r ${categoryColors[selectedNews.category].bg} flex items-center justify-center shadow-xl`}>
                    {(() => {
                      const Icon = categoryIcons[selectedNews.category];
                      return <Icon className="w-8 h-8 text-white" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${categoryColors[selectedNews.category].border} ${categoryColors[selectedNews.category].icon} bg-opacity-10`}>
                        {selectedNews.category.toUpperCase()}
                      </span>
                      {selectedNews.importance >= 4 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                          <Sparkles className="w-3 h-3 text-yellow-600 dark:text-yellow-500" />
                          <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-500">Alta prioridad</span>
                        </div>
                      )}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                      {selectedNews.title}
                    </h2>
                    <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                      {selectedNews.summary}
                    </p>
                  </div>
                </div>

                {/* Grid de información */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Ubicación</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedNews.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Vistas</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedNews.views}</p>
                    </div>
                  </div>
                  {selectedNews.source && (
                    <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                      <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Newspaper className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Fuente</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{selectedNews.source}</p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Contenido completo */}
                {selectedNews.content && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-green-500 rounded-full" />
                      Detalles
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
                      {selectedNews.content}
                    </p>
                  </div>
                )}

                {/* Footer con fecha y botón */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p className="font-medium">Publicado el {new Date(selectedNews.published_at).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                  
                  {selectedNews.source_url && (
                    <a
                      href={selectedNews.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleExternalLink(selectedNews)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                    >
                      Leer noticia completa
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingNewsBubbles;
