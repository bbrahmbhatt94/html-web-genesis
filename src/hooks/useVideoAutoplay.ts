
import { useEffect } from "react";

export const useVideoAutoplay = () => {
  useEffect(() => {
    const videoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          video.play().catch(e => {
            console.log('Autoplay prevented:', e);
          });
        } else {
          video.pause();
        }
      });
    }, {
      threshold: 0.5
    });

    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      videoObserver.observe(video);

      video.addEventListener('loadstart', () => {
        console.log(`Video ${video.src} started loading`);
      });
      video.addEventListener('loadeddata', () => {
        console.log(`Video ${video.src} loaded successfully`);
      });
      video.addEventListener('error', e => {
        console.error(`Video ${video.src} failed to load:`, e);
        console.error('Video error details:', video.error);
      });
    });

    return () => {
      videoObserver.disconnect();
    };
  }, []);
};
