
interface VideoGridProps {
  videos: { source: string }[];
}

export const VideoGrid = ({ videos }: VideoGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
      {videos.map((video, index) => (
        <div key={index} className="w-full animate-on-scroll">
          <div className="relative aspect-[9/16] w-full max-w-[300px] mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-[#ffd700]">
            <video 
              autoPlay 
              muted 
              loop 
              playsInline 
              preload="metadata" 
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
          </div>
        </div>
      ))}
    </div>
  );
};
