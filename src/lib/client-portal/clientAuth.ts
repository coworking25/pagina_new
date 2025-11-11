// ============================================
// AUTENTICACIÓN PARA PORTAL DE CLIENTES
// ============================================

import { supabase } from '../supabase';
import bcrypt from 'bcryptjs';
import type {
  ClientLoginRequest,
  ClientLoginResponse,
  ClientSession,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ApiResponse
} from '../../types/clientPortal';

// Clave para almacenar sesión en localStorage
const SESSION_KEY = 'client_portal_session';
const SESSION_EXPIRY_HOURS = 24;

// ============================================
// FUNCIONES DE SESIÓN
// ============================================

/**
 * Guardar sesión en localStorage
 */
function saveSession(session: ClientSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Obtener sesión de localStorage
 */
export function getSession(): ClientSession | null {
  const sessionStr = localStorage.getItem(SESSION_KEY);
  if (!sessionStr) return null;

  try {
    const session = JSON.parse(sessionStr) as ClientSession;
    
    // Verificar si la sesión expiró
    const expiresAt = new Date(session.expires_at);
    if (expiresAt < new Date()) {
      clearSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error parsing session:', error);
    clearSession();
    return null;
  }
}

/**
 * Limpiar sesión
 */
export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Verificar si hay sesión activa
 */
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/**
 * Obtener ID del cliente autenticado
 */
export function getAuthenticatedClientId(): string | null {
  const session = getSession();
  return session?.client_id || null;
}

// ============================================
// AUTENTICACIÓN
// ============================================

/**
 * Login de cliente
 */
export async function clientLogin(
  credentials: ClientLoginRequest
): Promise<ClientLoginResponse> {
  try {
    const { email, password } = credentials;

    // 1. Verificar si existe la credencial
    const { data: credential, error: credError } = await supabase
      .from('client_credentials')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (credError || !credential) {
      return {
        success: false,
        error: 'Email o contraseña incorrectos'
      };
    }

    // 2. Verificar si la cuenta está activa
    if (!credential.is_active) {
      return {
        success: false,
        error: 'Tu cuenta está desactivada. Contacta al administrador.'
      };
    }

    // 3. Verificar si la cuenta está bloqueada
    if (credential.locked_until) {
      const lockedUntil = new Date(credential.locked_until);
      if (lockedUntil > new Date()) {
        return {
          success: false,
          error: `Cuenta bloqueada hasta ${lockedUntil.toLocaleString('es-ES')}. Demasiados intentos fallidos.`
        };
      }
    }

    // 4. Verificar contraseña con bcrypt
    console.log('🔐 Verificando contraseña...');
    console.log('Password ingresado:', password);
    console.log('Hash en BD:', credential.password_hash);
    
    const passwordMatch = await bcrypt.compare(password, credential.password_hash);
    console.log('¿Contraseña coincide?:', passwordMatch);

    if (!passwordMatch) {
      // Incrementar intentos fallidos
      const newAttempts = (credential.failed_login_attempts || 0) + 1;
      const updates: any = {
        failed_login_attempts: newAttempts,
        updated_at: new Date().toISOString()
      };

      // Bloquear cuenta si hay más de 5 intentos
      if (newAttempts >= 5) {
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + 30); // Bloquear por 30 minutos
        updates.locked_until = lockUntil.toISOString();
      }

      await supabase
        .from('client_credentials')
        .update(updates)
        .eq('id', credential.id);

      return {
        success: false,
        error: 'Email o contraseña incorrectos'
      };
    }

    // 5. Obtener datos del cliente
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, full_name, email, phone')
      .eq('id', credential.client_id)
      .single();

    if (clientError || !client) {
      return {
        success: false,
        error: 'Error al obtener información del cliente'
      };
    }

    // 6. Actualizar último login y resetear intentos fallidos
    await supabase
      .from('client_credentials')
      .update({
        last_login: new Date().toISOString(),
        failed_login_attempts: 0,
        locked_until: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', credential.id);

    // 7. Crear sesión
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRY_HOURS);

    const session: ClientSession = {
      client_id: client.id,
      email: credential.email,
      full_name: client.full_name,
      must_change_password: credential.must_change_password,
      token: generateSessionToken(),
      expires_at: expiresAt.toISOString()
    };

    saveSession(session);

    return {
      success: true,
      session,
      must_change_password: credential.must_change_password
    };

  } catch (error) {
    console.error('Error en clientLogin:', error);
    return {
      success: false,
      error: 'Error al iniciar sesión. Intenta nuevamente.'
    };
  }
}

/**
 * Logout de cliente
 */
export async function clientLogout(): Promise<void> {
  clearSession();
}

/**
 * Cambiar contraseña
 */
export async function changePassword(
  request: ChangePasswordRequest
): Promise<ApiResponse<void>> {
  try {
    const { client_id, old_password, new_password } = request;

    // 1. Obtener credencial actual
    const { data: credential, error: credError } = await supabase
      .from('client_credentials')
      .select('*')
      .eq('client_id', client_id)
      .single();

    if (credError || !credential) {
      return {
        success: false,
        error: 'No se encontró la credencial'
      };
    }

    // 2. Verificar contraseña actual
    const passwordMatch = await bcrypt.compare(old_password, credential.password_hash);

    if (!passwordMatch) {
      return {
        success: false,
        error: 'Contraseña actual incorrecta'
      };
    }

    // 3. Validar nueva contraseña
    if (new_password.length < 8) {
      return {
        success: false,
        error: 'La nueva contraseña debe tener al menos 8 caracteres'
      };
    }

    // 4. Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(new_password, salt);

    // 5. Actualizar en BD
    const { error: updateError } = await supabase
      .from('client_credentials')
      .update({
        password_hash: newPasswordHash,
        must_change_password: false,
        last_password_change: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', credential.id);

    if (updateError) {
      return {
        success: false,
        error: 'Error al actualizar la contraseña'
      };
    }

    // 6. Actualizar sesión si es necesario
    const session = getSession();
    if (session && session.client_id === client_id) {
      session.must_change_password = false;
      saveSession(session);
    }

    return {
      success: true,
      message: 'Contraseña cambiada exitosamente'
    };

  } catch (error) {
    console.error('Error en changePassword:', error);
    return {
      success: false,
      error: 'Error al cambiar la contraseña'
    };
  }
}

/**
 * Solicitar reset de contraseña (enviar token por email)
 */
export async function requestPasswordReset(
  request: ResetPasswordRequest
): Promise<ApiResponse<void>> {
  try {
    const { email } = request;

    // 1. Buscar credencial
    const { data: credential, error: credError } = await supabase
      .from('client_credentials')
      .select('id, client_id, email')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (credError || !credential) {
      // Por seguridad, no revelar si el email existe o no
      return {
        success: true,
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
      };
    }

    // 2. Generar token de reset
    const resetToken = generateResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token válido por 1 hora

    // 3. Guardar token en BD
    const { error: updateError } = await supabase
      .from('client_credentials')
      .update({
        reset_token: resetToken,
        reset_token_expires: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', credential.id);

    if (updateError) {
      console.error('Error guardando reset token:', updateError);
    }

    // 4. TODO: Enviar email con el token
    // Aquí deberías integrar con un servicio de email (SendGrid, Resend, etc.)
    console.log('Reset token para', email, ':', resetToken);
    console.log('Link de reset: /portal-cliente/reset-password?token=' + resetToken);

    return {
      success: true,
      message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
    };

  } catch (error) {
    console.error('Error en requestPasswordReset:', error);
    return {
      success: false,
      error: 'Error al solicitar reset de contraseña'
    };
  }
}

/**
 * Restablecer contraseña con token
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<ApiResponse<void>> {
  try {
    // 1. Buscar credencial con el token
    const { data: credential, error: credError } = await supabase
      .from('client_credentials')
      .select('*')
      .eq('reset_token', token)
      .single();

    if (credError || !credential) {
      return {
        success: false,
        error: 'Token inválido o expirado'
      };
    }

    // 2. Verificar que el token no haya expirado
    const expiresAt = new Date(credential.reset_token_expires);
    if (expiresAt < new Date()) {
      return {
        success: false,
        error: 'Token expirado. Solicita un nuevo reset de contraseña.'
      };
    }

    // 3. Validar nueva contraseña
    if (newPassword.length < 8) {
      return {
        success: false,
        error: 'La contraseña debe tener al menos 8 caracteres'
      };
    }

    // 4. Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // 5. Actualizar contraseña y limpiar token
    const { error: updateError } = await supabase
      .from('client_credentials')
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires: null,
        last_password_change: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', credential.id);

    if (updateError) {
      return {
        success: false,
        error: 'Error al restablecer la contraseña'
      };
    }

    return {
      success: true,
      message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.'
    };

  } catch (error) {
    console.error('Error en resetPasswordWithToken:', error);
    return {
      success: false,
      error: 'Error al restablecer la contraseña'
    };
  }
}

/**
 * Verificar si la sesión actual es válida
 */
export async function verifySession(): Promise<boolean> {
  const session = getSession();
  if (!session) return false;

  try {
    // Verificar que el cliente aún existe y está activo
    const { data: credential, error } = await supabase
      .from('client_credentials')
      .select('is_active')
      .eq('client_id', session.client_id)
      .single();

    if (error || !credential || !credential.is_active) {
      clearSession();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error verificando sesión:', error);
    clearSession();
    return false;
  }
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Generar token de sesión aleatorio
 */
function generateSessionToken(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Generar token de reset aleatorio
 */
function generateResetToken(): string {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

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
