// Función temporal para eliminar usando service key si el anon key falla
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SENDGRID_API_KEY; // Service key

// Cliente con anon key (normal)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente con service key (admin)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function deleteAppointmentRobust(appointmentId: string): Promise<void> {
  try {
    console.log('🗑️ Intentando eliminar cita con anon key...');
    
    // Primero intentar con anon key
    const { error: anonError } = await supabase
      .from('property_appointments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', appointmentId);

    if (!anonError) {
      console.log('✅ Cita eliminada exitosamente con anon key');
      return;
    }

    console.log('⚠️ Anon key falló, intentando con service key...');
    console.log('Error anon:', anonError.message);

    // Si falla, usar service key
    const { error: serviceError } = await supabaseAdmin
      .from('property_appointments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', appointmentId);

    if (serviceError) {
      console.error('❌ Error con service key también:', serviceError);
      throw serviceError;
    }

    console.log('✅ Cita eliminada exitosamente con service key');
    
  } catch (error) {
    console.error('❌ Error en deleteAppointmentRobust:', error);
    throw error;
  }
}