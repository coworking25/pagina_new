import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, FileText, CreditCard, AlertCircle, CheckCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { Contract } from '../../types/clients';
import { calculatePaymentBreakdown, formatCurrency } from '../../lib/paymentCalculations';
import { supabase } from '../../lib/supabase';

interface RegisterPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
  onPaymentRegistered: () => void;
}

interface PaymentBreakdown {
  gross_amount: number;
  admin_deduction: number;
  agency_commission: number;
  net_amount: number;
  admin_tenant_pays: number;
  admin_landlord_pays: number;
}

export const RegisterPaymentModal: React.FC<RegisterPaymentModalProps> = ({
  isOpen,
  onClose,
  contract,
  onPaymentRegistered
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    gross_amount: contract.monthly_rent || 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer',
    transaction_reference: '',
    period_start: '',
    period_end: '',
    notes: ''
  });

  // Breakdown calculation
  const [breakdown, setBreakdown] = useState<PaymentBreakdown | null>(null);

  // Calculate breakdown when gross_amount changes
  useEffect(() => {
    if (contract && formData.gross_amount > 0) {
      const contractForCalc = {
        id: contract.id,
        monthly_rent: contract.monthly_rent || 0,
        administration_fee: contract.administration_fee || 0,
        admin_included_in_rent: contract.admin_included_in_rent || false,
        admin_paid_by: contract.admin_paid_by || 'landlord',
        admin_payment_method: contract.admin_payment_method || 'deducted',
        admin_landlord_percentage: contract.admin_landlord_percentage || 0,
        agency_commission_percentage: contract.agency_commission_percentage || 0,
        agency_commission_fixed: contract.agency_commission_fixed || 0
      };
      
      const calc = calculatePaymentBreakdown(contractForCalc, formData.gross_amount);
      setBreakdown(calc);
    }
  }, [formData.gross_amount, contract]);

  // Auto-calculate period dates based on payment date
  useEffect(() => {
    if (formData.payment_date) {
      const paymentDate = new Date(formData.payment_date);
      const periodStart = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1);
      const periodEnd = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0);

      setFormData(prev => ({
        ...prev,
        period_start: periodStart.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0]
      }));
    }
  }, [formData.payment_date]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate
      if (!formData.gross_amount || formData.gross_amount <= 0) {
        throw new Error('El monto bruto debe ser mayor a cero');
      }

      if (!formData.payment_date) {
        throw new Error('Debe seleccionar una fecha de pago');
      }

      if (!formData.period_start || !formData.period_end) {
        throw new Error('Debe especificar el período del pago');
      }

      // Call PostgreSQL function to register payment
      const { data, error: dbError } = await supabase.rpc('register_tenant_payment', {
        p_contract_id: contract.id,
        p_gross_amount: formData.gross_amount,
        p_payment_date: formData.payment_date,
        p_payment_method: formData.payment_method,
        p_transaction_reference: formData.transaction_reference || null,
        p_period_start: formData.period_start,
        p_period_end: formData.period_end
      });

      if (dbError) throw dbError;

      console.log('✅ Pago registrado exitosamente:', data);
      setSuccess(true);

      // Wait 1.5 seconds to show success message, then close
      setTimeout(() => {
        onPaymentRegistered();
        onClose();
        resetForm();
      }, 1500);

    } catch (err: any) {
      console.error('❌ Error registrando pago:', err);
      setError(err.message || 'Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      gross_amount: contract.monthly_rent || 0,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'bank_transfer',
      transaction_reference: '',
      period_start: '',
      period_end: '',
      notes: ''
    });
    setBreakdown(null);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <DollarSign className="w-7 h-7 mr-2" />
              Registrar Pago Recibido
            </h2>
            <p className="text-green-100 text-sm mt-1">
              Contrato: {contract.contract_number || 'N/A'}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="m-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-3 flex-shrink-0" />
            <div>
              <p className="text-green-800 dark:text-green-200 font-semibold">
                ✅ Pago registrado exitosamente
              </p>
              <p className="text-green-600 dark:text-green-400 text-sm">
                Se han creado los registros de pago incoming y outgoing automáticamente
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="m-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" />
            <div>
              <p className="text-red-800 dark:text-red-200 font-semibold">Error al registrar pago</p>
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="space-y-6">
              {/* Monto Bruto Recibido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Monto Bruto Recibido del Inquilino *
                </label>
                <input
                  type="number"
                  value={formData.gross_amount}
                  onChange={(e) => handleInputChange('gross_amount', Number(e.target.value))}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-semibold"
                  placeholder="1500000"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Total recibido del inquilino (antes de descuentos)
                </p>
              </div>

              {/* Fecha de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha de Pago *
                </label>
                <input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => handleInputChange('payment_date', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Período */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📅 Período Inicio *
                  </label>
                  <input
                    type="date"
                    value={formData.period_start}
                    onChange={(e) => handleInputChange('period_start', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📅 Período Fin *
                  </label>
                  <input
                    type="date"
                    value={formData.period_end}
                    onChange={(e) => handleInputChange('period_end', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Método de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <CreditCard className="w-4 h-4 inline mr-1" />
                  Método de Pago *
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => handleInputChange('payment_method', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="bank_transfer">🏦 Transferencia Bancaria</option>
                  <option value="cash">💵 Efectivo</option>
                  <option value="check">📝 Cheque</option>
                  <option value="credit_card">💳 Tarjeta de Crédito</option>
                  <option value="debit_card">💳 Tarjeta de Débito</option>
                  <option value="pse">🏦 PSE</option>
                  <option value="nequi">📱 Nequi</option>
                  <option value="daviplata">📱 Daviplata</option>
                  <option value="other">📋 Otro</option>
                </select>
              </div>

              {/* Referencia de Transacción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Referencia de Transacción
                </label>
                <input
                  type="text"
                  value={formData.transaction_reference}
                  onChange={(e) => handleInputChange('transaction_reference', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ej: TRX-123456"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Número de aprobación, código de transacción, etc.
                </p>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📝 Notas Adicionales
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Observaciones sobre el pago..."
                />
              </div>
            </div>

            {/* Right Column - Breakdown Preview */}
            <div className="space-y-6">
              {/* Configuration Info */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                  ⚙️ Configuración del Contrato
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Arriendo mensual:</span>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                      {formatCurrency(contract.monthly_rent || 0)}
                    </span>
                  </div>
                  {contract.administration_fee && (
                    <div className="flex justify-between">
                      <span className="text-blue-700 dark:text-blue-300">Administración:</span>
                      <span className="font-semibold text-blue-900 dark:text-blue-100">
                        {formatCurrency(contract.administration_fee)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Admin pagada por:</span>
                    <span className="font-semibold text-blue-900 dark:text-blue-100 capitalize">
                      {contract.admin_paid_by === 'tenant' ? 'Inquilino' : 
                       contract.admin_paid_by === 'landlord' ? 'Propietario' : 'Compartido'}
                    </span>
                  </div>
                  {contract.agency_commission_percentage && contract.agency_commission_percentage > 0 && (
                    <div className="flex justify-between">
                      <span className="text-blue-700 dark:text-blue-300">Comisión agencia:</span>
                      <span className="font-semibold text-blue-900 dark:text-blue-100">
                        {contract.agency_commission_percentage}%
                      </span>
                    </div>
                  )}
                  {contract.agency_commission_fixed && contract.agency_commission_fixed > 0 && (
                    <div className="flex justify-between">
                      <span className="text-blue-700 dark:text-blue-300">Comisión fija:</span>
                      <span className="font-semibold text-blue-900 dark:text-blue-100">
                        {formatCurrency(contract.agency_commission_fixed)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Breakdown */}
              {breakdown && (
                <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-300 dark:border-green-700 shadow-lg">
                  <h4 className="text-lg font-bold text-green-900 dark:text-green-100 mb-4 flex items-center">
                    📊 Desglose Automático del Pago
                  </h4>

                  <div className="space-y-3">
                    {/* Gross Amount */}
                    <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          Monto bruto recibido
                        </span>
                      </div>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(breakdown.gross_amount)}
                      </span>
                    </div>

                    {/* Administration Deduction */}
                    {breakdown.admin_deduction > 0 && (
                      <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center">
                          <TrendingDown className="w-5 h-5 text-orange-600 mr-2" />
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            Descuento administración
                          </span>
                        </div>
                        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          -{formatCurrency(breakdown.admin_deduction)}
                        </span>
                      </div>
                    )}

                    {/* Agency Commission */}
                    {breakdown.agency_commission > 0 && (
                      <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center">
                          <TrendingDown className="w-5 h-5 text-blue-600 mr-2" />
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            Comisión agencia
                          </span>
                        </div>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          -{formatCurrency(breakdown.agency_commission)}
                        </span>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="border-t-2 border-green-300 dark:border-green-700 my-2"></div>

                    {/* Net Amount */}
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-800/50 dark:to-emerald-800/50 rounded-lg">
                      <span className="text-gray-900 dark:text-white font-bold text-lg">
                        💰 Propietario recibe:
                      </span>
                      <span className="text-2xl font-black text-green-700 dark:text-green-300">
                        {formatCurrency(breakdown.net_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {(breakdown.admin_tenant_pays > 0 || breakdown.admin_landlord_pays > 0) && (
                    <div className="mt-4 pt-4 border-t border-green-300 dark:border-green-700">
                      <p className="text-xs text-green-800 dark:text-green-200 font-semibold mb-2">
                        📋 Detalle de administración:
                      </p>
                      {breakdown.admin_tenant_pays > 0 && (
                        <p className="text-xs text-green-700 dark:text-green-300">
                          • Inquilino paga: {formatCurrency(breakdown.admin_tenant_pays)}
                        </p>
                      )}
                      {breakdown.admin_landlord_pays > 0 && (
                        <p className="text-xs text-green-700 dark:text-green-300">
                          • Propietario paga: {formatCurrency(breakdown.admin_landlord_pays)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Info Box */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-blue-600" />
                  ¿Qué sucede al registrar este pago?
                </h4>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>✅ Se registra el pago <strong>recibido</strong> del inquilino</li>
                  <li>✅ Se crea automáticamente el pago <strong>pendiente</strong> al propietario</li>
                  <li>✅ Se calcula el desglose de administración y comisiones</li>
                  <li>✅ Se genera una <strong>alerta</strong> para pagar al propietario</li>
                  <li>✅ Si aplica, se registra el pago pendiente de administración</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !breakdown}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/30 flex items-center font-semibold"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Registrando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Registrar Pago
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPaymentModal;
