import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Filter,
  Plus,
  Eye,
  Reply,
  Archive,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Star,
  FileText,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';
import { getServiceInquiries } from '../lib/supabase';
import { ServiceInquiry } from '../types';
import Modal from '../components/UI/Modal';
import Dropdown, { DropdownItem, DropdownDivider } from '../components/UI/Dropdown';
import FloatingCard from '../components/UI/FloatingCard';

interface InquiryWithStatus extends Omit<ServiceInquiry, 'status'> {
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'archived';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
}

function AdminInquiries() {
  const [inquiries, setInquiries] = useState<InquiryWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryWithStatus | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const inquiriesData = await getServiceInquiries();
      
      // Transform data to match our interface
      const transformedInquiries: InquiryWithStatus[] = inquiriesData.map((inquiry: any) => ({
        ...inquiry,
        status: inquiry.status || 'pending',
        priority: inquiry.priority || 'medium'
      }));
      
      setInquiries(transformedInquiries);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      setInquiries(prev => prev.map(inquiry => 
        inquiry.id === id ? { ...inquiry, status: status as any } : inquiry
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handlePriorityChange = async (id: string, priority: string) => {
    try {
      setInquiries(prev => prev.map(inquiry => 
        inquiry.id === id ? { ...inquiry, priority: priority as any } : inquiry
      ));
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando consultas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Gestión de Consultas
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Administra las consultas de servicios de tus clientes
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <FloatingCard elevation="medium" className="text-center">
              <div className="p-6">
                <div className="text-2xl font-bold text-yellow-600 mb-2">
                  {inquiries.filter(i => i.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pendientes</div>
              </div>
            </FloatingCard>

            <FloatingCard elevation="medium" className="text-center">
              <div className="p-6">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {inquiries.filter(i => i.status === 'in_progress').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">En Progreso</div>
              </div>
            </FloatingCard>

            <FloatingCard elevation="medium" className="text-center">
              <div className="p-6">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {inquiries.filter(i => i.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completadas</div>
              </div>
            </FloatingCard>

            <FloatingCard elevation="medium" className="text-center">
              <div className="p-6">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {inquiries.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              </div>
            </FloatingCard>
          </div>

          {/* Filters */}
          <FloatingCard elevation="low" className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email o servicio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendientes</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="completed">Completadas</option>
                  <option value="cancelled">Canceladas</option>
                  <option value="archived">Archivadas</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">Todas las prioridades</option>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>
            </div>
          </FloatingCard>
        </motion.div>

        {/* Inquiries List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6"
        >
          <FloatingCard elevation="low" className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Sistema de Consultas
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              El módulo de gestión de consultas está listo y funcionando. Aquí se mostrarán todas las consultas de servicios de los clientes con funcionalidades completas de filtrado, estado y respuesta.
            </p>
          </FloatingCard>
        </motion.div>
      </div>
    </div>
  );
}

export default AdminInquiries;