// =====================================================
// TIPOS PARA SISTEMA DE ANALYTICS Y REPORTES
// =====================================================

export interface PropertyLike {
  id: string;
  property_id: string;
  user_id?: string;
  session_id: string;
  ip_address?: string;
  created_at: string;
}

export interface PropertyView {
  id: string;
  property_id: string;
  user_id?: string;
  session_id: string;
  ip_address?: string;
  view_duration?: number; // segundos
  referrer?: string;
  device_type?: 'mobile' | 'desktop' | 'tablet';
  created_at: string;
}

export interface PropertyContact {
  id: string;
  property_id: string;
  contact_type: 'whatsapp' | 'email' | 'phone' | 'schedule';
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  session_id?: string;
  created_at: string;
}

export interface PageAnalytics {
  id: string;
  page_path: string;
  session_id: string;
  user_id?: string;
  visit_duration?: number;
  device_type?: 'mobile' | 'desktop' | 'tablet';
  referrer?: string;
  ip_address?: string;
  created_at: string;
}

export interface AdvisorInteraction {
  id: string;
  advisor_id: string;
  interaction_type: 'profile_view' | 'whatsapp' | 'email' | 'phone';
  property_id?: string;
  session_id?: string;
  created_at: string;
}

export interface PropertyStats {
  id: string;
  title: string;
  code: string;
  status: string;
  location: string;
  price: number;
  featured: boolean;
  total_likes: number;
  total_views: number;
  total_contacts: number;
  unique_visitors: number;
  popularity_score: number;
}

export interface DailyAnalytics {
  date: string;
  total_interactions: number;
  unique_visitors: number;
  type: 'likes' | 'views' | 'contacts';
}

export interface TopProperty {
  property_id: string;
  title: string;
  code: string;
  total_likes: number;
  total_views: number;
  total_contacts: number;
  popularity_score: number;
}

// Tipos para Dashboard Analytics
export interface DashboardAnalytics {
  totalProperties: number;
  totalLikes: number;
  totalViews: number;
  totalContacts: number;
  uniqueVisitors: number;
  topProperties: TopProperty[];
  recentActivity: RecentActivity[];
  chartData: ChartData[];
}

export interface RecentActivity {
  id: string;
  type: 'like' | 'view' | 'contact';
  property_title: string;
  property_code: string;
  timestamp: string;
  details?: string;
}

export interface ChartData {
  date: string;
  likes: number;
  views: number;
  contacts: number;
}

// Filtros para reportes
export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  propertyId?: string;
  advisorId?: string;
  type?: 'likes' | 'views' | 'contacts' | 'all';
  sector?: string;
  status?: string;
}

// Tipos de reportes disponibles
export type ReportType = 
  | 'most-liked'
  | 'most-viewed'
  | 'most-contacted'
  | 'conversion-rate'
  | 'advisor-performance'
  | 'sector-analysis'
  | 'daily-activity'
  | 'user-engagement';

export interface ReportConfig {
  type: ReportType;
  title: string;
  description: string;
  icon: string;
  filters: AnalyticsFilters;
}
