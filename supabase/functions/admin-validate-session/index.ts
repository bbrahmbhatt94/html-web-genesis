import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateSessionRequest {
  sessionToken: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const body: ValidateSessionRequest = await req.json();
    
    if (!body.sessionToken) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Session token required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate session token using the secure function
    const { data: validation, error } = await supabase
      .rpc('validate_admin_session_token', { token: body.sessionToken })
      .single();

    if (error) {
      console.error('Error validating session:', error);
      return new Response(
        JSON.stringify({ valid: false, error: 'Session validation failed' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!validation.valid) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid or expired session' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Update last accessed time
    await supabase
      .from('admin_sessions')
      .update({ last_accessed: new Date().toISOString() })
      .eq('id', validation.session_id);

    return new Response(
      JSON.stringify({
        valid: true,
        user: validation.admin_data
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Session validation error:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});