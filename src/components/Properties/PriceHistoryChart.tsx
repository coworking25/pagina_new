import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PriceHistoryItem {
  id: number;
  property_id: number;
  price_type: 'sale' | 'rent';
  old_price: number;
  new_price: number;
  changed_at: string;
}

interface PriceHistoryChartProps {
  history: PriceHistoryItem[];
}

export default function PriceHistoryChart({ history }: PriceHistoryChartProps) {
  if (!history || history.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">No hay historial de precios disponible</p>
      </div>
    );
  }

  // Procesar datos para el gráfico
  // Agrupar por fecha y tipo
  const data = history.map(item => ({
    date: new Date(item.changed_at).getTime(), // Timestamp para ordenamiento correcto
    formattedDate: format(new Date(item.changed_at), 'dd MMM yyyy', { locale: es }),
    price: item.new_price,
    type: item.price_type === 'sale' ? 'Venta' : 'Arriendo',
    original: item
  })).sort((a, b) => a.date - b.date);

  // Separar series si hay ambos tipos
  const saleData = data.filter(d => d.original.price_type === 'sale');
  const rentData = data.filter(d => d.original.price_type === 'rent');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{payload[0].payload.formattedDate}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="text-sm">
              <span style={{ color: entry.color }}>●</span> {entry.name}: {formatCurrency(entry.value)}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="formattedDate" 
            stroke="#6b7280"
            fontSize={12}
            tickMargin={10}
            allowDuplicatedCategory={false}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {saleData.length > 0 && (
            <Line
              data={saleData}
              type="monotone"
              dataKey="price"
              name="Precio Venta"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}
          
          {rentData.length > 0 && (
            <Line
              data={rentData}
              type="monotone"
              dataKey="price"
              name="Precio Arriendo"
              stroke="#16a34a"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
