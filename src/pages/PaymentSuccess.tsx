import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { trackPurchase } from "@/utils/metaPixel";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCanvaCheckout } from "@/hooks/useCanvaCheckout";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [isProcessingDelivery, setIsProcessingDelivery] = useState(true);
  const [deliveryStatus, setDeliveryStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const { handleCanvaCheckout, isProcessingPayment } = useCanvaCheckout();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    // Track the successful purchase conversion
    trackPurchase(19.99, 'USD', 'LuxeVision Premium Collection');

    // Trigger automatic delivery
    const processDelivery = async () => {
      if (!sessionId) {
        setDeliveryStatus('error');
        setIsProcessingDelivery(false);
        return;
      }

      try {
        console.log("Processing delivery for session:", sessionId);
        
        const { error } = await supabase.functions.invoke('handle-payment-success', {
          body: { session_id: sessionId }
        });

        if (error) {
          console.error('Delivery processing error:', error);
          setDeliveryStatus('error');
        } else {
          console.log('Delivery processed successfully');
          setDeliveryStatus('success');
        }
      } catch (error) {
        console.error('Delivery error:', error);
        setDeliveryStatus('error');
      } finally {
        setIsProcessingDelivery(false);
      }
    };

    processDelivery();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] text-white flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-[#ffd700] to-[#ffed4e] rounded-full flex items-center justify-center text-4xl mx-auto mb-6 p-2">
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
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-[#ffd700] bg-clip-text text-transparent">
            {isProcessingDelivery ? "Processing Your Order..." : 
             deliveryStatus === 'success' ? "Payment Successful!" : 
             "Payment Received!"}
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            {isProcessingDelivery ? (
              "We're preparing your download link and sending it to your email. This may take a few moments..."
            ) : deliveryStatus === 'success' ? (
              "You will receive the download link in an email shortly."
            ) : (
              "Your payment was successful. You will receive the download link shortly, if you don't email kovioshop@gmail.com"
            )}
          </p>
        </div>

        <div className="bg-gradient-to-r from-[#2d2d2d] to-[#1a1a1a] p-8 rounded-2xl border border-[rgba(255,215,0,0.2)] mb-8">
          <h2 className="text-2xl font-bold text-[#ffd700] mb-4">What's Next?</h2>
          <ul className="text-left space-y-3 text-gray-300">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-[#ffd700] rounded-full mr-3"></span>
              Check your email for download instructions
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-[#ffd700] rounded-full mr-3"></span>
              Access over 120,000+ premium 4K videos
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-[#ffd700] rounded-full mr-3"></span>
              Download videos with full commercial license
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-[#ffd700] rounded-full mr-3"></span>
              Enjoy lifetime updates and new content
            </li>
          </ul>
        </div>

        {/* Canva Templates Upsell Section */}
        <div className="bg-gradient-to-r from-[#dc2626] to-[#ea580c] p-8 rounded-2xl border-2 border-[#ffd700] mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#ffd700] text-black px-4 py-2 rounded-bl-2xl font-bold text-sm">
            LIMITED TIME
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-2">🎨 BONUS OFFER!</h2>
            <h3 className="text-2xl font-bold text-[#ffd700] mb-4">Discounted 350+ Canva Templates for your Ads</h3>
            <p className="text-xl text-white mb-6 font-semibold">Proven to get sales and a 5.6x ROAS</p>
            
            <div className="bg-black/20 p-4 rounded-xl mb-6">
              <p className="text-white text-lg mb-2">Perfect for creating:</p>
              <ul className="text-left space-y-2 text-white">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#ffd700] rounded-full mr-3"></span>
                  Facebook & Instagram Ads
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#ffd700] rounded-full mr-3"></span>
                  YouTube Thumbnails
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#ffd700] rounded-full mr-3"></span>
                  Social Media Posts
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#ffd700] rounded-full mr-3"></span>
                  Banner Ads & More
                </li>
              </ul>
            </div>

            <div className="text-center">
              <div className="text-white text-lg mb-2">
                <span className="line-through text-gray-300">$29.99</span>
                <span className="text-3xl font-bold text-[#ffd700] ml-2">$4.99</span>
                <span className="text-sm ml-2">(83% OFF)</span>
              </div>
              
              <Button 
                onClick={handleCanvaCheckout}
                disabled={isProcessingPayment}
                className="bg-[#ffd700] hover:bg-[#ffed4e] text-black px-8 py-4 rounded-full font-bold text-xl shadow-lg transform hover:scale-105 transition-all duration-300 w-full max-w-md"
              >
                {isProcessingPayment ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin">⏳</div>
                    Processing...
                  </div>
                ) : (
                  "🔥 CLICK HERE - GET TEMPLATES NOW!"
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button asChild className="bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#1a1a1a] px-8 py-3 rounded-full font-bold text-lg hover:shadow-lg">
            <Link to="/">
              Return to Home
            </Link>
          </Button>
          
          <p className="text-sm text-gray-400">
            Need help? Contact us at support@luxevisionshop.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
