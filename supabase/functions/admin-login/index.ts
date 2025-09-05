import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

// Get allowed origins from environment or default to localhost for development
const getAllowedOrigins = () => {
  const origins = Deno.env.get('ALLOWED_ORIGINS');
  if (origins) {
    return origins.split(',').map(o => o.trim());
  }
  // Default allowed origins for development
  return [
    'https://ypsufujqhpixachonnnh.lovableproject.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
};

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigins = getAllowedOrigins();
  const isAllowed = origin && allowedOrigins.includes(origin);
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
};

interface LoginRequest {
  email: string;
  password: string;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

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

    // Get client IP for rate limiting
    const xForwardedFor = req.headers.get('X-Forwarded-For');
    const clientIp = xForwardedFor?.split(',')[0]?.trim() || 
                     req.headers.get('CF-Connecting-IP') || 
                     req.headers.get('X-Real-IP') || 
                     '127.0.0.1';

    console.log('Admin login attempt for:', body.email, 'from IP:', clientIp);

    // Check rate limit before processing login
    const { data: rateLimitCheck, error: rateLimitError } = await supabase
      .rpc('check_login_rate_limit', {
        p_ip_address: clientIp,
        p_email: body.email.toLowerCase().trim()
      })
      .single();

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
      return new Response(
        JSON.stringify({ error: 'Security check failed' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!rateLimitCheck.allowed) {
      const blockedUntil = rateLimitCheck.blocked_until 
        ? new Date(rateLimitCheck.blocked_until).toISOString()
        : null;
      
      console.log('Rate limit exceeded for IP:', clientIp, 'blocked until:', blockedUntil);
      return new Response(
        JSON.stringify({ 
          error: 'Too many login attempts. Please try again later.',
          blocked_until: blockedUntil
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '3600' // 1 hour
          }
        }
      );
    }

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

    // Reset rate limit on successful login
    await supabase.rpc('reset_login_attempts', {
      p_ip_address: clientIp,
      p_email: body.email.toLowerCase().trim()
    });

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