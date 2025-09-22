import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Search,
  User,
  Mail,
  Phone,
  Clock,
  DollarSign,
  AlertTriangle,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ServiceInquiry {
  id: string;
  created_at: string;
  updated_at: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  service_type: string;
  urgency: 'urgent' | 'normal' | 'flexible';
  budget?: string;
  details: string;
  selected_questions?: any[];
  status: 'pending' | 'contacted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  assigned_advisor_id?: string;
  whatsapp_sent?: boolean;
  whatsapp_sent_at?: string;
  response_received?: boolean;
  response_received_at?: string;
  source?: string;
  notes?: string;
}

function AdminInquiries() {
  const [inquiries, setInquiries] = useState<ServiceInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState<ServiceInquiry | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      console.log('📡 Cargando consultas de servicio...');

      const { data, error } = await supabase
        .from('service_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error al cargar consultas:', error);
        return;
      }

      console.log('✅ Consultas cargadas:', data?.length || 0);
      setInquiries(data || []);
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (inquiry.client_email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                         inquiry.service_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || inquiry.urgency === urgencyFilter;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'text-red-600 dark:text-red-400';
      case 'normal': return 'text-blue-600 dark:text-blue-400';
      case 'flexible': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return <AlertTriangle className="w-4 h-4" />;
      case 'normal': return <Clock className="w-4 h-4" />;
      case 'flexible': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getServiceTypeLabel = (serviceType: string) => {
    const labels: { [key: string]: string } = {
      'arrendamientos': 'Arrendamientos',
      'ventas': 'Ventas',
      'avaluos': 'Avalúos',
      'asesorias-contables': 'Asesorías Contables',
      'remodelacion': 'Remodelación',
      'reparacion': 'Reparación',
      'construccion': 'Construcción'
    };
    return labels[serviceType] || serviceType;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Consultas de Servicio
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona las consultas de servicios inmobiliarios
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            {filteredInquiries.length} consultas
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="relative">
            <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">Todas las urgencias</option>
              <option value="urgent">Urgente</option>
              <option value="normal">Normal</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inquiries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          ))
        ) : filteredInquiries.length > 0 ? (
          filteredInquiries.map((inquiry) => (
            <motion.div
              key={inquiry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-6 border-l-4 border-blue-500"
              onClick={() => setSelectedInquiry(inquiry)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {inquiry.client_name}
                  </h3>
                </div>
                <div className="flex items-center space-x-1">
                  {getUrgencyIcon(inquiry.urgency)}
                  <span className={`text-xs font-medium uppercase ${getUrgencyColor(inquiry.urgency)}`}>
                    {inquiry.urgency}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <MessageSquare className="w-4 h-4" />
                  <span>{getServiceTypeLabel(inquiry.service_type)}</span>
                </div>
                {inquiry.client_email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{inquiry.client_email}</span>
                  </div>
                )}
                {inquiry.client_phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{inquiry.client_phone}</span>
                  </div>
                )}
                {inquiry.budget && (
                  <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                    <DollarSign className="w-4 h-4" />
                    <span>{inquiry.budget}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(inquiry.status)}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                    {inquiry.status === 'pending' && 'Pendiente'}
                    {inquiry.status === 'in_progress' && 'En Progreso'}
                    {inquiry.status === 'completed' && 'Completado'}
                    {inquiry.status === 'cancelled' && 'Cancelado'}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(inquiry.created_at)}
                </span>
              </div>

              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 overflow-hidden" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {inquiry.details}
              </div>

              {/* Indicador visual de que es clickeable */}
              <div className="mt-3 flex items-center justify-end">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-blue-500 ml-1">Ver detalles</span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay consultas disponibles
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No se encontraron consultas que coincidan con los filtros aplicados.
            </p>
          </div>
        )}
      </div>

      {/* Modal Ver Consulta */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Detalles de Consulta
                </h2>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Información del cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {selectedInquiry.client_name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Servicio
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {getServiceTypeLabel(selectedInquiry.service_type)}
                  </p>
                </div>
                {selectedInquiry.client_email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedInquiry.client_email}
                    </p>
                  </div>
                )}
                {selectedInquiry.client_phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Teléfono
                    </label>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedInquiry.client_phone}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Urgencia
                  </label>
                  <div className="flex items-center space-x-2">
                    {getUrgencyIcon(selectedInquiry.urgency)}
                    <span className={`font-medium ${getUrgencyColor(selectedInquiry.urgency)}`}>
                      {selectedInquiry.urgency === 'urgent' && 'Urgente'}
                      {selectedInquiry.urgency === 'normal' && 'Normal'}
                      {selectedInquiry.urgency === 'flexible' && 'Flexible'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estado
                  </label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedInquiry.status)}
                    <span className={`font-medium ${getStatusColor(selectedInquiry.status)}`}>
                      {selectedInquiry.status === 'pending' && 'Pendiente'}
                      {selectedInquiry.status === 'in_progress' && 'En Progreso'}
                      {selectedInquiry.status === 'completed' && 'Completado'}
                      {selectedInquiry.status === 'cancelled' && 'Cancelado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Presupuesto */}
              {selectedInquiry.budget && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Presupuesto
                  </label>
                  <p className="text-green-600 dark:text-green-400 font-medium text-lg">
                    {selectedInquiry.budget}
                  </p>
                </div>
              )}

              {/* Detalles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Detalles de la consulta
                </label>
                <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  {selectedInquiry.details}
                </p>
              </div>

              {/* Preguntas y respuestas */}
              {selectedInquiry.selected_questions && selectedInquiry.selected_questions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preguntas específicas
                  </label>
                  <div className="space-y-3">
                    {selectedInquiry.selected_questions.map((qa: any, index: number) => (
                      <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-500">
                        <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                          {qa.question}
                        </p>
                        {qa.answer && (
                          <p className="text-blue-700 dark:text-blue-300 text-sm">
                            {qa.answer}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Información adicional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div>
                  <span className="font-medium">Fecha de creación:</span>
                  <br />
                  {formatDate(selectedInquiry.created_at)}
                </div>
                {selectedInquiry.source && (
                  <div>
                    <span className="font-medium">Origen:</span>
                    <br />
                    {selectedInquiry.source}
                  </div>
                )}
                {selectedInquiry.updated_at && (
                  <div>
                    <span className="font-medium">Última actualización:</span>
                    <br />
                    {formatDate(selectedInquiry.updated_at)}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default AdminInquiries;