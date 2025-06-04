
import { useState } from "react";
import { trackViewContent, trackInitiateCheckout } from "@/utils/metaPixel";
import { supabase } from "@/integrations/supabase/client";

export const useCheckout = () => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleCheckout = async () => {
    setIsProcessingPayment(true);
    try {
      trackViewContent('Checkout Initiated', 'Premium Video Collection');
      
      console.log("Calling create-payment function...");

      const {
        data,
        error
      } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: 1999,
          currency: 'usd',
          productName: 'LuxeVision Premium Collection'
        }
      });

      if (error) {
        console.error('Payment error:', error);
        alert('Payment failed. Please try again.');
        return;
      }

      if (data?.url) {
        trackInitiateCheckout(19.99, 'USD');
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return { handleCheckout, isProcessingPayment };
};
