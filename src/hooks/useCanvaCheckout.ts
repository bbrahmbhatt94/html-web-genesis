
import { useState } from "react";
import { trackViewContent, trackInitiateCheckout } from "@/utils/metaPixel";
import { supabase } from "@/integrations/supabase/client";

export const useCanvaCheckout = () => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleCanvaCheckout = async () => {
    setIsProcessingPayment(true);
    try {
      trackViewContent('Canva Templates Upsell', 'Canva Templates');
      
      console.log("Calling create-payment function for Canva Templates...");

      const {
        data,
        error
      } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: 499, // $4.99 in cents
          currency: 'usd',
          productName: 'Discounted 350+ Canva Templates'
        }
      });

      if (error) {
        console.error('Canva Templates payment error:', error);
        alert('Payment failed. Please try again.');
        return;
      }

      if (data?.url) {
        trackInitiateCheckout(4.99, 'USD');
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Canva Templates checkout error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return { 
    handleCanvaCheckout, 
    isProcessingPayment
  };
};
