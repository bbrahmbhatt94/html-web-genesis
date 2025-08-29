import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GetDownloadRequest {
  downloadToken: string;
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

    // Validate download token and get download link info
    const { data: downloadLink, error: linkError } = await supabase
      .from('download_links')
      .select('*')
      .eq('download_token', body.downloadToken)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .lt('download_count', supabase.rpc('max_downloads'))
      .single();

    if (linkError || !downloadLink) {
      console.log('Invalid or expired download token:', body.downloadToken);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired download token' }),
        { 
          status: 404, 
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