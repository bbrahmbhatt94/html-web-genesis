import { useEffect, useRef, useState, useCallback } from "react";
import { useIsMobile } from "./use-mobile";

interface VideoOptimizationProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  index: number;
  isFirstVideo?: boolean;
}

export const useMobileVideoOptimization = ({ 
  videoRef, 
  index, 
  isFirstVideo = false 
}: VideoOptimizationProps) => {
  const isMobile = useIsMobile();
  const [shouldLoad, setShouldLoad] = useState(!isMobile || isFirstVideo);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Connection-aware loading
  const getConnectionSpeed = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection?.effectiveType || 'unknown';
    }
    return 'unknown';
  }, []);

  const isSlowConnection = useCallback(() => {
    const speed = getConnectionSpeed();
    return speed === 'slow-2g' || speed === '2g';
  }, [getConnectionSpeed]);

  // Lazy loading for mobile
  useEffect(() => {
    if (!isMobile || isFirstVideo) return;

    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting(entry.isIntersecting);
          if (entry.isIntersecting && !shouldLoad) {
            setShouldLoad(true);
          }
        });
      },
      {
        rootMargin: "50px", // Start loading 50px before video enters viewport
        threshold: 0.1
      }
    );

    observer.observe(video);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isMobile, isFirstVideo, shouldLoad, videoRef]);

  // Smart preload strategy
  const getPreloadStrategy = useCallback(() => {
    if (!isMobile) return "metadata";
    if (isSlowConnection()) return "none";
    if (isFirstVideo) return "metadata";
    return shouldLoad ? "metadata" : "none";
  }, [isMobile, isFirstVideo, shouldLoad, isSlowConnection]);

  // Auto-play strategy for mobile
  const shouldAutoPlay = useCallback(() => {
    if (!isMobile) return true;
    if (isSlowConnection()) return false;
    return isIntersecting && shouldLoad;
  }, [isMobile, isIntersecting, shouldLoad, isSlowConnection]);

  return {
    shouldLoad,
    isIntersecting,
    preloadStrategy: getPreloadStrategy(),
    shouldAutoPlay: shouldAutoPlay(),
    isMobile,
    isSlowConnection: isSlowConnection()
  };
};