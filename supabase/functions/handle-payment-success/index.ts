
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] === HANDLE PAYMENT SUCCESS START ===`);
  console.log(`[${requestId}] Method: ${req.method}, Origin: ${req.headers.get("origin")}`);

  if (req.method === "OPTIONS") {
    console.log(`[${requestId}] CORS preflight request handled`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`[${requestId}] Parsing request body...`);
    const requestBody = await req.json().catch((e) => {
      console.error(`[${requestId}] Error parsing request body:`, e);
      throw new Error("Invalid request body");
    });
    
    const { session_id } = requestBody;
    
    if (!session_id) {
      console.error(`[${requestId}] ERROR: No session_id provided`);
      throw new Error("Session ID is required");
    }
    
    console.log(`[${requestId}] Processing payment success for session: ${session_id}`);

    // Initialize services
    console.log(`[${requestId}] Initializing Stripe and Supabase clients...`);
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error(`[${requestId}] ERROR: STRIPE_SECRET_KEY not found`);
      throw new Error("Stripe configuration missing");
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });
    console.log(`[${requestId}] Stripe client initialized`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.error(`[${requestId}] ERROR: Supabase configuration missing`);
      throw new Error("Supabase configuration missing");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log(`[${requestId}] Supabase client initialized`);

    // Retrieve session from Stripe
    console.log(`[${requestId}] Retrieving Stripe session: ${session_id}`);
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    console.log(`[${requestId}] Stripe session retrieved:`, {
      id: session.id,
      payment_status: session.payment_status,
      customer: session.customer,
      amount_total: session.amount_total,
      metadata: session.metadata
    });
    
    if (session.payment_status !== 'paid') {
      console.error(`[${requestId}] Payment not completed. Status: ${session.payment_status}`);
      throw new Error(`Payment not completed. Status: ${session.payment_status}`);
    }

    console.log(`[${requestId}] Payment verified as successful in Stripe`);

    // Try to find existing order
    console.log(`[${requestId}] Looking for existing order with session_id: ${session_id}`);
    const { data: existingOrder, error: findError } = await supabase
      .from('orders')
      .select()
      .eq('stripe_session_id', session_id)
      .maybeSingle();

    if (findError) {
      console.error(`[${requestId}] Error finding existing order:`, findError);
    } else if (existingOrder) {
      console.log(`[${requestId}] Found existing order:`, {
        id: existingOrder.id,
        status: existingOrder.status,
        created_at: existingOrder.created_at
      });
    } else {
      console.log(`[${requestId}] No existing order found for session_id: ${session_id}`);
    }

    let order;

    if (existingOrder) {
      // Update existing order
      console.log(`[${requestId}] Updating existing order: ${existingOrder.id}`);
      const updateData = { 
        status: 'paid',
        stripe_customer_id: session.customer as string,
        updated_at: new Date().toISOString()
      };
      
      console.log(`[${requestId}] Update data:`, updateData);
      
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('stripe_session_id', session_id)
        .select()
        .single();

      if (updateError) {
        console.error(`[${requestId}] ERROR updating order:`, updateError);
        throw updateError;
      }

      order = updatedOrder;
      console.log(`[${requestId}] Order updated successfully:`, {
        id: order.id,
        status: order.status,
        stripe_customer_id: order.stripe_customer_id
      });
    } else {
      // Create new order if it doesn't exist (fallback)
      console.log(`[${requestId}] Creating new order (fallback scenario)`);
      const newOrderData = {
        stripe_session_id: session_id,
        user_email: 'guest@luxevisionshop.com',
        product_name: session.metadata?.product_name || 'LuxeVision Premium Collection',
        amount: parseInt(session.metadata?.amount || '1999'),
        currency: session.metadata?.currency || 'usd',
        status: 'paid',
        stripe_customer_id: session.customer as string
      };
      
      console.log(`[${requestId}] New order data:`, newOrderData);
      
      const { data: newOrder, error: createError } = await supabase
        .from('orders')
        .insert(newOrderData)
        .select()
        .single();

      if (createError) {
        console.error(`[${requestId}] ERROR creating new order:`, createError);
        throw createError;
      }

      order = newOrder;
      console.log(`[${requestId}] New order created successfully:`, {
        id: order.id,
        status: order.status
      });
    }

    // Trigger delivery email
    console.log(`[${requestId}] Triggering delivery email for order: ${order.id}`);
    try {
      const emailPayload = {
        email: order.user_email,
        productName: order.product_name,
        orderNumber: order.id
      };
      
      console.log(`[${requestId}] Email payload:`, emailPayload);
      
      const emailResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-delivery-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify(emailPayload),
      });

      console.log(`[${requestId}] Email response status: ${emailResponse.status}`);
      
      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error(`[${requestId}] Failed to send delivery email:`, errorText);
      } else {
        const responseData = await emailResponse.json();
        console.log(`[${requestId}] Delivery email sent successfully:`, responseData);
      }
    } catch (emailError) {
      console.error(`[${requestId}] Email sending error:`, emailError);
    }

    // Mark order as delivered
    console.log(`[${requestId}] Marking order as delivered: ${order.id}`);
    const { data: deliveredOrder, error: deliveryError } = await supabase
      .from('orders')
      .update({ 
        status: 'delivered',
        delivered_at: new Date().toISOString()
      })
      .eq('id', order.id)
      .select()
      .single();

    if (deliveryError) {
      console.error(`[${requestId}] ERROR marking order as delivered:`, deliveryError);
    } else {
      console.log(`[${requestId}] Order marked as delivered successfully:`, {
        id: deliveredOrder.id,
        status: deliveredOrder.status,
        delivered_at: deliveredOrder.delivered_at
      });
    }

    console.log(`[${requestId}] Order delivery completed for: ${order.user_email}`);
    console.log(`[${requestId}] === HANDLE PAYMENT SUCCESS COMPLETE ===`);

    return new Response(JSON.stringify({ 
      success: true, 
      order_id: order.id,
      request_id: requestId,
      status: deliveredOrder?.status || order.status
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error(`[${requestId}] === HANDLE PAYMENT SUCCESS FAILED ===`);
    console.error(`[${requestId}] Error details:`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(
      JSON.stringify({ 
        error: error.message,
        request_id: requestId 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
