
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
  // Prevent duplicate tracking for the same transaction
  if (transactionId) {
    const trackedTransactions = JSON.parse(localStorage.getItem('tracked_purchases') || '[]');
    if (trackedTransactions.includes(transactionId)) {
      console.log(`Purchase already tracked for transaction: ${transactionId}`);
      return;
    }
    trackedTransactions.push(transactionId);
    localStorage.setItem('tracked_purchases', JSON.stringify(trackedTransactions.slice(-50))); // Keep last 50
  }

  const purchaseData = {
    value: value,
    currency: currency,
    content_name: contentName,
    content_type: 'product',
    ...(transactionId && { transaction_id: transactionId }),
  };

  console.log('Meta Pixel: Tracking Purchase Event', purchaseData);
  trackEvent('Purchase', purchaseData);
};

export const trackLead = (contentName?: string) => {
  trackEvent('Lead', {
    content_name: contentName,
  });
};
