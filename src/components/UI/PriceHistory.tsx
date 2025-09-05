import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { PriceHistory } from '../../types';

interface PriceHistoryComponentProps {
  priceHistory?: PriceHistory[];
  currentPrice: number;
  propertyType: 'sale' | 'rent';
}

const PriceHistoryComponent: React.FC<PriceHistoryComponentProps> = ({
  priceHistory,
  currentPrice,
  propertyType
}) => {
  // Mock data si no hay historial
  const mockHistory: PriceHistory[] = priceHistory || [
    { date: '2024-01-01', price: currentPrice * 0.95, type: propertyType },
    { date: '2024-03-01', price: currentPrice * 0.97, type: propertyType },
    { date: '2024-06-01', price: currentPrice * 0.98, type: propertyType },
    { date: '2024-09-01', price: currentPrice, type: propertyType },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
    });
  };

  const calculatePercentageChange = (oldPrice: number, newPrice: number) => {
    return ((newPrice - oldPrice) / oldPrice) * 100;
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (mockHistory.length < 2) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Historial de Precios
        </h4>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No hay suficiente historial de precios disponible
        </p>
      </div>
    );
  }

  const latestPrice = mockHistory[mockHistory.length - 1].price;
  const previousPrice = mockHistory[mockHistory.length - 2].price;
  const overallChange = calculatePercentageChange(mockHistory[0].price, latestPrice);

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Historial de Precios
        </h4>
        <div className="flex items-center space-x-2">
          {getTrendIcon(overallChange)}
          <span className={`text-sm font-medium ${getTrendColor(overallChange)}`}>
            {overallChange > 0 ? '+' : ''}{overallChange.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Precio Actual */}
      <div className="mb-6">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatPrice(latestPrice)}
        </div>
        <div className="flex items-center space-x-2 mt-1">
          {getTrendIcon(calculatePercentageChange(previousPrice, latestPrice))}
          <span className={`text-sm ${getTrendColor(calculatePercentageChange(previousPrice, latestPrice))}`}>
            {calculatePercentageChange(previousPrice, latestPrice) > 0 ? '+' : ''}
            {calculatePercentageChange(previousPrice, latestPrice).toFixed(1)}% desde el período anterior
          </span>
        </div>
      </div>

      {/* Gráfico Simple */}
      <div className="mb-6">
        <div className="h-32 relative bg-white dark:bg-gray-800 rounded-lg p-4">
          <svg className="w-full h-full" viewBox="0 0 400 100">
            {/* Líneas de la cuadrícula */}
            <defs>
              <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-200 dark:text-gray-600"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Línea de precios */}
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-green-500"
              points={mockHistory.map((item, index) => {
                const x = (index / (mockHistory.length - 1)) * 360 + 20;
                const minPrice = Math.min(...mockHistory.map(h => h.price));
                const maxPrice = Math.max(...mockHistory.map(h => h.price));
                const priceRange = maxPrice - minPrice || 1;
                const y = 80 - ((item.price - minPrice) / priceRange) * 60;
                return `${x},${y}`;
              }).join(' ')}
            />
            
            {/* Puntos en la línea */}
            {mockHistory.map((item, index) => {
              const x = (index / (mockHistory.length - 1)) * 360 + 20;
              const minPrice = Math.min(...mockHistory.map(h => h.price));
              const maxPrice = Math.max(...mockHistory.map(h => h.price));
              const priceRange = maxPrice - minPrice || 1;
              const y = 80 - ((item.price - minPrice) / priceRange) * 60;
              
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="currentColor"
                  className="text-green-500"
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Lista de Precios */}
      <div className="space-y-3">
        <h5 className="font-medium text-gray-900 dark:text-white">Cambios Recientes</h5>
        {mockHistory.slice(-4).reverse().map((item, index) => {
          const isLatest = index === 0;
          const previousItem = mockHistory[mockHistory.findIndex(h => h.date === item.date) - 1];
          const change = previousItem ? calculatePercentageChange(previousItem.price, item.price) : 0;
          
          return (
            <div
              key={item.date}
              className={`flex items-center justify-between p-3 rounded-lg ${
                isLatest 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${isLatest ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(item.date)}
                    {isLatest && (
                      <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                        Actual
                      </span>
                    )}
                  </div>
                  {previousItem && (
                    <div className={`text-xs flex items-center space-x-1 ${getTrendColor(change)}`}>
                      {getTrendIcon(change)}
                      <span>{change > 0 ? '+' : ''}{change.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatPrice(item.price)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Precio inicial:</span>
            <div className="font-medium text-gray-900 dark:text-white">
              {formatPrice(mockHistory[0].price)}
            </div>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Cambio total:</span>
            <div className={`font-medium ${getTrendColor(overallChange)}`}>
              {overallChange > 0 ? '+' : ''}{overallChange.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceHistoryComponent;
