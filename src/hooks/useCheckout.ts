
import { useState } from "react";
import { trackViewContent, trackInitiateCheckout } from "@/utils/metaPixel";
import { supabase } from "@/integrations/supabase/client";

export const useCheckout = () => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");

  const handleCheckout = async (email?: string) => {
    const emailToUse = email || customerEmail;
    
    if (!emailToUse) {
      alert('Please provide your email address to receive the download link.');
      return;
    }

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
          productName: 'LuxeVision Premium Collection',
          customerEmail: emailToUse
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

  return { 
    handleCheckout, 
    isProcessingPayment, 
    customerEmail, 
    setCustomerEmail 
  };
};
