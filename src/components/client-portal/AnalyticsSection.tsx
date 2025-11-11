import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';
import Card from '../UI/Card';
import type { ClientPayment } from '../../types/clientPortal';

interface AnalyticsSectionProps {
  payments: ClientPayment[];
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ payments }) => {
  // Colores para las gráficas
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  
  // Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calcular estadísticas generales
  const stats = useMemo(() => {
    const totalPaid = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount_paid), 0);
    
    const totalPending = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    
    const totalOverdue = payments
      .filter(p => p.status === 'overdue')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    
    const thisYear = new Date().getFullYear();
    const totalThisYear = payments
      .filter(p => {
        const paymentYear = new Date(p.due_date).getFullYear();
        return paymentYear === thisYear && p.status === 'paid';
      })
      .reduce((sum, p) => sum + Number(p.amount_paid), 0);
    
    return {
      totalPaid,
      totalPending,
      totalOverdue,
      totalThisYear
    };
  }, [payments]);

  // Datos para gráfica de pagos por mes (últimos 12 meses)
  const monthlyPaymentsData = useMemo(() => {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentDate = new Date();
    const data = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthPayments = payments.filter(p => {
        const paymentDate = new Date(p.payment_date || p.due_date);
        return paymentDate.getMonth() === month && 
               paymentDate.getFullYear() === year &&
               p.status === 'paid';
      });

      const totalPaid = monthPayments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
      
      data.push({
        name: `${monthNames[month]} ${year.toString().slice(2)}`,
        total: totalPaid,
        count: monthPayments.length
      });
    }

    return data;
  }, [payments]);

  // Datos para gráfica de línea de tendencias
  const trendData = useMemo(() => {
    return monthlyPaymentsData.map(item => ({
      name: item.name,
      pagado: item.total
    }));
  }, [monthlyPaymentsData]);

  // Datos para pie chart - distribución por tipo de pago
  const paymentTypeDistribution = useMemo(() => {
    const distribution: { [key: string]: number } = {};
    
    payments.filter(p => p.status === 'paid').forEach(payment => {
      const type = payment.payment_type;
      distribution[type] = (distribution[type] || 0) + Number(payment.amount_paid);
    });

    const typeNames: { [key: string]: string } = {
      rent: 'Arriendo',
      deposit: 'Depósito',
      administration: 'Administración',
      utilities: 'Servicios',
      late_fee: 'Mora'
    };

    return Object.entries(distribution).map(([type, value]) => ({
      name: typeNames[type] || type,
      value,
      percentage: (value / stats.totalPaid * 100).toFixed(1)
    }));
  }, [payments, stats.totalPaid]);

  // Datos para comparativa año a año
  const yearlyComparison = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear];
    
    return years.map(year => {
      const yearPayments = payments.filter(p => {
        const paymentYear = new Date(p.payment_date || p.due_date).getFullYear();
        return paymentYear === year && p.status === 'paid';
      });

      const total = yearPayments.reduce((sum, p) => sum + Number(p.amount_paid), 0);

      return {
        year: year.toString(),
        total,
        count: yearPayments.length
      };
    });
  }, [payments]);

  // Custom tooltip para las gráficas
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
              {entry.name}: <span className="font-semibold">{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Análisis de Pagos
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tendencias y estadísticas de tus pagos
          </p>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Pagado</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(stats.totalPaid)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-200" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Pendiente</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(stats.totalPending)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-yellow-200" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 bg-gradient-to-br from-red-500 to-red-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Vencido</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(stats.totalOverdue)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-red-200" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Este Año</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(stats.totalThisYear)}
                </p>
              </div>
              <Calendar className="w-10 h-10 text-blue-200" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica de barras - Pagos por mes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Pagos Mensuales (Últimos 12 meses)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyPaymentsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Gráfica de línea - Tendencia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tendencia de Pagos
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="pagado" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Pie chart - Distribución por tipo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Distribución por Tipo de Pago
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentTypeDistribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {paymentTypeDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Comparativa año a año */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Comparativa Año a Año
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearlyComparison}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="year" 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {yearlyComparison.map((year, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{year.year}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 dark:text-gray-400">
                      {year.count} pagos
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(year.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsSection;
