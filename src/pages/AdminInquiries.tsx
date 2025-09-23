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
  AlertCircle,
  Edit,
  Trash2,
  MessageCircle as WhatsApp,
  Send,
  Save,
  X
} from 'lucide-react';
import { supabase, updateServiceInquiry, deleteServiceInquiry } from '../lib/supabase';
import type { ServiceInquiry } from '../types';

function AdminInquiries() {
  const [inquiries, setInquiries] = useState<ServiceInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState<ServiceInquiry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ServiceInquiry>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      const updated = await updateServiceInquiry(inquiryId, { 
        status: newStatus as ServiceInquiry['status'],
        updated_at: new Date().toISOString()
      });
      
      if (updated) {
        setInquiries(prev => prev.map(inq => 
          inq.id === inquiryId ? updated : inq
        ));
        if (selectedInquiry?.id === inquiryId) {
          setSelectedInquiry(updated);
        }
        console.log('✅ Estado actualizado correctamente');
      }
    } catch (error) {
      console.error('❌ Error al actualizar estado:', error);
    }
  };

  const handleDeleteInquiry = async (inquiryId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta consulta? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const success = await deleteServiceInquiry(inquiryId);
      if (success) {
        setInquiries(prev => prev.filter(inq => inq.id !== inquiryId));
        setSelectedInquiry(null);
        setShowDeleteConfirm(false);
        console.log('✅ Consulta eliminada correctamente');
      }
    } catch (error) {
      console.error('❌ Error al eliminar consulta:', error);
    }
  };

  const generateServiceMessage = (inquiry: ServiceInquiry, isWhatsApp: boolean = true) => {
    const serviceLabels = {
      'arrendamientos': 'Arrendamientos',
      'ventas': 'Ventas',
      'avaluos': 'Avalúos',
      'asesorias-contables': 'Asesorías Contables',
      'remodelacion': 'Remodelación',
      'reparacion': 'Reparación',
      'construccion': 'Construcción'
    };

    const serviceName = serviceLabels[inquiry.service_type] || inquiry.service_type;
    const advisorName = 'Coworking Inmobiliario'; // Puedes cambiar esto por el nombre real

    let message = '';

    if (isWhatsApp) {
      message = `🏠 *${advisorName} - Consulta de ${serviceName}*

Hola ${inquiry.client_name},

Gracias por contactarnos sobre tu consulta de *${serviceName}*.`;
    } else {
      message = `${advisorName} - Consulta de ${serviceName}

Hola ${inquiry.client_name},

Gracias por contactarnos sobre tu consulta de ${serviceName}.`;
    }

    // Agregar detalles específicos según el servicio
    switch (inquiry.service_type) {
      case 'arrendamientos':
        message += `

📋 *Detalles de tu consulta de arrendamiento:*`;
        if (inquiry.details) message += `\n${inquiry.details}`;
        message += `

💰 *Presupuesto:* ${inquiry.budget || 'No especificado'}
⏰ *Urgencia:* ${inquiry.urgency === 'urgent' ? 'Urgente' : inquiry.urgency === 'normal' ? 'Normal' : 'Flexible'}

¿Te gustaría que te ayude a encontrar la propiedad ideal para arrendar?`;
        break;

      case 'ventas':
        message += `

📋 *Detalles de tu consulta de venta:*`;
        if (inquiry.details) message += `\n${inquiry.details}`;
        message += `

💰 *Valor aproximado:* ${inquiry.budget || 'No especificado'}
⏰ *Urgencia:* ${inquiry.urgency === 'urgent' ? 'Urgente' : inquiry.urgency === 'normal' ? 'Normal' : 'Flexible'}

¿Te gustaría que evaluemos el valor de mercado de tu propiedad y te ayudemos con el proceso de venta?`;
        break;

      case 'avaluos':
        message += `

📋 *Detalles de tu avalúo:*`;
        if (inquiry.details) message += `\n${inquiry.details}`;
        message += `

💰 *Valor aproximado:* ${inquiry.budget || 'No especificado'}
⏰ *Urgencia:* ${inquiry.urgency === 'urgent' ? 'Urgente' : inquiry.urgency === 'normal' ? 'Normal' : 'Flexible'}

¿Necesitas un avalúo comercial o catastral? Te puedo ayudar con toda la documentación necesaria.`;
        break;

      case 'asesorias-contables':
        message += `

📋 *Detalles de tu asesoría contable:*`;
        if (inquiry.details) message += `\n${inquiry.details}`;
        message += `

💰 *Presupuesto:* ${inquiry.budget || 'No especificado'}
⏰ *Urgencia:* ${inquiry.urgency === 'urgent' ? 'Urgente' : inquiry.urgency === 'normal' ? 'Normal' : 'Flexible'}

¿Necesitas ayuda con declaración de renta, asesoría tributaria o consultoría financiera?`;
        break;

      case 'remodelacion':
        message += `

📋 *Detalles de tu proyecto de remodelación:*`;
        if (inquiry.details) message += `\n${inquiry.details}`;
        message += `

💰 *Presupuesto:* ${inquiry.budget || 'No especificado'}
⏰ *Urgencia:* ${inquiry.urgency === 'urgent' ? 'Urgente' : inquiry.urgency === 'normal' ? 'Normal' : 'Flexible'}

¿Te gustaría que te ayude con el diseño, presupuesto y ejecución de tu remodelación?`;
        break;

      case 'reparacion':
        message += `

📋 *Detalles de tu reparación:*`;
        if (inquiry.details) message += `\n${inquiry.details}`;
        message += `

💰 *Presupuesto:* ${inquiry.budget || 'No especificado'}
⏰ *Urgencia:* ${inquiry.urgency === 'urgent' ? 'Urgente' : inquiry.urgency === 'normal' ? 'Normal' : 'Flexible'}

¿Necesitas reparaciones urgentes o mantenimiento preventivo?`;
        break;

      case 'construccion':
        message += `

📋 *Detalles de tu proyecto de construcción:*`;
        if (inquiry.details) message += `\n${inquiry.details}`;
        message += `

💰 *Presupuesto:* ${inquiry.budget || 'No especificado'}
⏰ *Urgencia:* ${inquiry.urgency === 'urgent' ? 'Urgente' : inquiry.urgency === 'normal' ? 'Normal' : 'Flexible'}

¿Te gustaría que te ayude con permisos, diseños y construcción de tu proyecto?`;
        break;

      default:
        message += `

📋 *Detalles de tu consulta:*`;
        if (inquiry.details) message += `\n${inquiry.details}`;
        message += `

💰 *Presupuesto:* ${inquiry.budget || 'No especificado'}
⏰ *Urgencia:* ${inquiry.urgency === 'urgent' ? 'Urgente' : inquiry.urgency === 'normal' ? 'Normal' : 'Flexible'}`;
    }

    // Agregar preguntas específicas si las hay
    if (inquiry.selected_questions && inquiry.selected_questions.length > 0) {
      message += `\n\n❓ *Preguntas específicas:*`;
      inquiry.selected_questions.forEach((qa: any) => {
        message += `\n• ${qa.question}`;
        if (qa.answer) message += `\n  ↳ ${qa.answer}`;
      });
    }

    // Llamado a acción y preguntas para actualizar estado
    message += `

🤔 *Para continuar con tu consulta, por favor responde:*

1. ¿Sigues interesado en este servicio? (Sí/No)
2. ¿Cuándo te gustaría que nos reunamos para discutir los detalles?
3. ¿Hay algún cambio en tu presupuesto o requisitos?

${isWhatsApp ? '📞' : '📧'} *IMPORTANTE:* Responde a este mensaje para que pueda actualizar el estado de tu consulta.

*Estados de tu consulta:*
• 🔄 En proceso de revisión
• ✅ Confirmado - Nos pondremos en contacto pronto
• ❌ No interesado - Archivado
• ⏳ Pendiente de tu respuesta

¡Gracias por confiar en nosotros!

*Atentamente,*
*Equipo de ${advisorName}*
${isWhatsApp ? '📱 WhatsApp: +57 XXX XXX XXXX' : ''}
📧 Email: info@inmobiliaria.com
🌐 Web: www.inmobiliaria.com`;

    return message;
  };

  const handleClientResponse = (inquiry: ServiceInquiry, responseType: 'interested' | 'not_interested' | 'needs_more_info' | 'scheduled') => {
    if (!inquiry.id) return;

    let newStatus: ServiceInquiry['status'];
    let notes = inquiry.notes || '';

    switch (responseType) {
      case 'interested':
        newStatus = 'in_progress';
        notes += `\n[${new Date().toLocaleString()}] Cliente interesado - Movido a "En Progreso"`;
        break;
      case 'not_interested':
        newStatus = 'cancelled';
        notes += `\n[${new Date().toLocaleString()}] Cliente no interesado - Consulta cancelada`;
        break;
      case 'needs_more_info':
        newStatus = 'contacted';
        notes += `\n[${new Date().toLocaleString()}] Cliente necesita más información - Manteniendo como contactado`;
        break;
      case 'scheduled':
        newStatus = 'in_progress';
        notes += `\n[${new Date().toLocaleString()}] Reunión agendada - Movido a "En Progreso"`;
        break;
      default:
        return;
    }

    handleStatusChange(inquiry.id, newStatus);
    
    // Actualizar notas si es necesario
    if (notes !== inquiry.notes) {
      updateServiceInquiry(inquiry.id, { notes });
    }
  };

  const handleContactClient = (inquiry: ServiceInquiry) => {
    if (inquiry.client_phone) {
      // WhatsApp
      const message = generateServiceMessage(inquiry, true);
      const whatsappUrl = `https://wa.me/${inquiry.client_phone.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      // Actualizar estado a "contacted" si estaba en "pending"
      if (inquiry.status === 'pending' && inquiry.id) {
        handleStatusChange(inquiry.id, 'contacted');
      }
    } else if (inquiry.client_email) {
      // Email
      const subject = `Respuesta a tu consulta sobre ${getServiceTypeLabel(inquiry.service_type)}`;
      const body = generateServiceMessage(inquiry, false);
      const emailUrl = `mailto:${inquiry.client_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(emailUrl, '_blank');
      
      // Actualizar estado a "contacted" si estaba en "pending"
      if (inquiry.status === 'pending' && inquiry.id) {
        handleStatusChange(inquiry.id, 'contacted');
      }
    } else {
      alert('No hay información de contacto disponible para este cliente.');
    }
  };

  const handleEditInquiry = () => {
    if (!selectedInquiry) return;
    setEditForm({ ...selectedInquiry });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedInquiry?.id || !editForm) return;

    try {
      const updated = await updateServiceInquiry(selectedInquiry.id, {
        ...editForm,
        updated_at: new Date().toISOString()
      } as Partial<ServiceInquiry>);

      if (updated) {
        setInquiries(prev => prev.map(inq => 
          inq.id === selectedInquiry.id ? updated : inq
        ));
        setSelectedInquiry(updated);
        setIsEditing(false);
        console.log('✅ Consulta actualizada correctamente');
      }
    } catch (error) {
      console.error('❌ Error al actualizar consulta:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (inquiry.client_email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                         inquiry.service_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || inquiry.urgency === urgencyFilter;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'contacted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'in_progress': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'contacted': return <MessageSquare className="w-4 h-4" />;
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
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
              <option value="contacted">Contactado</option>
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
              className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-700 p-6 border-l-4 border-blue-500"
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
                    {inquiry.status === 'contacted' && 'Contactado'}
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

              {/* Acciones rápidas */}
              <div className="mt-3 flex items-center justify-end space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContactClient(inquiry);
                  }}
                  className="flex items-center justify-center w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
                  title="Contactar cliente"
                >
                  <Send className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedInquiry(inquiry);
                  }}
                  className="flex items-center justify-center w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                  title="Ver detalles"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedInquiry(inquiry);
                    setEditForm({ ...inquiry });
                    setIsEditing(true);
                  }}
                  className="flex items-center justify-center w-8 h-8 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full transition-colors"
                  title="Editar consulta"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('¿Estás seguro de que quieres eliminar esta consulta? Esta acción no se puede deshacer.')) {
                      handleDeleteInquiry(inquiry.id!);
                    }
                  }}
                  className="flex items-center justify-center w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                  title="Eliminar consulta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
              <div className="flex items-center space-x-2">
                {!isEditing ? (
                  <button
                    onClick={() => handleContactClient(selectedInquiry)}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    title="Contactar cliente"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Contactar</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      title="Guardar cambios"
                    >
                      <Save className="w-4 h-4" />
                      <span className="hidden sm:inline">Guardar</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      title="Cancelar edición"
                    >
                      <X className="w-4 h-4" />
                      <span className="hidden sm:inline">Cancelar</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Cerrar"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Información del cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.client_name || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, client_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedInquiry.client_name}
                    </p>
                  )}
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
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.client_email || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, client_email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedInquiry.client_email}
                      </p>
                    )}
                  </div>
                )}
                {selectedInquiry.client_phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Teléfono
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.client_phone || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, client_phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedInquiry.client_phone}
                      </p>
                    )}
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
                  {isEditing ? (
                    <select
                      value={editForm.status || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as ServiceInquiry['status'] }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="contacted">Contactado</option>
                      <option value="in_progress">En Progreso</option>
                      <option value="completed">Completado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedInquiry.status)}
                      <span className={`font-medium ${getStatusColor(selectedInquiry.status)}`}>
                        {selectedInquiry.status === 'pending' && 'Pendiente'}
                        {selectedInquiry.status === 'contacted' && 'Contactado'}
                        {selectedInquiry.status === 'in_progress' && 'En Progreso'}
                        {selectedInquiry.status === 'completed' && 'Completado'}
                        {selectedInquiry.status === 'cancelled' && 'Cancelado'}
                      </span>
                      <button
                        onClick={() => {
                          const newStatus = prompt('Nuevo estado (pending, contacted, in_progress, completed, cancelled):', selectedInquiry.status);
                          if (newStatus && selectedInquiry.id) {
                            handleStatusChange(selectedInquiry.id, newStatus);
                          }
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      >
                        Cambiar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Presupuesto */}
              {selectedInquiry.budget && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Presupuesto
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.budget || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, budget: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Ej: $5,000,000 - $10,000,000"
                    />
                  ) : (
                    <p className="text-green-600 dark:text-green-400 font-medium text-lg">
                      {selectedInquiry.budget}
                    </p>
                  )}
                </div>
              )}

              {/* Detalles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Detalles de la consulta
                </label>
                {isEditing ? (
                  <textarea
                    value={editForm.details || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, details: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {selectedInquiry.details}
                  </p>
                )}
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

              {/* Acciones Rápidas - Respuesta del Cliente */}
              {!isEditing && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    📝 Acciones Rápidas - Actualizar según respuesta del cliente:
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button
                      onClick={() => handleClientResponse(selectedInquiry, 'interested')}
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                      title="Cliente interesado - Mover a En Progreso"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Interesado</span>
                    </button>
                    <button
                      onClick={() => handleClientResponse(selectedInquiry, 'scheduled')}
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                      title="Reunión agendada - Mover a En Progreso"
                    >
                      <Clock className="w-3 h-3" />
                      <span>Agendado</span>
                    </button>
                    <button
                      onClick={() => handleClientResponse(selectedInquiry, 'needs_more_info')}
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded-lg transition-colors"
                      title="Necesita más info - Mantener como Contactado"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Más Info</span>
                    </button>
                    <button
                      onClick={() => handleClientResponse(selectedInquiry, 'not_interested')}
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                      title="No interesado - Cancelar consulta"
                    >
                      <XCircle className="w-3 h-3" />
                      <span>No Interesado</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    💡 Usa estos botones para actualizar rápidamente el estado según la respuesta del cliente
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default AdminInquiries;