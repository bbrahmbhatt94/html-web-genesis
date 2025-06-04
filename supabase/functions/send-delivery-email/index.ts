
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, downloadToken, productName, orderNumber } = await req.json();
    
    console.log("Sending delivery email to:", email);

    const downloadUrl = `${req.headers.get("origin")}/download/${downloadToken}`;

    const emailResponse = await resend.emails.send({
      from: "LuxeVision <noreply@luxevisionshop.com>",
      to: [email],
      subject: "🎬 Your LuxeVision Premium Collection is Ready!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your LuxeVision Download</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .title { font-size: 28px; font-weight: bold; margin: 0; background: linear-gradient(45deg, #ffd700, #ffed4e); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .download-btn { display: inline-block; background: linear-gradient(45deg, #ffd700, #ffed4e); color: #1a1a1a; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px; margin: 20px 0; }
            .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature { display: flex; align-items: center; margin: 10px 0; }
            .feature::before { content: "✓"; color: #ffd700; font-weight: bold; margin-right: 10px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .order-info { background: #e8f4fd; padding: 15px; border-radius: 6px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">🎬 LuxeVision Premium Collection</h1>
            <p>Your premium 4K luxury video collection is ready for download!</p>
          </div>
          
          <div class="content">
            <h2>Thank you for your purchase!</h2>
            <p>We're excited to deliver your premium collection of over 120,000+ stunning 4K videos.</p>
            
            <div class="order-info">
              <strong>Order Details:</strong><br>
              Product: ${productName}<br>
              Order #: ${orderNumber}<br>
              Status: Ready for Download
            </div>
            
            <div style="text-align: center;">
              <a href="${downloadUrl}" class="download-btn">📥 Download Your Collection</a>
            </div>
            
            <div class="features">
              <h3>What You Get:</h3>
              <div class="feature">120,000+ Premium 4K Videos</div>
              <div class="feature">Full Commercial License</div>
              <div class="feature">Lifetime Access</div>
              <div class="feature">Multiple Download Attempts</div>
              <div class="feature">24/7 Customer Support</div>
            </div>
            
            <p><strong>Important Notes:</strong></p>
            <ul>
              <li>This download link expires in 7 days</li>
              <li>You have up to 5 download attempts</li>
              <li>Save your files immediately after download</li>
              <li>Contact support if you encounter any issues</li>
            </ul>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing LuxeVision!<br>
            Need help? Contact us at support@luxevisionshop.com</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Delivery email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error sending delivery email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
