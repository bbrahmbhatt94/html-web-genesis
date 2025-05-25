
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

export const trackPurchase = (value: number, currency: string = 'USD', contentName?: string) => {
  trackEvent('Purchase', {
    value: value,
    currency: currency,
    content_name: contentName,
  });
};

export const trackLead = (contentName?: string) => {
  trackEvent('Lead', {
    content_name: contentName,
  });
};
