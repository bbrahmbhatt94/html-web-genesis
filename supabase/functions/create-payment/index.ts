
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Creating payment session...");

    // Initialize Stripe with the secret key
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the request body
    const { amount = 1999, currency = "usd", productName = "LuxeVision Premium Collection", customerEmail } = await req.json().catch(() => ({}));

    console.log("Creating checkout session for:", { amount, currency, productName, customerEmail });

    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: { 
              name: productName,
              description: "Premium 4K Luxury Video Collection - Lifetime Access"
            },
            unit_amount: amount, // $19.99 in cents
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
      },
    });

    // Create pending order in database
    if (customerEmail) {
      const { error } = await supabase
        .from('orders')
        .insert({
          user_email: customerEmail,
          stripe_session_id: session.id,
          amount: amount,
          currency: currency,
          product_name: productName,
          status: 'pending'
        });

      if (error) {
        console.error("Error creating order:", error);
      } else {
        console.log("Order created successfully for session:", session.id);
      }
    }

    console.log("Checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
