
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();
    
    console.log("Processing payment success for session:", session_id);

    // Initialize services
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status !== 'paid') {
      console.log("Payment not completed, status:", session.payment_status);
      throw new Error('Payment not completed');
    }

    console.log("Payment verified as successful in Stripe");

    // Try to find existing order
    const { data: existingOrder, error: findError } = await supabase
      .from('orders')
      .select()
      .eq('stripe_session_id', session_id)
      .maybeSingle();

    let order;

    if (existingOrder) {
      // Update existing order
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'paid',
          stripe_customer_id: session.customer as string
        })
        .eq('stripe_session_id', session_id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating order:", updateError);
        throw updateError;
      }

      order = updatedOrder;
      console.log("Order updated successfully:", order.id);
    } else {
      // Create new order if it doesn't exist (fallback)
      const { data: newOrder, error: createError } = await supabase
        .from('orders')
        .insert({
          stripe_session_id: session_id,
          user_email: 'guest@luxevisionshop.com',
          product_name: session.metadata?.product_name || 'LuxeVision Premium Collection',
          amount: parseInt(session.metadata?.amount || '1999'),
          currency: session.metadata?.currency || 'usd',
          status: 'paid',
          stripe_customer_id: session.customer as string
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating order:", createError);
        throw createError;
      }

      order = newOrder;
      console.log("Order created successfully:", order.id);
    }

    // Trigger delivery email
    try {
      const emailResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-delivery-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          email: order.user_email,
          productName: order.product_name,
          orderNumber: order.id
        }),
      });

      if (!emailResponse.ok) {
        console.error("Failed to send delivery email");
      } else {
        console.log("Delivery email sent successfully");
      }
    } catch (emailError) {
      console.error("Email sending error:", emailError);
    }

    // Mark order as delivered
    await supabase
      .from('orders')
      .update({ 
        status: 'delivered',
        delivered_at: new Date().toISOString()
      })
      .eq('id', order.id);

    console.log("Order delivery completed for:", order.user_email);

    return new Response(JSON.stringify({ success: true, order_id: order.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Payment success handling error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
