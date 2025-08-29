import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LoginRequest {
  email: string;
  password: string;
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

    const body: LoginRequest = await req.json();
    
    // Input validation
    if (!body.email || !body.password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Admin login attempt for:', body.email);

    // Get admin user data (without password hash)
    const { data: adminData, error: adminError } = await supabase
      .rpc('authenticate_admin', { input_email: body.email })
      .single();

    if (adminError || !adminData) {
      console.log('Admin not found or error:', adminError);
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get password hash separately for verification
    const { data: adminUser, error: userError } = await supabase
      .from('admin_users')
      .select('password_hash')
      .eq('email', body.email.toLowerCase().trim())
      .single();

    if (userError || !adminUser) {
      console.log('Error fetching admin user:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(body.password, adminUser.password_hash);
    
    if (!isValidPassword) {
      console.log('Invalid password for admin:', body.email);
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate secure session token
    const sessionToken = crypto.randomUUID() + crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Get client info
    const userAgent = req.headers.get('User-Agent') || 'Unknown';
    const xForwardedFor = req.headers.get('X-Forwarded-For');
    const ipAddress = xForwardedFor?.split(',')[0]?.trim() || 'Unknown';

    // Create session
    const { error: sessionError } = await supabase
      .from('admin_sessions')
      .insert({
        admin_id: adminData.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent
      });

    if (sessionError) {
      console.error('Error creating admin session:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminData.id);

    console.log('Successful admin login for:', body.email);

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: adminData.id,
          email: adminData.email,
          role: adminData.role,
          last_login: new Date().toISOString()
        },
        sessionToken,
        expiresAt: expiresAt.toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Admin login error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});