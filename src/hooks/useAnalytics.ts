
import { useEffect } from 'react';
import { 
  initializeAnalyticsSession, 
  trackPerformance, 
  trackScrollDepth,
  trackSectionView
} from '@/utils/analytics';

export const useAnalytics = () => {
  useEffect(() => {
    // Initialize analytics session on mount
    initializeAnalyticsSession();
    
    // Track performance when page loads
    window.addEventListener('load', trackPerformance);

    // Track scroll depth
    let maxScrollDepth = 0;
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = Math.round((scrollTop / (docHeight - winHeight)) * 100);
      
      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;
        
        // Track at 25%, 50%, 75%, 100%
        if ([25, 50, 75, 100].includes(scrollPercent)) {
          trackScrollDepth(scrollPercent);
        }
      }
    };

    // Track section views with Intersection Observer
    const observeSection = (sectionName: string, element: Element) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              trackSectionView(sectionName);
              observer.unobserve(element);
            }
          });
        },
        { threshold: 0.5 }
      );
      observer.observe(element);
    };

    // Setup observers for common sections
    const setupSectionObservers = () => {
      const sections = [
        { selector: '[data-section="hero"]', name: 'hero' },
        { selector: '[data-section="features"]', name: 'features' },
        { selector: '[data-section="pricing"]', name: 'pricing' },
        { selector: '[data-section="testimonials"]', name: 'testimonials' },
      ];

      sections.forEach(({ selector, name }) => {
        const element = document.querySelector(selector);
        if (element) {
          observeSection(name, element);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    
    // Setup section observers after a short delay to ensure DOM is ready
    setTimeout(setupSectionObservers, 1000);

    return () => {
      window.removeEventListener('load', trackPerformance);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
};
