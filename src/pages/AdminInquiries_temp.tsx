import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Search,
  User,
  Mail,
  Phone,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  Star,
  X,
  Filter
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ServiceInquiry {
  id: number;
  client_name: string;
  client_email: string;
  client_phone?: string;
  service_type: string;
  urgency: 'low' | 'medium' | 'high';
  budget?: string;
  details: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  preferred_contact_method?: string;
  follow_up_date?: string;
  notes?: string;
}

function AdminInquiries() {
  const [inquiries, setInquiries] = useState<ServiceInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<ServiceInquiry | null>(null);
  const [editForm, setEditForm] = useState<Partial<ServiceInquiry>>({});

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_inquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching inquiries:', error);
        return;
      }
      setInquiries(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openViewModal = (inquiry: ServiceInquiry) => {
    setSelectedInquiry(inquiry);
    setShowViewModal(true);
  };

  const openEditModal = (inquiry: ServiceInquiry) => {
    setSelectedInquiry(inquiry);
    setEditForm(inquiry);
    setShowEditModal(true);
  };

  const openDeleteModal = (inquiry: ServiceInquiry) => {
    setSelectedInquiry(inquiry);
    setShowDeleteModal(true);
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const { error } = await supabase
        .from('service_inquiries')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
      if (error) {
        console.error('Error updating status:', error);
        return;
      }
      await fetchInquiries();
      setShowViewModal(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedInquiry || !editForm) return;
    try {
      const { error } = await supabase
        .from('service_inquiries')
        .update({
          ...editForm,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedInquiry.id);
      if (error) {
        console.error('Error updating inquiry:', error);
        return;
      }
      await fetchInquiries();
      setShowEditModal(false);
      setEditForm({});
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedInquiry) return;
    try {
      const { error } = await supabase
        .from('service_inquiries')
        .delete()
        .eq('id', selectedInquiry.id);
      if (error) {
        console.error('Error deleting inquiry:', error);
        return;
      }
      await fetchInquiries();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <Star className="w-4 h-4" />;
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

  const formatStatus = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatUrgency = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return urgency;
    }
  };

  return (
    <div className="space-y-6">
      {/* ...existing code... */}
    </div>
  );
}

export default AdminInquiries;
