
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const usePaymentVerification = () => {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidPayment, setIsValidPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        
        // If no session_id in URL, this is not a valid payment success access
        if (!sessionId) {
          setError('No payment session found');
          setIsValidPayment(false);
          setIsVerifying(false);
          return;
        }

        // Check if this session was already processed to prevent replay attacks
        const processedSessions = JSON.parse(
          localStorage.getItem('processedPaymentSessions') || '[]'
        );
        
        if (processedSessions.includes(sessionId)) {
          setError('Payment session already processed');
          setIsValidPayment(false);
          setIsVerifying(false);
          return;
        }

        // Mark this session as processed
        processedSessions.push(sessionId);
        localStorage.setItem('processedPaymentSessions', JSON.stringify(processedSessions));

        // Additional validation: check if session is recent (within last hour)
        const currentTime = Date.now();
        const sessionTimestamp = localStorage.getItem(`payment_${sessionId}`);
        
        if (!sessionTimestamp || (currentTime - parseInt(sessionTimestamp)) > 3600000) {
          // Session is older than 1 hour or doesn't exist
          setError('Payment session expired or invalid');
          setIsValidPayment(false);
          setIsVerifying(false);
          return;
        }

        setIsValidPayment(true);
        setIsVerifying(false);
        
      } catch (err) {
        console.error('Payment verification error:', err);
        setError('Failed to verify payment');
        setIsValidPayment(false);
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  return { isVerifying, isValidPayment, error };
};
