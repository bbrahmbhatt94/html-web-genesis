
interface HeroSectionProps {
  onCheckout: () => void;
}

export const HeroSection = ({ onCheckout }: HeroSectionProps) => {
  return (
    <section className="hero bg-gradient-to-r from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] text-white pt-36 pb-24 text-center relative overflow-hidden" id="home">
      <div className="container mx-auto px-5">
        <div className="hero-content relative z-10">
          <h1 className="fade-in-up text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-[#ffd700] bg-clip-text text-transparent">Premium 4K Luxury Videos</h1>
          <p className="fade-in-up text-lg md:text-xl mb-8 opacity-90 max-w-3xl mx-auto">Discover over 120,000 stunning 4K HD videos showcasing the world's most luxurious lifestyles, destinations, and experiences.</p>
          
          <div className="stats flex flex-col md:flex-row justify-center gap-6 md:gap-12 my-12">
            <div className="stat animate-on-scroll">
              <span className="stat-number text-3xl md:text-4xl font-bold text-[#ffd700] block">120,000+</span>
              <span className="stat-label opacity-80">Premium Videos</span>
            </div>
            <div className="stat animate-on-scroll">
              <span className="stat-number text-3xl md:text-4xl font-bold text-[#ffd700] block">4K HD</span>
              <span className="stat-label opacity-80">Ultra Quality</span>
            </div>
            <div className="stat animate-on-scroll">
              <span className="stat-number text-3xl md:text-4xl font-bold text-[#ffd700] block">24/7</span>
              <span className="stat-label opacity-80">New Content</span>
            </div>
          </div>

          <button onClick={onCheckout} className="text-xl bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#1a1a1a] px-10 py-4 rounded-full font-bold transition-all hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(255,215,0,0.3)]">
            Explore Collection
          </button>
        </div>
      </div>
    </section>
  );
};
