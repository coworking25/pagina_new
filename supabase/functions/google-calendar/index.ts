import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { google } from 'https://esm.sh/googleapis@118.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleCalendarRequest {
  action: string;
  userId: string;
  data?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { action, userId, data }: GoogleCalendarRequest = await req.json();

    // Get Google tokens from database
    const { data: settings, error: settingsError } = await supabaseClient
      .from('calendar_settings')
      .select('google_tokens, google_calendar_id')
      .eq('user_id', userId)
      .single();

    if (settingsError || !settings?.google_tokens) {
      return new Response(
        JSON.stringify({ error: 'Google Calendar not connected' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID'),
      Deno.env.get('GOOGLE_CALENDAR_CLIENT_SECRET'),
      'urn:ietf:wg:oauth:2.0:oob'
    );

    oauth2Client.setCredentials(settings.google_tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const calendarId = settings.google_calendar_id || 'primary';

    let result;

    switch (action) {
      case 'create_event':
        result = await calendar.events.insert({
          calendarId,
          requestBody: data.event,
        });
        break;

      case 'update_event':
        result = await calendar.events.update({
          calendarId,
          eventId: data.eventId,
          requestBody: data.event,
        });
        break;

      case 'delete_event':
        result = await calendar.events.delete({
          calendarId,
          eventId: data.eventId,
        });
        result = { success: true };
        break;

      case 'sync_events':
        const timeMin = data.lastSync || new Date().toISOString();
        result = await calendar.events.list({
          calendarId,
          timeMin,
          singleEvents: true,
          orderBy: 'startTime',
        });
        break;

      case 'get_calendars':
        result = await calendar.calendarList.list();
        break;

      case 'test_connection':
        // Test connection by getting calendar list
        result = await calendar.calendarList.list();
        result = { connected: true, calendars: result.data.items?.length || 0 };
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }

    return new Response(
      JSON.stringify({ success: true, data: result.data }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Google Calendar Edge Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});