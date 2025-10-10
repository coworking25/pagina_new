// =====================================================
// FUNCIONES DE ANALYTICS Y REPORTES
// Interacciones con Supabase para sistema de reportes
// =====================================================

import { supabase } from './supabase';
import {
  PropertyStats,
  TopProperty,
  DashboardAnalytics,
  AnalyticsFilters,
  ChartData,
  RecentActivity
} from '../types/analytics';

// =====================================================
// UTILIDADES
// =====================================================

/**
 * Obtener o crear session ID para usuario anónimo
 */
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem('analytics_session_id');
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('analytics_session_id', sessionId);
  }
  
  return sessionId;
};

/**
 * Detectar tipo de dispositivo
 */
export const getDeviceType = (): 'mobile' | 'desktop' | 'tablet' => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

/**
 * Obtener referrer limpio
 */
export const getReferrer = (): string => {
  const referrer = document.referrer;
  if (!referrer) return 'direct';
  
  try {
    const url = new URL(referrer);
    return url.hostname;
  } catch {
    return 'unknown';
  }
};

// =====================================================
// PROPERTY LIKES (Me gusta)
// =====================================================

/**
 * Dar like a una propiedad
 */
export const likeProperty = async (propertyId: string): Promise<boolean> => {
  try {
    const sessionId = getSessionId();
    
    const { error } = await supabase
      .from('property_likes')
      .insert({
        property_id: parseInt(propertyId), // Convertir a número
        session_id: sessionId,
        created_at: new Date().toISOString()
      });

    if (error) {
      // Si es error de duplicado, es porque ya dio like
      if (error.code === '23505') {
        console.log('✅ Usuario ya dio like a esta propiedad');
        return false;
      }
      console.error('❌ Error al dar like:', error);
      throw error;
    }

    console.log('✅ Like registrado exitosamente:', propertyId);
    return true;
  } catch (error) {
    console.error('❌ Error al dar like:', error);
    return false;
  }
};

/**
 * Quitar like de una propiedad
 */
export const unlikeProperty = async (propertyId: string): Promise<boolean> => {
  try {
    const sessionId = getSessionId();
    
    const { error } = await supabase
      .from('property_likes')
      .delete()
      .eq('property_id', parseInt(propertyId)) // Convertir a número
      .eq('session_id', sessionId);

    if (error) {
      console.error('❌ Error al quitar like:', error);
      throw error;
    }

    console.log('✅ Like eliminado exitosamente:', propertyId);
    return true;
  } catch (error) {
    console.error('❌ Error al quitar like:', error);
    return false;
  }
};

/**
 * Verificar si el usuario dio like a una propiedad
 */
export const hasLikedProperty = async (propertyId: string): Promise<boolean> => {
  try {
    const sessionId = getSessionId();
    
    const { data, error } = await supabase
      .from('property_likes')
      .select('id', { count: 'exact' })
      .eq('property_id', parseInt(propertyId)) // Convertir a número
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error) {
      console.error('❌ Error al verificar like:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('❌ Error al verificar like:', error);
    return false;
  }
};

/**
 * Obtener todos los likes del usuario actual
 */
export const getUserLikes = async (): Promise<string[]> => {
  try {
    const sessionId = getSessionId();
    
    const { data, error } = await supabase
      .from('property_likes')
      .select('property_id')
      .eq('session_id', sessionId);

    if (error) throw error;

    return data?.map(like => String(like.property_id)) || []; // Convertir a string
  } catch (error) {
    console.error('❌ Error al obtener likes del usuario:', error);
    return [];
  }
};

/**
 * Obtener conteo de likes de una propiedad
 */
export const getPropertyLikesCount = async (propertyId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('property_likes')
      .select('*', { count: 'exact', head: true })
      .eq('property_id', parseInt(propertyId)); // Convertir a número

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('❌ Error al obtener conteo de likes:', error);
    return 0;
  }
};

// =====================================================
// PROPERTY VIEWS (Vistas)
// =====================================================

/**
 * Registrar vista de propiedad
 */
export const trackPropertyView = async (
  propertyId: string,
  viewDuration?: number
): Promise<void> => {
  try {
    const sessionId = getSessionId();
    
    console.log('📊 Registrando vista de propiedad:', {
      propertyId,
      sessionId,
      viewDuration,
      deviceType: getDeviceType()
    });
    
    const { data, error } = await supabase.from('property_views').insert({
      property_id: parseInt(propertyId), // Convertir a número
      session_id: sessionId,
      view_duration: viewDuration,
      referrer: getReferrer(),
      device_type: getDeviceType(),
      created_at: new Date().toISOString()
    }).select();

    if (error) {
      console.error('❌ Error al registrar vista:', error);
      throw error;
    }

    console.log('✅ Vista de propiedad registrada exitosamente:', data);
  } catch (error) {
    console.error('❌ Error al registrar vista:', error);
  }
};

// =====================================================
// PROPERTY CONTACTS (Contactos)
// =====================================================

/**
 * Registrar contacto por propiedad
 */
export const trackPropertyContact = async (
  propertyId: string,
  contactType: 'whatsapp' | 'email' | 'phone' | 'schedule',
  contactData?: {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  }
): Promise<void> => {
  try {
    const sessionId = getSessionId();
    
    console.log('📞 Registrando contacto:', {
      propertyId,
      contactType,
      sessionId,
      contactData
    });
    
    const { data, error } = await supabase.from('property_contacts').insert({
      property_id: parseInt(propertyId), // Convertir a número
      contact_type: contactType,
      session_id: sessionId,
      ...contactData,
      created_at: new Date().toISOString()
    }).select();

    if (error) {
      console.error('❌ Error al registrar contacto:', error);
      throw error;
    }

    console.log('✅ Contacto registrado exitosamente:', data);
  } catch (error) {
    console.error('❌ Error al registrar contacto:', error);
  }
};

// =====================================================
// ANALYTICS PARA DASHBOARD
// =====================================================

/**
 * Obtener estadísticas de una propiedad
 */
export const getPropertyStats = async (propertyId: string): Promise<PropertyStats | null> => {
  try {
    const { data, error } = await supabase
      .from('property_stats')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('❌ Error al obtener stats de propiedad:', error);
    return null;
  }
};

/**
 * Obtener propiedades más populares
 */
export const getTopProperties = async (
  limit: number = 10,
  daysBack: number = 30
): Promise<TopProperty[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_top_properties', {
        limit_count: limit,
        days_back: daysBack
      });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('❌ Error al obtener top propiedades:', error);
    return [];
  }
};

/**
 * Obtener analytics completos para dashboard
 */
export const getDashboardAnalytics = async (
  filters?: AnalyticsFilters
): Promise<DashboardAnalytics | null> => {
  try {
    const daysBack = filters?.startDate 
      ? Math.ceil((Date.now() - new Date(filters.startDate).getTime()) / (1000 * 60 * 60 * 24))
      : 30;

    console.log('📊 Obteniendo analytics del dashboard...');

    // Obtener totales
    const [likesCount, viewsCount, contactsCount, uniqueVisitorsResult] = await Promise.all([
      supabase.from('property_likes').select('*', { count: 'exact', head: true }),
      supabase.from('property_views').select('*', { count: 'exact', head: true }),
      supabase.from('property_contacts').select('*', { count: 'exact', head: true }),
      // Obtener visitantes únicos (sesiones únicas)
      supabase.from('property_views').select('session_id')
    ]);

    // Contar sesiones únicas manualmente
    const uniqueSessions = new Set(
      (uniqueVisitorsResult.data || []).map(v => v.session_id)
    ).size;

    // Logs de debug
    console.log('📈 Total Likes:', likesCount.count);
    console.log('👁️ Total Vistas:', viewsCount.count);
    console.log('📞 Total Contactos:', contactsCount.count);
    console.log('👥 Visitantes Únicos:', uniqueSessions);

    if (likesCount.error) console.error('❌ Error en likes:', likesCount.error);
    if (viewsCount.error) console.error('❌ Error en vistas:', viewsCount.error);
    if (contactsCount.error) console.error('❌ Error en contactos:', contactsCount.error);

    // Obtener propiedades top
    const topProperties = await getTopProperties(10, daysBack);

    // Obtener actividad reciente
    const { data: recentLikes } = await supabase
      .from('property_likes')
      .select(`
        id,
        created_at,
        properties:property_id (
          title,
          code
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // Obtener datos para gráficas (últimos 7 días)
    const chartData = await getChartData(7);

    const analytics = {
      totalProperties: 0, // Se puede obtener de otra consulta
      totalLikes: likesCount.count || 0,
      totalViews: viewsCount.count || 0,
      totalContacts: contactsCount.count || 0,
      uniqueVisitors: uniqueSessions,
      topProperties,
      recentActivity: formatRecentActivity(recentLikes || []),
      chartData
    };

    console.log('✅ Analytics obtenidos:', analytics);
    
    return analytics;
  } catch (error) {
    console.error('❌ Error al obtener analytics de dashboard:', error);
    return null;
  }
};

/**
 * Obtener datos para gráficas
 */
const getChartData = async (days: number = 7): Promise<ChartData[]> => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('daily_analytics')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;

    // Agrupar por fecha
    const grouped: { [key: string]: ChartData } = {};
    
    data?.forEach(item => {
      if (!grouped[item.date]) {
        grouped[item.date] = {
          date: item.date,
          likes: 0,
          views: 0,
          contacts: 0
        };
      }
      
      if (item.type === 'likes') grouped[item.date].likes = item.total_interactions;
      if (item.type === 'views') grouped[item.date].views = item.total_interactions;
      if (item.type === 'contacts') grouped[item.date].contacts = item.total_interactions;
    });

    return Object.values(grouped);
  } catch (error) {
    console.error('❌ Error al obtener datos de gráfica:', error);
    return [];
  }
};

/**
 * Formatear actividad reciente
 */
const formatRecentActivity = (data: any[]): RecentActivity[] => {
  if (!data) return [];
  
  return data.map(item => ({
    id: item.id,
    type: 'like' as const,
    property_title: item.properties?.title || 'Propiedad desconocida',
    property_code: item.properties?.code || '',
    timestamp: item.created_at,
    details: 'Usuario dio like a esta propiedad'
  }));
};

// =====================================================
// EXPORTAR REPORTES
// =====================================================

/**
 * Exportar reporte en formato CSV
 */
export const exportReport = async (
  type: 'likes' | 'views' | 'contacts',
  filters?: AnalyticsFilters
): Promise<string> => {
  try {
    let query = supabase.from(`property_${type}`).select('*');

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    if (filters?.propertyId) {
      query = query.eq('property_id', filters.propertyId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Convertir a CSV
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');

    return `${headers}\n${rows}`;
  } catch (error) {
    console.error('❌ Error al exportar reporte:', error);
    return '';
  }
};
