// =====================================================
// FORMULARIO DE PAGO PROGRAMADO
// Modal para crear/editar pagos programados
// =====================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, DollarSign, FileText, AlertCircle, RefreshCw } from 'lucide-react';

interface PaymentScheduleFormProps {
  schedule?: any | null;
  clientId: string;
  properties?: any[];
  onSave: (data: any) => void;
  onClose: () => void;
}

interface FormData {
  property_id: number | null;
  payment_concept: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  paid_amount: number;
  payment_method: string;
  payment_reference: string;
  description: string;
  notes: string;
  is_recurring: boolean;
  recurring_frequency: 'monthly' | 'quarterly' | 'yearly' | null;
  recurring_count: number;
}

const PaymentScheduleForm: React.FC<PaymentScheduleFormProps> = ({
  schedule,
  clientId,
  properties = [],
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<FormData>({
    property_id: null,
    payment_concept: '',
    amount: 0,
    due_date: new Date().toISOString().split('T')[0],
    status: 'pending',
    paid_amount: 0,
    payment_method: '',
    payment_reference: '',
    description: '',
    notes: '',
    is_recurring: false,
    recurring_frequency: null,
    recurring_count: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (schedule) {
      setFormData({
        property_id: schedule.property_id || null,
        payment_concept: schedule.payment_concept || '',
        amount: schedule.amount || 0,
        due_date: schedule.due_date ? schedule.due_date.split('T')[0] : new Date().toISOString().split('T')[0],
        status: schedule.status || 'pending',
        paid_amount: schedule.paid_amount || 0,
        payment_method: schedule.payment_method || '',
        payment_reference: schedule.payment_reference || '',
        description: schedule.description || '',
        notes: schedule.notes || '',
        is_recurring: schedule.is_recurring || false,
        recurring_frequency: schedule.recurring_frequency || null,
        recurring_count: 1
      });
    }
  }, [schedule]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'amount' || name === 'paid_amount' || name === 'recurring_count') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'property_id') {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.payment_concept.trim()) {
      newErrors.payment_concept = 'El concepto de pago es requerido';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (!formData.due_date) {
      newErrors.due_date = 'La fecha de vencimiento es requerida';
    }

    if (formData.status === 'partial' && formData.paid_amount >= formData.amount) {
      newErrors.paid_amount = 'El monto pagado debe ser menor al monto total para estado "Parcial"';
    }

    if (formData.is_recurring && !formData.recurring_frequency) {
      newErrors.recurring_frequency = 'Debe seleccionar la frecuencia de recurrencia';
    }

    if (formData.is_recurring && formData.recurring_count < 1) {
      newErrors.recurring_count = 'Debe generar al menos 1 pago';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      // Preparar datos para enviar
      const dataToSave: any = {
        property_id: formData.property_id,
        payment_concept: formData.payment_concept,
        amount: formData.amount,
        due_date: formData.due_date,
        status: formData.status,
        description: formData.description || null,
        notes: formData.notes || null,
        is_recurring: formData.is_recurring,
        recurring_frequency: formData.is_recurring ? formData.recurring_frequency : null
      };

      // Solo incluir estos campos si hay valores
      if (formData.paid_amount > 0) {
        dataToSave.paid_amount = formData.paid_amount;
      }

      if (formData.payment_method) {
        dataToSave.payment_method = formData.payment_method;
      }

      if (formData.payment_reference) {
        dataToSave.payment_reference = formData.payment_reference;
      }

      await onSave(dataToSave);
    } catch (error) {
      console.error('Error guardando pago:', error);
      alert('Error al guardar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {schedule ? 'Editar Pago Programado' : 'Nuevo Pago Programado'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Información del Pago
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Concepto de Pago <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="payment_concept"
                    value={formData.payment_concept}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                      errors.payment_concept ? 'border-red-500' : ''
                    }`}
                    placeholder="Ej: Renta Enero 2025, Servicios, Mantenimiento..."
                  />
                  {errors.payment_concept && (
                    <p className="mt-1 text-sm text-red-500">{errors.payment_concept}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monto <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                        errors.amount ? 'border-red-500' : ''
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de Vencimiento <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      name="due_date"
                      value={formData.due_date}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                        errors.due_date ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.due_date && (
                    <p className="mt-1 text-sm text-red-500">{errors.due_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="paid">Pagado</option>
                    <option value="partial">Parcial</option>
                    <option value="overdue">Vencido</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Propiedad Asociada
                  </label>
                  <select
                    name="property_id"
                    value={formData.property_id || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Ninguna</option>
                    {properties.map((prop) => (
                      <option key={prop.id} value={prop.id}>
                        {prop.code} - {prop.title}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.status === 'partial' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Monto Pagado
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        name="paid_amount"
                        value={formData.paid_amount}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        max={formData.amount}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                          errors.paid_amount ? 'border-red-500' : ''
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.paid_amount && (
                      <p className="mt-1 text-sm text-red-500">{errors.paid_amount}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Detalles del Pago */}
            <div className="space-y-4 pt-4 border-t dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detalles del Pago
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Método de Pago
                  </label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="cheque">Cheque</option>
                    <option value="pse">PSE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Referencia de Pago
                  </label>
                  <input
                    type="text"
                    name="payment_reference"
                    value={formData.payment_reference}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Ej: REF123456"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Descripción detallada del pago..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notas Internas
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Notas privadas (no visibles para el cliente)..."
                  />
                </div>
              </div>
            </div>

            {/* Pagos Recurrentes */}
            {!schedule && (
              <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_recurring"
                    name="is_recurring"
                    checked={formData.is_recurring}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_recurring" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Pago Recurrente
                  </label>
                </div>

                {formData.is_recurring && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Frecuencia <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="recurring_frequency"
                        value={formData.recurring_frequency || ''}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                          errors.recurring_frequency ? 'border-red-500' : ''
                        }`}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="monthly">Mensual</option>
                        <option value="quarterly">Trimestral</option>
                        <option value="yearly">Anual</option>
                      </select>
                      {errors.recurring_frequency && (
                        <p className="mt-1 text-sm text-red-500">{errors.recurring_frequency}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cantidad de Pagos
                      </label>
                      <input
                        type="number"
                        name="recurring_count"
                        value={formData.recurring_count}
                        onChange={handleChange}
                        min="1"
                        max="24"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                          errors.recurring_count ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.recurring_count && (
                        <p className="mt-1 text-sm text-red-500">{errors.recurring_count}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Se generarán {formData.recurring_count} pago(s) automáticamente
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 flex gap-3 justify-end border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Guardando...' : schedule ? 'Actualizar' : 'Crear Pago'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PaymentScheduleForm;
