import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { trackPurchase } from "@/utils/metaPixel";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCanvaCheckout } from "@/hooks/useCanvaCheckout";
import { PixelDebugger } from "@/components/debug/PixelDebugger";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [isProcessingDelivery, setIsProcessingDelivery] = useState(true);
  const [deliveryStatus, setDeliveryStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const { handleCanvaCheckout, isProcessingPayment } = useCanvaCheckout();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const requestId = crypto.randomUUID();

    console.log(`[PAYMENT-SUCCESS-${requestId}] === PAYMENT SUCCESS PAGE LOADED ===`);
    console.log(`[PAYMENT-SUCCESS-${requestId}] Session ID: ${sessionId}`);
    console.log(`[PAYMENT-SUCCESS-${requestId}] Meta Pixel available:`, typeof window !== 'undefined' && window.fbq ? 'YES' : 'NO');

    // IMMEDIATE PIXEL TRACKING - Track purchase immediately on page load since Stripe redirected here
    if (sessionId) {
      console.log(`[PAYMENT-SUCCESS-${requestId}] IMMEDIATE: Tracking purchase for verified session ${sessionId}`);
      trackPurchase(19.99, 'USD', 'LuxeVision Premium Collection', sessionId);
      
      // Also track the conversion completion
      window.dispatchEvent(new CustomEvent('pixelTrackPurchase', {
        detail: { sessionId, amount: 19.99, currency: 'USD' }
      }));
    } else {
      console.log(`[PAYMENT-SUCCESS-${requestId}] IMMEDIATE: Tracking fallback purchase (no session_id)`);
      const fallbackId = `fallback-${Date.now()}`;
      trackPurchase(19.99, 'USD', 'LuxeVision Premium Collection', fallbackId);
    }

    // Trigger delivery processing in background (non-blocking)
    const processDelivery = async () => {
      if (!sessionId) {
        console.error(`[PAYMENT-SUCCESS-${requestId}] ERROR: No session_id in URL`);
        setDeliveryStatus('error');
        setIsProcessingDelivery(false);
        return;
      }

      try {
        console.log(`[PAYMENT-SUCCESS-${requestId}] Processing delivery for session: ${sessionId}`);
        
        // Add timeout to function call
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Function timeout')), 10000)
        );
        
        const functionPromise = supabase.functions.invoke('handle-payment-success', {
          body: { session_id: sessionId }
        });

        const { data, error } = await Promise.race([functionPromise, timeoutPromise]) as any;

        console.log(`[PAYMENT-SUCCESS-${requestId}] Function response:`, { data, error });

        if (error) {
          console.error(`[PAYMENT-SUCCESS-${requestId}] Delivery processing error:`, error);
          setDeliveryStatus('error');
          
          // Additional pixel tracking attempt on error (backup)
          console.log(`[PAYMENT-SUCCESS-${requestId}] BACKUP: Additional pixel tracking attempt`);
          setTimeout(() => trackPurchase(19.99, 'USD', 'LuxeVision Premium Collection', sessionId), 2000);
        } else {
          console.log(`[PAYMENT-SUCCESS-${requestId}] Delivery processed successfully:`, data);
          setDeliveryStatus('success');
          
          // Success confirmation - additional pixel tracking
          if (data?.success) {
            console.log(`[PAYMENT-SUCCESS-${requestId}] CONFIRMED: Payment verified, additional tracking`);
            setTimeout(() => trackPurchase(19.99, 'USD', 'LuxeVision Premium Collection', sessionId), 1000);
          }
        }
      } catch (error) {
        console.error(`[PAYMENT-SUCCESS-${requestId}] Delivery error:`, error);
        setDeliveryStatus('error');
        
        // Final fallback pixel tracking
        console.log(`[PAYMENT-SUCCESS-${requestId}] FINAL FALLBACK: Tracking purchase despite all errors`);
        setTimeout(() => trackPurchase(19.99, 'USD', 'LuxeVision Premium Collection', sessionId || `error-fallback-${Date.now()}`), 3000);
      } finally {
        setIsProcessingDelivery(false);
        console.log(`[PAYMENT-SUCCESS-${requestId}] === PAYMENT SUCCESS PROCESSING COMPLETE ===`);
      }
    };

    // Start delivery processing but don't block pixel tracking
    processDelivery();

    // Additional pixel tracking attempts with delays (insurance)
    setTimeout(() => {
      console.log(`[PAYMENT-SUCCESS-${requestId}] INSURANCE: 5s delayed pixel tracking`);
      trackPurchase(19.99, 'USD', 'LuxeVision Premium Collection', sessionId || `delayed-${Date.now()}`);
    }, 5000);

    setTimeout(() => {
      console.log(`[PAYMENT-SUCCESS-${requestId}] INSURANCE: 10s delayed pixel tracking`);
      trackPurchase(19.99, 'USD', 'LuxeVision Premium Collection', sessionId || `delayed2-${Date.now()}`);
    }, 10000);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] text-white flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto w-full">
        <div className="mb-4 md:mb-8">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-r from-[#ffd700] to-[#ffed4e] rounded-full flex items-center justify-center text-2xl md:text-4xl mx-auto mb-3 md:mb-6 p-2">
            {isProcessingDelivery ? (
              <div className="animate-spin">⏳</div>
            ) : (
              <img 
                src="/lovable-uploads/48f02853-b18f-49f8-8dff-9f424d49c69c.png" 
                alt="Success" 
                className="w-full h-full object-contain"
              />
            )}
          </div>
          
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-white to-[#ffd700] bg-clip-text text-transparent">
            {isProcessingDelivery ? "Processing Your Order..." : 
             deliveryStatus === 'success' ? "Payment Successful!" : 
             "Payment Received!"}
          </h1>
          
          <p className="text-base md:text-xl text-gray-300 mb-4 md:mb-8 px-2 leading-relaxed">
            {isProcessingDelivery ? (
              "We're preparing your download link and sending it to your email. This may take a few moments..."
            ) : deliveryStatus === 'success' ? (
              "You will receive the download link in an email shortly."
            ) : (
              <>
                "Your payment was successful. You will receive the download link shortly, if you don't email kovioshop@gmail.com*"
                <div className="text-xs text-gray-400 mt-2">
                  *Please check your spam folder
                </div>
              </>
            )}
          </p>
        </div>

        <div className="bg-gradient-to-r from-[#2d2d2d] to-[#1a1a1a] p-4 md:p-8 rounded-2xl border border-[rgba(255,215,0,0.2)] mb-4 md:mb-8">
          <h2 className="text-lg md:text-2xl font-bold text-[#ffd700] mb-2 md:mb-4">What's Next?</h2>
          <ul className="text-left space-y-2 text-gray-300 text-sm md:text-base">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-[#ffd700] rounded-full mr-3 mt-2 flex-shrink-0"></span>
              <span>Check your email for download instructions</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-[#ffd700] rounded-full mr-3 mt-2 flex-shrink-0"></span>
              <span>Access over 120,000+ premium 4K videos</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-[#ffd700] rounded-full mr-3 mt-2 flex-shrink-0"></span>
              <span>Download videos with full commercial license</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-[#ffd700] rounded-full mr-3 mt-2 flex-shrink-0"></span>
              <span>Enjoy lifetime updates and new content</span>
            </li>
          </ul>
        </div>

        {/* Canva Templates Upsell Section */}
        <div className="bg-gradient-to-r from-[#dc2626] to-[#ea580c] p-4 md:p-8 rounded-2xl border-2 border-[#ffd700] mb-4 md:mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#ffd700] text-black px-2 py-1 md:px-4 md:py-2 rounded-bl-2xl font-bold text-xs">
            LIMITED TIME
          </div>
          
          <div className="relative z-10">
            <h2 className="text-xl md:text-3xl font-bold text-white mb-1 leading-tight">🎨 BONUS OFFER!</h2>
            <h3 className="text-lg md:text-2xl font-bold text-[#ffd700] mb-2 md:mb-4 leading-tight">Discounted 350+ Canva Templates for your Ads</h3>
            <p className="text-base md:text-xl text-white mb-3 md:mb-6 font-semibold">Proven to get sales and a 5.6x ROAS</p>
            
            <div className="bg-black/20 p-3 md:p-4 rounded-xl mb-3 md:mb-6">
              <p className="text-white text-sm md:text-lg mb-2 font-medium">Perfect for creating:</p>
              <ul className="text-left space-y-1 text-white text-sm md:text-base">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-[#ffd700] rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>Facebook & Instagram Ads</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-[#ffd700] rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>YouTube Thumbnails</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-[#ffd700] rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>Social Media Posts</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-[#ffd700] rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>Banner Ads & More</span>
                </li>
              </ul>
            </div>

            <div className="text-center">
              <div className="text-white text-sm md:text-lg mb-2">
                <span className="line-through text-gray-300">$29.99</span>
                <span className="text-xl md:text-3xl font-bold text-[#ffd700] ml-2">$4.99</span>
                <span className="text-xs md:text-sm ml-2">(83% OFF)</span>
              </div>
              
              <Button 
                onClick={handleCanvaCheckout}
                disabled={isProcessingPayment}
                className="bg-[#ffd700] hover:bg-[#ffed4e] text-black px-4 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-xl shadow-lg transform hover:scale-105 transition-all duration-300 w-full md:max-w-md min-h-[48px]"
              >
                {isProcessingPayment ? (
                  <div className="flex items-center gap-2 justify-center">
                    <div className="animate-spin">⏳</div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Get Offer Now"
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2 md:space-y-4">
          <Button asChild className="bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#1a1a1a] px-4 md:px-8 py-3 rounded-full font-bold text-sm md:text-lg hover:shadow-lg w-full sm:w-auto min-h-[48px]">
            <Link to="/">
              Return to Home
            </Link>
          </Button>
          
          <p className="text-xs md:text-sm text-gray-400 px-2">
            Need help? Contact us at support@luxevisionshop.com
          </p>
        </div>
      </div>
      <PixelDebugger />
    </div>
  );
};

export default PaymentSuccess;
