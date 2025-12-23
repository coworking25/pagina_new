// ============================================
// SISTEMA DE AUTOMATIZACIÓN
// Ejecuta reglas automáticas para crear alertas y notificaciones
// ============================================

import { supabase } from './supabase';

console.log('🤖 Automation System cargado');

// ============================================
// TIPOS
// ============================================

export interface AutomationRule {
  id: string;
  name: string;
  description: string | null;
  rule_type: 'alert_generation' | 'reminder' | 'workflow' | 'escalation' | 'notification' | 'task_creation';
  trigger_event: string;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  target_user_type: 'client' | 'admin' | 'both' | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_executed_at: string | null;
}

export interface AutomationLog {
  id?: string;
  rule_id: string;
  schedule_id?: string | null;
  execution_status: 'success' | 'error' | 'partial' | 'skipped';
  trigger_data?: Record<string, any>;
  execution_result?: Record<string, any>;
  error_message?: string | null;
  items_processed?: number;
  alerts_created?: number;
  notifications_sent?: number;
  execution_time_ms?: number;
  executed_at?: string;
}

export interface TriggerData {
  [key: string]: any;
}

// ============================================
// OBTENER REGLAS
// ============================================

/**
 * Obtener reglas activas por evento
 */
export async function getActiveRulesByEvent(triggerEvent: string): Promise<AutomationRule[]> {
  try {
    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('trigger_event', triggerEvent)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error obteniendo reglas:', error);
    return [];
  }
}

/**
 * Obtener todas las reglas activas
 */
export async function getAllActiveRules(): Promise<AutomationRule[]> {
  try {
    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error obteniendo todas las reglas:', error);
    return [];
  }
}

// ============================================
// PROCESAMIENTO DE TEMPLATES
// ============================================

/**
 * Reemplaza variables {{variable}} en un string con datos
 */
export function processTemplate(template: string, data: TriggerData): string {
  let result = template;
  
  // Reemplazar todas las variables {{nombre}}
  const matches = template.match(/\{\{([^}]+)\}\}/g);
  
  if (matches) {
    matches.forEach(match => {
      const variableName = match.replace(/\{\{|\}\}/g, '').trim();
      const value = data[variableName];
      
      if (value !== undefined && value !== null) {
        result = result.replace(match, String(value));
      }
    });
  }
  
  return result;
}

/**
 * Procesa un objeto con templates
 */
export function processTemplateObject<T extends Record<string, any>>(
  obj: T,
  data: TriggerData
): T {
  const result: any = {};
  
  for (const key in obj) {
    const value = obj[key];
    
    if (typeof value === 'string') {
      result[key] = processTemplate(value, data);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = processTemplateObject(value, data);
    } else {
      result[key] = value;
    }
  }
  
  return result as T;
}

// ============================================
// EVALUACIÓN DE CONDICIONES
// ============================================

/**
 * Evalúa si las condiciones de una regla se cumplen
 */
export function evaluateConditions(
  conditions: Record<string, any>,
  data: TriggerData
): boolean {
  if (!conditions || Object.keys(conditions).length === 0) {
    return true; // Sin condiciones = siempre se ejecuta
  }

  for (const key in conditions) {
    const conditionValue = conditions[key];
    const dataValue = data[key];

    // Si la condición es un array, verificar si el valor está en el array
    if (Array.isArray(conditionValue)) {
      if (!conditionValue.includes(dataValue)) {
        return false;
      }
    } 
    // Si la condición es un objeto con operadores
    else if (typeof conditionValue === 'object' && conditionValue !== null) {
      // Soportar operadores como: { "$gt": 100, "$lt": 200 }
      // Por ahora, comparación simple
      if (JSON.stringify(conditionValue) !== JSON.stringify(dataValue)) {
        return false;
      }
    }
    // Comparación directa
    else if (conditionValue !== dataValue) {
      return false;
    }
  }

  return true;
}

// ============================================
// EJECUCIÓN DE ACCIONES
// ============================================

/**
 * Ejecuta las acciones de una regla
 */
export async function executeActions(
  actions: Record<string, any>,
  triggerData: TriggerData,
  rule: AutomationRule
): Promise<{
  alertsCreated: number;
  notificationsSent: number;
  errors: string[];
}> {
  let alertsCreated = 0;
  let notificationsSent = 0;
  const errors: string[] = [];

  console.log(`🎯 Ejecutando acciones para regla: ${rule.name}`);

  try {
    // Procesar templates en las acciones
    const processedActions = processTemplateObject(actions, triggerData);

    // ACCIÓN: Crear alerta de cliente
    if (processedActions.create_client_alert && triggerData.client_id) {
      try {
        const alertData = {
          client_id: triggerData.client_id,
          alert_type: processedActions.create_client_alert.alert_type,
          severity: processedActions.create_client_alert.severity,
          title: processedActions.create_client_alert.title,
          message: processedActions.create_client_alert.message,
          action_url: processedActions.create_client_alert.action_url || null,
          is_read: false,
          expires_at: null
        };

        const { error } = await supabase
          .from('client_alerts')
          .insert(alertData);

        if (error) throw error;
        
        alertsCreated++;
        console.log('✅ Alerta de cliente creada');
      } catch (err: any) {
        errors.push(`Error creando alerta de cliente: ${err.message}`);
        console.error('❌ Error creando alerta de cliente:', err);
      }
    }

    // ACCIÓN: Crear alerta de admin
    if (processedActions.create_admin_alert) {
      try {
        // Obtener todos los admins activos
        const { data: admins, error: adminsError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('role', 'admin')
          .eq('is_active', true);

        if (adminsError) throw adminsError;

        if (admins && admins.length > 0) {
          const adminAlerts = admins.map(admin => ({
            user_id: admin.id,
            alert_type: processedActions.create_admin_alert.alert_type,
            severity: processedActions.create_admin_alert.severity,
            title: processedActions.create_admin_alert.title,
            message: processedActions.create_admin_alert.message,
            action_url: processedActions.create_admin_alert.action_url || null,
            related_client_id: triggerData.client_id || null,
            related_appointment_id: triggerData.appointment_id || null,
            related_payment_id: triggerData.payment_id || null,
            is_read: false,
            expires_at: null
          }));

          const { error } = await supabase
            .from('admin_alerts')
            .insert(adminAlerts);

          if (error) throw error;

          alertsCreated += adminAlerts.length;
          console.log(`✅ ${adminAlerts.length} alertas de admin creadas`);
        }
      } catch (err: any) {
        errors.push(`Error creando alertas de admin: ${err.message}`);
        console.error('❌ Error creando alertas de admin:', err);
      }
    }

    // ACCIÓN: Enviar notificación push
    if (processedActions.send_push_notification) {
      // TODO: Integrar con sistema de push notifications
      console.log('📱 Push notification pendiente de enviar');
      notificationsSent++;
    }

    // ACCIÓN: Enviar email
    if (processedActions.send_email) {
      // TODO: Integrar con sistema de email
      console.log('📧 Email pendiente de enviar');
    }

  } catch (err: any) {
    errors.push(`Error ejecutando acciones: ${err.message}`);
    console.error('❌ Error ejecutando acciones:', err);
  }

  return { alertsCreated, notificationsSent, errors };
}

// ============================================
// EJECUTAR REGLA
// ============================================

/**
 * Ejecuta una regla de automatización completa
 */
export async function executeRule(
  rule: AutomationRule,
  triggerData: TriggerData
): Promise<AutomationLog> {
  const startTime = Date.now();
  
  console.log(`🚀 Ejecutando regla: ${rule.name}`);
  console.log('📊 Datos del trigger:', triggerData);

  // Evaluar condiciones
  const conditionsMet = evaluateConditions(rule.conditions, triggerData);
  
  if (!conditionsMet) {
    console.log('⏭️ Condiciones no cumplidas, saltando regla');
    
    const log: AutomationLog = {
      rule_id: rule.id,
      execution_status: 'skipped',
      trigger_data: triggerData,
      execution_result: { reason: 'Conditions not met' },
      items_processed: 0,
      alerts_created: 0,
      notifications_sent: 0,
      execution_time_ms: Date.now() - startTime
    };

    await saveLog(log);
    return log;
  }

  // Ejecutar acciones
  const result = await executeActions(rule.actions, triggerData, rule);

  // Determinar estado
  const status: 'success' | 'error' | 'partial' = 
    result.errors.length === 0 ? 'success' :
    result.alertsCreated > 0 || result.notificationsSent > 0 ? 'partial' : 'error';

  const log: AutomationLog = {
    rule_id: rule.id,
    execution_status: status,
    trigger_data: triggerData,
    execution_result: result,
    error_message: result.errors.length > 0 ? result.errors.join('; ') : null,
    items_processed: 1,
    alerts_created: result.alertsCreated,
    notifications_sent: result.notificationsSent,
    execution_time_ms: Date.now() - startTime
  };

  // Guardar log
  await saveLog(log);

  // Actualizar last_executed_at
  await supabase
    .from('automation_rules')
    .update({ last_executed_at: new Date().toISOString() })
    .eq('id', rule.id);

  console.log(`✅ Regla ejecutada: ${status}`);
  
  return log;
}

/**
 * Guarda un log de ejecución
 */
async function saveLog(log: AutomationLog): Promise<void> {
  try {
    const { error } = await supabase
      .from('automation_logs')
      .insert(log);

    if (error) throw error;
  } catch (error) {
    console.error('❌ Error guardando log:', error);
  }
}

// ============================================
// TRIGGERS POR EVENTO
// ============================================

/**
 * Disparar reglas cuando se crea un pago
 */
export async function triggerPaymentCreated(paymentData: any): Promise<void> {
  console.log('💰 Trigger: Payment Created');
  
  const rules = await getActiveRulesByEvent('payment_created');
  
  for (const rule of rules) {
    await executeRule(rule, {
      payment_id: paymentData.id,
      client_id: paymentData.client_id,
      contract_id: paymentData.contract_id,
      amount: paymentData.amount,
      due_date: paymentData.due_date,
      payment_type: paymentData.payment_type,
      status: paymentData.status
    });
  }
}

/**
 * Disparar reglas cuando se crea una cita
 */
export async function triggerAppointmentCreated(appointmentData: any): Promise<void> {
  console.log('📅 Trigger: Appointment Created');
  
  const rules = await getActiveRulesByEvent('appointment_created');
  
  for (const rule of rules) {
    await executeRule(rule, {
      appointment_id: appointmentData.id,
      client_id: appointmentData.client_id,
      property_id: appointmentData.property_id,
      date: appointmentData.appointment_date,
      time: appointmentData.appointment_time,
      status: appointmentData.status
    });
  }
}

/**
 * Disparar reglas cuando se crea un cliente
 */
export async function triggerClientCreated(clientData: any): Promise<void> {
  console.log('👤 Trigger: Client Created');
  
  const rules = await getActiveRulesByEvent('client_created');
  
  for (const rule of rules) {
    await executeRule(rule, {
      client_id: clientData.id,
      client_name: clientData.full_name,
      client_type: clientData.client_type,
      phone: clientData.phone,
      email: clientData.email,
      status: clientData.status
    });
  }
}

// ============================================
// EXPORTAR
// ============================================

export default {
  getActiveRulesByEvent,
  getAllActiveRules,
  executeRule,
  triggerPaymentCreated,
  triggerAppointmentCreated,
  triggerClientCreated,
  processTemplate,
  evaluateConditions
};
