import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { clientSchema, type ClientFormData } from '../lib/schemas/clientSchema';
import type { ClientWithDetails } from '../types/clients';
import { supabase } from '../lib/supabase';
import { updateClient } from '../lib/clientsApi';

export function useClientForm(client: ClientWithDetails | null, onSaveSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      full_name: '',
      document_type: 'cedula',
      document_number: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      client_type: 'renter',
      status: 'active',
      notes: '',
      monthly_income: 0,
      occupation: '',
      company_name: '',
      portal_email: '',
      portal_access_enabled: true,
      must_change_password: false,
      preferred_payment_method: '',
      billing_day: 1,
      arriendo_enabled: false,
      arriendo_amount: 0,
      admin_enabled: false,
      admin_amount: 0,
      servicios_enabled: false,
      servicios_amount: 0,
      servicios_types: [],
      otros_enabled: false,
      otros_amount: 0,
      otros_description: '',
    }
  });

  // Cargar datos iniciales
  useEffect(() => {
    if (client) {
      const loadData = async () => {
        try {
          // 1. Datos básicos
          const defaultValues: Partial<ClientFormData> = {
            full_name: client.full_name || '',
            document_type: (client.document_type as any) || 'cedula',
            document_number: client.document_number || '',
            phone: client.phone || '',
            email: client.email || '',
            address: client.address || '',
            city: client.city || '',
            emergency_contact_name: client.emergency_contact_name || '',
            emergency_contact_phone: client.emergency_contact_phone || '',
            client_type: (client.client_type as any) || 'renter',
            status: (client.status as any) || 'active',
            notes: client.notes || '',
            monthly_income: client.monthly_income || 0,
            occupation: client.occupation || '',
            company_name: client.company_name || '',
          };

          // 2. Credenciales
          const { data: creds } = await supabase
            .from('client_portal_credentials')
            .select('*')
            .eq('client_id', client.id)
            .maybeSingle();

          if (creds) {
            defaultValues.portal_email = creds.email || '';
            defaultValues.portal_access_enabled = creds.portal_access_enabled;
            defaultValues.must_change_password = creds.must_change_password;
          }

          // 3. Configuración de Pagos
          const { data: payment } = await supabase
            .from('client_payment_config')
            .select('*')
            .eq('client_id', client.id)
            .maybeSingle();

          if (payment) {
            defaultValues.preferred_payment_method = payment.preferred_payment_method || '';
            defaultValues.billing_day = payment.billing_day || 1;
            
            const concepts = payment.payment_concepts as any || {};
            
            if (concepts.arriendo) {
              defaultValues.arriendo_enabled = concepts.arriendo.enabled;
              defaultValues.arriendo_amount = concepts.arriendo.amount;
            }
            if (concepts.administracion) {
              defaultValues.admin_enabled = concepts.administracion.enabled;
              defaultValues.admin_amount = concepts.administracion.amount;
            }
            if (concepts.servicios_publicos) {
              defaultValues.servicios_enabled = concepts.servicios_publicos.enabled;
              defaultValues.servicios_amount = concepts.servicios_publicos.amount;
              defaultValues.servicios_types = concepts.servicios_publicos.types || [];
            }
            if (concepts.otros) {
              defaultValues.otros_enabled = concepts.otros.enabled;
              defaultValues.otros_amount = concepts.otros.amount;
              defaultValues.otros_description = concepts.otros.description || '';
            }
          }

          // 4. Contrato (si existe)
          const { data: contract } = await supabase
            .from('client_contract_info')
            .select('*')
            .eq('client_id', client.id)
            .maybeSingle();

          if (contract) {
            defaultValues.contract_type = contract.contract_type;
            defaultValues.start_date = contract.start_date;
            defaultValues.end_date = contract.end_date;
            defaultValues.contract_value = contract.contract_value;
            defaultValues.deposit_amount = contract.deposit_amount;
            defaultValues.deposit_paid = contract.deposit_paid;
          }

          form.reset(defaultValues as ClientFormData);
        } catch (error) {
          console.error('Error loading client data:', error);
          setGeneralError('Error al cargar los datos del cliente');
        }
      };

      loadData();
    }
  }, [client, form]);

  const saveClient = async (data: ClientFormData) => {
    if (!client) return;
    setIsLoading(true);
    setGeneralError(null);

    try {
      // 1. Actualizar cliente base
      await updateClient(client.id, {
        full_name: data.full_name,
        document_type: data.document_type,
        document_number: data.document_number,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_phone: data.emergency_contact_phone,
        client_type: data.client_type,
        status: data.status,
        notes: data.notes,
        monthly_income: data.monthly_income,
        occupation: data.occupation,
        company_name: data.company_name,
      });

      // 2. Actualizar credenciales
      const { data: existingCred } = await supabase
        .from('client_portal_credentials')
        .select('id')
        .eq('client_id', client.id)
        .maybeSingle();

      if (existingCred) {
        await supabase
          .from('client_portal_credentials')
          .update({
            email: data.portal_email || data.email, // Fallback al email personal si no hay portal email
            portal_access_enabled: data.portal_access_enabled,
            must_change_password: data.must_change_password
          })
          .eq('client_id', client.id);
      }

      // 3. Actualizar configuración de pagos
      const paymentConcepts = {
        arriendo: {
          enabled: data.arriendo_enabled,
          amount: data.arriendo_amount
        },
        administracion: {
          enabled: data.admin_enabled,
          amount: data.admin_amount
        },
        servicios_publicos: {
          enabled: data.servicios_enabled,
          amount: data.servicios_amount,
          types: data.servicios_types
        },
        otros: {
          enabled: data.otros_enabled,
          amount: data.otros_amount,
          description: data.otros_description
        }
      };

      const { data: existingPayment } = await supabase
        .from('client_payment_config')
        .select('id')
        .eq('client_id', client.id)
        .maybeSingle();

      if (existingPayment) {
        await supabase
          .from('client_payment_config')
          .update({
            preferred_payment_method: data.preferred_payment_method,
            billing_day: data.billing_day,
            payment_concepts: paymentConcepts
          })
          .eq('client_id', client.id);
      } else {
        // Crear si no existe
        await supabase.from('client_payment_config').insert({
          client_id: client.id,
          preferred_payment_method: data.preferred_payment_method,
          billing_day: data.billing_day,
          payment_concepts: paymentConcepts
        });
      }

      // 4. Actualizar contrato
      const { data: existingContract } = await supabase
        .from('client_contract_info')
        .select('id')
        .eq('client_id', client.id)
        .maybeSingle();

      if (existingContract) {
        await supabase
          .from('client_contract_info')
          .update({
            contract_type: data.contract_type,
            start_date: data.start_date,
            end_date: data.end_date,
            contract_value: data.contract_value,
            deposit_amount: data.deposit_amount,
            deposit_paid: data.deposit_paid
          })
          .eq('client_id', client.id);
      }

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      console.error('Error saving client:', error);
      setGeneralError('Error al guardar los cambios. Por favor intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    generalError,
    saveClient: form.handleSubmit(saveClient)
  };
}
