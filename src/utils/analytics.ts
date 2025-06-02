
import { supabase } from "@/integrations/supabase/client";
import { trackEvent as trackMetaPixelEvent } from "./metaPixel";

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

// Track analytics event
export const trackAnalyticsEvent = async (
  eventType: string,
  eventData: any = {},
  trackMetaPixel: boolean = true
) => {
  const sessionId = getSessionId();
  
  try {
    // Track to Supabase
    await supabase.from('analytics_events').insert({
      session_id: sessionId,
      event_type: eventType as any,
      event_data: eventData,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    });

    // Also track to Meta Pixel if enabled
    if (trackMetaPixel) {
      trackMetaPixelEvent(eventType, eventData);
    }

    console.log(`Analytics event tracked: ${eventType}`, eventData);
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

// Track conversions
export const trackConversion = (value: number, currency: string = 'USD') => {
  trackAnalyticsEvent('conversion', { value, currency });
};
