
// Meta Pixel tracking utilities
declare global {
  interface Window {
    fbq: (command: string, event: string, parameters?: any) => void;
  }
}

export const trackEvent = (eventName: string, parameters?: any) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters);
    console.log(`Meta Pixel event tracked: ${eventName}`, parameters);
  }
};

export const trackPageView = () => {
  trackEvent('PageView');
};

export const trackViewContent = (contentName: string, contentCategory?: string) => {
  trackEvent('ViewContent', {
    content_name: contentName,
    content_category: contentCategory,
  });
};

export const trackAddToCart = (contentName: string, value: number, currency: string = 'USD') => {
  trackEvent('AddToCart', {
    content_name: contentName,
    value: value,
    currency: currency,
  });
};

export const trackInitiateCheckout = (value: number, currency: string = 'USD') => {
  trackEvent('InitiateCheckout', {
    value: value,
    currency: currency,
  });
};

export const trackPurchase = (value: number, currency: string = 'USD', contentName?: string, transactionId?: string) => {
  const timestamp = Date.now();
  const eventId = transactionId ? `purchase_${transactionId}` : `purchase_${timestamp}`;
  
  // Enhanced duplicate prevention
  if (transactionId) {
    const trackedTransactions = JSON.parse(localStorage.getItem('tracked_purchases') || '[]');
    if (trackedTransactions.includes(transactionId)) {
      console.log(`Meta Pixel: Purchase already tracked for transaction: ${transactionId}`);
      return false;
    }
    trackedTransactions.push(transactionId);
    localStorage.setItem('tracked_purchases', JSON.stringify(trackedTransactions.slice(-100))); // Keep last 100
  }

  // Enhanced purchase data with all recommended parameters
  const purchaseData = {
    value: value,
    currency: currency,
    content_name: contentName || 'LuxeVision Premium Collection',
    content_type: 'product',
    content_category: 'digital_product',
    event_id: eventId, // For deduplication in Meta
    ...(transactionId && { 
      transaction_id: transactionId,
      external_id: transactionId // Additional identifier
    }),
    timestamp: timestamp
  };

  console.log(`Meta Pixel: Tracking Purchase Event [${eventId}]`, purchaseData);
  
  // Check if Meta Pixel is available
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'Purchase', purchaseData);
      console.log(`Meta Pixel: ✅ Purchase event fired successfully [${eventId}]`);
      
      // Store successful tracking event
      const debugLog = JSON.parse(localStorage.getItem('pixel_debug_log') || '[]');
      debugLog.push({
        timestamp: new Date().toISOString(),
        event: 'Purchase',
        event_id: eventId,
        status: 'success',
        data: purchaseData
      });
      localStorage.setItem('pixel_debug_log', JSON.stringify(debugLog.slice(-20)));
      
      return true;
    } catch (error) {
      console.error(`Meta Pixel: ❌ Failed to track Purchase event [${eventId}]:`, error);
      return false;
    }
  } else {
    console.error(`Meta Pixel: ❌ Meta Pixel not available [${eventId}]`);
    return false;
  }
};

export const trackLead = (contentName?: string) => {
  trackEvent('Lead', {
    content_name: contentName,
  });
};
