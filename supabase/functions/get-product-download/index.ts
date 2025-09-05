import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

interface GetDownloadRequest {
  downloadToken: string;
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

    const body: GetDownloadRequest = await req.json();
    
    if (!body.downloadToken) {
      return new Response(
        JSON.stringify({ error: 'Download token required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Processing download request for token:', body.downloadToken);

    // Validate download token format (should be 64 char hex)
    if (!/^[a-f0-9]{64}$/.test(body.downloadToken)) {
      return new Response(
        JSON.stringify({ error: 'Invalid token format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate download token and get download link info
    const { data: downloadLink, error: linkError } = await supabase
      .from('download_links')
      .select('id, download_count, max_downloads, expires_at, is_active, order_id')
      .eq('download_token', body.downloadToken)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (linkError || !downloadLink) {
      console.log('Invalid or expired download token');
      return new Response(
        JSON.stringify({ error: 'Invalid or expired download token' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check download count limit
    if (downloadLink.download_count >= downloadLink.max_downloads) {
      console.log('Download limit exceeded for token');
      return new Response(
        JSON.stringify({ error: 'Download limit exceeded' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate signed URL for the product file (valid for 1 hour)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('Product Files')
      .createSignedUrl('product-package.zip', 3600); // 1 hour expiry

    if (urlError || !signedUrlData) {
      console.error('Error creating signed URL:', urlError);
      return new Response(
        JSON.stringify({ error: 'Unable to generate download link' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Update download count
    const { error: updateError } = await supabase
      .from('download_links')
      .update({ 
        download_count: downloadLink.download_count + 1,
        last_accessed: new Date().toISOString()
      })
      .eq('id', downloadLink.id);

    if (updateError) {
      console.error('Error updating download count:', updateError);
    }

    console.log('Successfully generated download URL for token:', body.downloadToken);

    return new Response(
      JSON.stringify({
        success: true,
        downloadUrl: signedUrlData.signedUrl,
        remainingDownloads: downloadLink.max_downloads - (downloadLink.download_count + 1),
        expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Product download error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});