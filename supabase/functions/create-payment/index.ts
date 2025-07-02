
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] === CREATE PAYMENT REQUEST START ===`);
  console.log(`[${requestId}] Method: ${req.method}, Origin: ${req.headers.get("origin")}`);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log(`[${requestId}] CORS preflight request handled`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`[${requestId}] Processing payment session creation...`);

    // Initialize Stripe with the secret key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error(`[${requestId}] ERROR: STRIPE_SECRET_KEY not found`);
      throw new Error("Stripe configuration missing");
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });
    console.log(`[${requestId}] Stripe client initialized`);

    // Initialize Supabase client with service role key for database operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.error(`[${requestId}] ERROR: Supabase configuration missing`);
      throw new Error("Supabase configuration missing");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log(`[${requestId}] Supabase client initialized`);

    // Get the request body
    const requestBody = await req.json().catch((e) => {
      console.error(`[${requestId}] Error parsing request body:`, e);
      return {};
    });
    
    const { amount = 1999, currency = "usd", productName = "LuxeVision Premium Collection" } = requestBody;
    console.log(`[${requestId}] Payment details:`, { amount, currency, productName });

    // Create a one-time payment session
    console.log(`[${requestId}] Creating Stripe checkout session...`);
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: { 
              name: productName,
              description: "Premium 4K Luxury Video Collection - Lifetime Access"
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/`,
      metadata: {
        product_name: productName,
        amount: amount.toString(),
        currency: currency,
        request_id: requestId, // Track this request
      },
    });

    console.log(`[${requestId}] Stripe checkout session created successfully:`, {
      session_id: session.id,
      url: session.url,
      success_url: session.success_url,
      metadata: session.metadata
    });

    // Create order record in database
    console.log(`[${requestId}] Creating order record in database...`);
    try {
      const orderData = {
        stripe_session_id: session.id,
        user_email: 'guest@luxevisionshop.com', // Default guest email
        product_name: productName,
        amount: amount,
        currency: currency,
        status: 'pending'
      };
      
      console.log(`[${requestId}] Order data to insert:`, orderData);
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error(`[${requestId}] ERROR creating order:`, orderError);
        // Continue with payment even if order creation fails
      } else {
        console.log(`[${requestId}] Order created successfully:`, {
          order_id: order.id,
          stripe_session_id: order.stripe_session_id,
          status: order.status
        });
      }
    } catch (dbError) {
      console.error(`[${requestId}] Database error:`, dbError);
      // Continue with payment even if database operation fails
    }

    console.log(`[${requestId}] === CREATE PAYMENT REQUEST SUCCESS ===`);
    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id,
      request_id: requestId 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(`[${requestId}] === CREATE PAYMENT REQUEST FAILED ===`);
    console.error(`[${requestId}] Error details:`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(JSON.stringify({ 
      error: error.message,
      request_id: requestId 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
