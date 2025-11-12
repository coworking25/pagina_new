/**
 * ============================================
 * PAYMENT CALCULATIONS - Sistema de Pagos
 * ============================================
 * Funciones para calcular desgloses de pagos basados en
 * la configuración de administración y comisiones
 */

// ============================================
// INTERFACES Y TIPOS
// ============================================

export interface Contract {
  id: string;
  monthly_rent: number;
  administration_fee: number;
  admin_included_in_rent: boolean;
  admin_paid_by: 'tenant' | 'landlord' | 'split';
  admin_payment_method: 'direct' | 'deducted';
  admin_landlord_percentage: number;
  agency_commission_percentage: number;
  agency_commission_fixed: number;
}

export interface PaymentBreakdown {
  // Monto total que paga el inquilino
  gross_amount: number;
  
  // Descuentos aplicados
  admin_deduction: number;      // Administración descontada del arriendo
  agency_commission: number;    // Comisión de la agencia
  
  // Monto neto que recibe el propietario
  net_amount: number;
  
  // Desglose de administración
  admin_tenant_pays: number;    // Parte que paga el inquilino
  admin_landlord_pays: number;  // Parte que paga el propietario
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

/**
 * Calcula el desglose completo de un pago basado en la configuración del contrato
 * 
 * @param contract - Contrato con configuración de pagos
 * @param grossAmount - Monto bruto recibido del inquilino (opcional, se calcula automáticamente)
 * @returns PaymentBreakdown con todos los desgloses calculados
 * 
 * @example
 * ```typescript
 * const breakdown = calculatePaymentBreakdown({
 *   monthly_rent: 1000000,
 *   administration_fee: 150000,
 *   admin_included_in_rent: true,
 *   admin_paid_by: 'landlord',
 *   admin_payment_method: 'deducted',
 *   admin_landlord_percentage: 0,
 *   agency_commission_percentage: 10,
 *   agency_commission_fixed: 0
 * });
 * 
 * // Resultado:
 * // gross_amount: 1000000
 * // admin_deduction: 150000
 * // agency_commission: 100000
 * // net_amount: 750000
 * ```
 */
export function calculatePaymentBreakdown(
  contract: Contract,
  grossAmount?: number
): PaymentBreakdown {
  let gross = grossAmount || contract.monthly_rent;
  let admin_deduction = 0;
  let agency_commission = 0;
  let admin_tenant_pays = 0;
  let admin_landlord_pays = 0;

  // ============================================
  // 1. CALCULAR ADMINISTRACIÓN
  // ============================================

  if (contract.admin_paid_by === 'tenant') {
    // El inquilino paga la administración
    admin_tenant_pays = contract.administration_fee;
    
    if (!contract.admin_included_in_rent) {
      // Se cobra por separado, sumar al gross
      gross = contract.monthly_rent + contract.administration_fee;
    }
    // Si está incluida, no se descuenta al propietario
    
  } else if (contract.admin_paid_by === 'landlord') {
    // El propietario paga, se descuenta del arriendo
    admin_deduction = contract.administration_fee;
    admin_landlord_pays = contract.administration_fee;
    
  } else if (contract.admin_paid_by === 'split') {
    // División porcentual entre inquilino y propietario
    admin_landlord_pays = (contract.administration_fee * contract.admin_landlord_percentage) / 100;
    admin_tenant_pays = contract.administration_fee - admin_landlord_pays;
    
    if (!contract.admin_included_in_rent) {
      // La parte del inquilino se cobra por separado
      gross = contract.monthly_rent + admin_tenant_pays;
    }
    
    // La parte del propietario se descuenta
    admin_deduction = admin_landlord_pays;
  }

  // ============================================
  // 2. CALCULAR COMISIÓN DE LA AGENCIA
  // ============================================

  if (contract.agency_commission_percentage > 0) {
    agency_commission = (contract.monthly_rent * contract.agency_commission_percentage) / 100;
  } else if (contract.agency_commission_fixed > 0) {
    agency_commission = contract.agency_commission_fixed;
  }

  // ============================================
  // 3. CALCULAR MONTO NETO PARA EL PROPIETARIO
  // ============================================

  const net_amount = contract.monthly_rent - admin_deduction - agency_commission;

  return {
    gross_amount: gross,
    admin_deduction,
    agency_commission,
    net_amount,
    admin_tenant_pays,
    admin_landlord_pays
  };
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Formatea un monto en pesos colombianos
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
}

/**
 * Genera un resumen legible del desglose de pago
 */
export function getPaymentBreakdownSummary(breakdown: PaymentBreakdown): string {
  const parts: string[] = [];
  
  parts.push(`Monto bruto: ${formatCurrency(breakdown.gross_amount)}`);
  
  if (breakdown.admin_deduction > 0) {
    parts.push(`(-) Administración: ${formatCurrency(breakdown.admin_deduction)}`);
  }
  
  if (breakdown.agency_commission > 0) {
    parts.push(`(-) Comisión agencia: ${formatCurrency(breakdown.agency_commission)}`);
  }
  
  parts.push(`= Neto propietario: ${formatCurrency(breakdown.net_amount)}`);
  
  return parts.join('\n');
}

/**
 * Valida que los valores del contrato sean correctos
 */
export function validateContractPaymentConfig(contract: Partial<Contract>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validar monthly_rent
  if (!contract.monthly_rent || contract.monthly_rent <= 0) {
    errors.push('El valor del arriendo mensual debe ser mayor a 0');
  }

  // Validar administration_fee
  if (contract.administration_fee && contract.administration_fee < 0) {
    errors.push('El valor de la administración no puede ser negativo');
  }

  // Validar admin_paid_by
  if (contract.admin_paid_by && !['tenant', 'landlord', 'split'].includes(contract.admin_paid_by)) {
    errors.push('El tipo de pago de administración no es válido');
  }

  // Validar admin_landlord_percentage si es split
  if (contract.admin_paid_by === 'split') {
    if (!contract.admin_landlord_percentage || 
        contract.admin_landlord_percentage < 0 || 
        contract.admin_landlord_percentage > 100) {
      errors.push('El porcentaje del propietario debe estar entre 0 y 100');
    }
  }

  // Validar comisiones
  if (contract.agency_commission_percentage && 
      (contract.agency_commission_percentage < 0 || contract.agency_commission_percentage > 100)) {
    errors.push('El porcentaje de comisión debe estar entre 0 y 100');
  }

  if (contract.agency_commission_fixed && contract.agency_commission_fixed < 0) {
    errors.push('La comisión fija no puede ser negativa');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calcula cuánto debe pagar el inquilino en total
 */
export function calculateTenantPayment(contract: Contract): number {
  const breakdown = calculatePaymentBreakdown(contract);
  return breakdown.gross_amount;
}

/**
 * Calcula cuánto recibirá el propietario
 */
export function calculateLandlordPayment(contract: Contract): number {
  const breakdown = calculatePaymentBreakdown(contract);
  return breakdown.net_amount;
}

/**
 * Genera ejemplo de cálculo para mostrar al usuario
 */
export function generateCalculationExample(contract: Contract): {
  scenario: string;
  steps: Array<{ description: string; amount: number }>;
  total: number;
} {
  const breakdown = calculatePaymentBreakdown(contract);
  const steps: Array<{ description: string; amount: number }> = [];

  // Escenario
  let scenario = '';
  if (contract.admin_paid_by === 'tenant') {
    scenario = contract.admin_included_in_rent
      ? 'Inquilino paga arriendo (incluye administración)'
      : 'Inquilino paga arriendo + administración por separado';
  } else if (contract.admin_paid_by === 'landlord') {
    scenario = 'Propietario paga administración (se descuenta del arriendo)';
  } else {
    scenario = `Administración compartida (${contract.admin_landlord_percentage}% propietario, ${100 - contract.admin_landlord_percentage}% inquilino)`;
  }

  // Pasos del cálculo
  steps.push({
    description: 'Arriendo mensual',
    amount: contract.monthly_rent
  });

  if (breakdown.admin_tenant_pays > 0 && !contract.admin_included_in_rent) {
    steps.push({
      description: 'Administración (inquilino)',
      amount: breakdown.admin_tenant_pays
    });
  }

  if (breakdown.admin_deduction > 0) {
    steps.push({
      description: 'Administración (descontada)',
      amount: -breakdown.admin_deduction
    });
  }

  if (breakdown.agency_commission > 0) {
    steps.push({
      description: 'Comisión agencia',
      amount: -breakdown.agency_commission
    });
  }

  return {
    scenario,
    steps,
    total: breakdown.net_amount
  };
}

// ============================================
// EXPORTAR TODO
// ============================================

export default {
  calculatePaymentBreakdown,
  formatCurrency,
  getPaymentBreakdownSummary,
  validateContractPaymentConfig,
  calculateTenantPayment,
  calculateLandlordPayment,
  generateCalculationExample
};
