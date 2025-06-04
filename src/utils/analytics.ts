
import { supabase } from "@/integrations/supabase/client";
import { trackEvent as trackMetaPixelEvent } from "./metaPixel";
import { sanitizeAnalyticsData } from "./inputValidation";

// Generate unique session ID
const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Rate limiting for analytics events
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_EVENTS_PER_WINDOW = 100;

const checkRateLimit = (eventType: string): boolean => {
  const now = Date.now();
  const key = `${eventType}-${Math.floor(now / RATE_LIMIT_WINDOW)}`;
  const count = rateLimitMap.get(key) || 0;
  
  if (count >= MAX_EVENTS_PER_WINDOW) {
    return false;
  }
  
  rateLimitMap.set(key, count + 1);
  
  // Cleanup old entries
  for (const [k, _] of rateLimitMap) {
    if (parseInt(k.split('-').pop() || '0') < Math.floor(now / RATE_LIMIT_WINDOW) - 5) {
      rateLimitMap.delete(k);
    }
  }
  
  return true;
};

// Track analytics event with security measures
export const trackAnalyticsEvent = async (
  eventType: string,
  eventData: any = {},
  trackMetaPixel: boolean = true
) => {
  const sessionId = getSessionId();
  
  try {
    // Rate limiting
    if (!checkRateLimit(eventType)) {
      console.warn('Rate limit exceeded for analytics tracking');
      return;
    }

    // Input validation and sanitization
    const sanitizedEventType = eventType.replace(/[^a-zA-Z0-9_]/g, '');
    const sanitizedEventData = sanitizeAnalyticsData(eventData);
    
    // Validate event type is allowed
    const allowedEventTypes = [
      'page_view', 'video_play', 'video_pause', 'video_complete',
      'scroll_depth', 'button_click', 'section_view', 'timer_interaction',
      'menu_toggle', 'conversion', 'checkout_start', 'payment_complete'
    ];
    
    if (!allowedEventTypes.includes(sanitizedEventType)) {
      console.warn(`Invalid event type: ${eventType}`);
      return;
    }

    // Track to Supabase
    await supabase.from('analytics_events').insert({
      session_id: sessionId,
      event_type: sanitizedEventType as any,
      event_data: sanitizedEventData,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    });

    // Also track to Meta Pixel if enabled
    if (trackMetaPixel) {
      trackMetaPixelEvent(sanitizedEventType, sanitizedEventData);
    }

    console.log(`Analytics event tracked: ${sanitizedEventType}`, sanitizedEventData);
  } catch (error) {
    console.error('Error tracking analytics event:', error);
  }
};

// Initialize analytics session
export const initializeAnalyticsSession = async () => {
  const sessionId = getSessionId();
  
  try {
    // Check if session already exists
    const { data: existingSession } = await supabase
      .from('analytics_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (!existingSession) {
      // Create new session
      await supabase.from('analytics_sessions').insert({
        session_id: sessionId,
        referrer: document.referrer,
        device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        browser: navigator.userAgent.split(' ').pop() || 'unknown'
      });
    }

    // Track page view
    await trackAnalyticsEvent('page_view', {
      page_title: document.title,
      page_url: window.location.href
    });

  } catch (error) {
    console.error('Error initializing analytics session:', error);
  }
};

// Track performance metrics
export const trackPerformance = async () => {
  const sessionId = getSessionId();
  
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    try {
      await supabase.from('analytics_performance').insert({
        session_id: sessionId,
        page_url: window.location.href,
        load_time: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
        first_contentful_paint: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
      });
    } catch (error) {
      console.error('Error tracking performance:', error);
    }
  }
};

// Track scroll depth
export const trackScrollDepth = (depth: number) => {
  trackAnalyticsEvent('scroll_depth', { depth_percentage: depth });
};

// Track video interactions
export const trackVideoEvent = (action: string, videoElement?: HTMLVideoElement) => {
  const eventData: any = { action };
  
  if (videoElement) {
    eventData.video_duration = videoElement.duration;
    eventData.current_time = videoElement.currentTime;
    eventData.video_src = videoElement.src;
  }
  
  trackAnalyticsEvent(`video_${action}`, eventData);
};

// Track button clicks
export const trackButtonClick = (buttonText: string, buttonId?: string) => {
  trackAnalyticsEvent('button_click', {
    button_text: buttonText,
    button_id: buttonId
  });
};

// Track section views
export const trackSectionView = (sectionName: string) => {
  trackAnalyticsEvent('section_view', { section_name: sectionName });
};

// Track conversions - ONLY for actual successful payments
export const trackConversion = (value: number, currency: string = 'USD') => {
  // This should only be called from PaymentSuccess page
  trackAnalyticsEvent('conversion', { value, currency }, false); // Don't double-track to Meta Pixel
  console.log(`Conversion tracked: ${value} ${currency}`);
};
