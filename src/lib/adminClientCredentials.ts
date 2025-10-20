// ============================================
// API PARA ADMINISTRADORES
// Gestión de credenciales de clientes
// ============================================

import { supabase } from './supabase';
import type { ApiResponse } from '../types/clientPortal';

/**
 * Generar contraseña temporal aleatoria
 */
export function generateTemporaryPassword(): string {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Crear credenciales para un cliente (solo administradores)
 */
export async function createClientCredentials(
  clientId: string,
  email: string,
  password?: string
): Promise<ApiResponse<{ email: string; password: string }>> {
  try {
    // Si no se proporciona contraseña, generar una temporal
    const temporaryPassword = password || generateTemporaryPassword();

    // Hashear contraseña con bcrypt
    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(temporaryPassword, salt);

    // Verificar que el cliente existe
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, email')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return {
        success: false,
        error: 'Cliente no encontrado'
      };
    }

    // Verificar si ya tiene credenciales
    const { data: existing } = await supabase
      .from('client_credentials')
      .select('id')
      .eq('client_id', clientId)
      .single();

    if (existing) {
      return {
        success: false,
        error: 'El cliente ya tiene credenciales. Usa la opción "Restablecer Contraseña".'
      };
    }

    // Crear credenciales
    const { error: insertError } = await supabase
      .from('client_credentials')
      .insert({
        client_id: clientId,
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        is_active: true,
        must_change_password: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error creando credenciales:', insertError);
      return {
        success: false,
        error: 'Error al crear credenciales: ' + insertError.message
      };
    }

    return {
      success: true,
      data: {
        email: email.toLowerCase().trim(),
        password: temporaryPassword
      },
      message: 'Credenciales creadas exitosamente'
    };

  } catch (error) {
    console.error('Error en createClientCredentials:', error);
    return {
      success: false,
      error: 'Error al crear credenciales'
    };
  }
}

/**
 * Verificar si un cliente tiene credenciales
 */
export async function hasClientCredentials(clientId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('client_credentials')
      .select('id')
      .eq('client_id', clientId)
      .single();

    return !error && !!data;
  } catch (error) {
    return false;
  }
}

/**
 * Obtener credenciales de un cliente (solo email y estado)
 */
export async function getClientCredentials(clientId: string): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('client_credentials')
      .select('email, is_active, must_change_password, last_login, created_at')
      .eq('client_id', clientId)
      .single();

    if (error) {
      return {
        success: false,
        error: 'No se encontraron credenciales'
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error al obtener credenciales'
    };
  }
}

/**
 * Activar/Desactivar acceso de un cliente
 */
export async function toggleClientAccess(
  clientId: string,
  isActive: boolean
): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('client_credentials')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('client_id', clientId);

    if (error) {
      return {
        success: false,
        error: 'Error al actualizar estado'
      };
    }

    return {
      success: true,
      message: `Acceso ${isActive ? 'activado' : 'desactivado'} exitosamente`
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error al cambiar estado'
    };
  }
}

/**
 * Restablecer contraseña de un cliente (genera nueva temporal)
 */
export async function resetClientPassword(
  clientId: string
): Promise<ApiResponse<{ password: string }>> {
  try {
    const newPassword = generateTemporaryPassword();

    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const { error } = await supabase
      .from('client_credentials')
      .update({
        password_hash: passwordHash,
        must_change_password: true,
        updated_at: new Date().toISOString()
      })
      .eq('client_id', clientId);

    if (error) {
      return {
        success: false,
        error: 'Error al restablecer contraseña'
      };
    }

    return {
      success: true,
      data: { password: newPassword },
      message: 'Contraseña restablecida exitosamente'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error al restablecer contraseña'
    };
  }
}

/**
 * Eliminar credenciales de un cliente
 */
export async function deleteClientCredentials(
  clientId: string
): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('client_credentials')
      .delete()
      .eq('client_id', clientId);

    if (error) {
      return {
        success: false,
        error: 'Error al eliminar credenciales'
      };
    }

    return {
      success: true,
      message: 'Credenciales eliminadas exitosamente'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error al eliminar credenciales'
    };
  }
}
