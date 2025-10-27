import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Google Calendar configuration
export const GOOGLE_CALENDAR_CONFIG = {
  clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_CALENDAR_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob',
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ]
};

// OAuth2 client setup
export const createOAuth2Client = (tokens?: any) => {
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CALENDAR_CONFIG.clientId,
    GOOGLE_CALENDAR_CONFIG.clientSecret,
    GOOGLE_CALENDAR_CONFIG.redirectUri
  );

  if (tokens) {
    oauth2Client.setCredentials(tokens);
  }

  return oauth2Client;
};

// Calendar API client
export const createCalendarClient = (tokens?: any) => {
  const auth = createOAuth2Client(tokens);
  return google.calendar({ version: 'v3', auth });
};

// Token management
export const saveGoogleTokens = async (userId: string, tokens: any) => {
  const { error } = await supabase
    .from('calendar_settings')
    .upsert({
      user_id: userId,
      google_tokens: tokens,
      google_calendar_enabled: true,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
};

export const getGoogleTokens = async (userId: string) => {
  const { data, error } = await supabase
    .from('calendar_settings')
    .select('google_tokens')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data?.google_tokens;
};

export const revokeGoogleAccess = async (userId: string) => {
  const { error } = await supabase
    .from('calendar_settings')
    .update({
      google_tokens: null,
      google_calendar_enabled: false,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (error) throw error;
};