
import { useRef } from "react";
import { useMobileVideoOptimization } from "@/hooks/useMobileVideoOptimization";
import videoPoster1 from "@/assets/video-poster-1.jpg";
import videoPoster2 from "@/assets/video-poster-2.jpg";
import videoPoster3 from "@/assets/video-poster-3.jpg";
import videoPoster4 from "@/assets/video-poster-4.jpg";

interface VideoGridProps {
  videos: { source: string }[];
}

const VideoItem = ({ video, index }: { video: { source: string }, index: number }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isFirstVideo = index === 0;
  
  const {
    shouldLoad,
    preloadStrategy,
    shouldAutoPlay,
    isMobile,
    isSlowConnection
  } = useMobileVideoOptimization({ 
    videoRef, 
    index, 
    isFirstVideo 
  });

  const posters = [videoPoster1, videoPoster2, videoPoster3, videoPoster4];
  const poster = posters[index] || posters[0];

  return (
    <div className="w-full animate-on-scroll">
      <div className="relative aspect-[9/16] w-full max-w-[300px] mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-[#ffd700]">
        {shouldLoad ? (
          <video 
            ref={videoRef}
            autoPlay={shouldAutoPlay && !isSlowConnection} 
            muted 
            loop 
            playsInline 
            preload={preloadStrategy}
            poster={poster}
            className="w-full h-full object-cover" 
            onLoadStart={() => console.log(`Video ${index + 1} (${video.source}) load started`)} 
            onLoadedData={() => console.log(`Video ${index + 1} (${video.source}) loaded successfully`)} 
            onError={e => {
              console.error(`Video ${index + 1} (${video.source}) failed to load:`, e);
              console.error('Error details:', e.currentTarget.error);
            }}
          >
            <source src={video.source} type="video/mp4" />
            <p>Your browser doesn't support video playback.</p>
          </video>
        ) : (
          <div className="w-full h-full relative">
            <img 
              src={poster} 
              alt={`Video ${index + 1} preview`}
              className="w-full h-full object-cover"
            />
            {isMobile && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const VideoGrid = ({ videos }: VideoGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
      {videos.map((video, index) => (
        <VideoItem key={index} video={video} index={index} />
      ))}
    </div>
  );
};
