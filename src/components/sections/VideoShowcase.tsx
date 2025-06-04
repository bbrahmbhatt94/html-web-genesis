
import { VideoGrid } from "@/components/ui/VideoGrid";

export const VideoShowcase = () => {
  const videos = [
    { source: "/home-2.mp4" },
    { source: "/home-3.mp4" },
    { source: "/home-4.mp4" },
    { source: "/home-5.mp4" }
  ];

  return (
    <section className="video-showcase bg-gradient-to-r from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] text-white py-12 md:py-24" id="showcase">
      <div className="container mx-auto px-4 md:px-5">
        <h2 className="section-title text-3xl md:text-4xl lg:text-5xl text-center font-bold mb-4 md:mb-6 text-white animate-on-scroll">Experience Premium Quality</h2>
        <p className="text-center text-lg md:text-xl text-gray-300 mb-8 md:mb-12 max-w-3xl mx-auto animate-on-scroll px-4">
          See the stunning 4K quality that sets LuxeVision apart
        </p>
          
        <VideoGrid videos={videos} />
          
        <div className="text-center mt-8 md:mt-10 px-4">
          <a href="#pricing" className="inline-block text-lg md:text-xl bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#1a1a1a] px-6 md:px-10 py-3 md:py-4 rounded-full font-bold transition-all hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(255,215,0,0.3)]">
            Access All Videos
          </a>
        </div>
      </div>
    </section>
  );
};
