import { z } from 'zod';

export const clientSchema = z.object({
  // Información Básica
  full_name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  document_type: z.enum(['cedula', 'pasaporte', 'nit', 'cedula_extranjeria']),
  document_number: z.string().min(5, 'El número de documento es requerido'),
  phone: z.string().min(7, 'El teléfono es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  client_type: z.enum(['owner', 'renter', 'buyer', 'seller', 'interested']),
  status: z.enum(['active', 'inactive', 'suspended', 'pending', 'blocked']),
  notes: z.string().optional(),

  // Información Financiera
  monthly_income: z.number().min(0).optional(),
  occupation: z.string().optional(),
  company_name: z.string().optional(),

  // Credenciales del Portal
  portal_email: z.string().email('Email del portal inválido').optional().or(z.literal('')),
  portal_password: z.string().optional(),
  portal_access_enabled: z.boolean().default(true),
  must_change_password: z.boolean().default(false),

  // Configuración de Pagos
  preferred_payment_method: z.string().optional(),
  billing_day: z.number().min(1).max(31).default(1),
  
  // Conceptos de Pago
  arriendo_enabled: z.boolean().default(false),
  arriendo_amount: z.number().min(0).default(0),
  
  admin_enabled: z.boolean().default(false),
  admin_amount: z.number().min(0).default(0),
  
  servicios_enabled: z.boolean().default(false),
  servicios_amount: z.number().min(0).default(0),
  servicios_types: z.array(z.string()).default([]),
  
  otros_enabled: z.boolean().default(false),
  otros_amount: z.number().min(0).default(0),
  otros_description: z.string().optional(),

  // Información del Contrato (Opcional, para cuando se crea/edita)
  contract_type: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  contract_value: z.number().min(0).optional(),
  deposit_amount: z.number().min(0).optional(),
  deposit_paid: z.boolean().default(false),

  // Información del Fiador
  guarantor_name: z.string().optional(),
  guarantor_phone: z.string().optional(),
  guarantor_document: z.string().optional(),

  // Propiedades Asignadas
  assigned_property_ids: z.array(z.string()).default([]),
});

export type ClientFormData = z.infer<typeof clientSchema>;
