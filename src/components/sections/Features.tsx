
export const Features = () => {
  return (
    <section className="features bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] py-24" id="about">
      <div className="container mx-auto px-5">
        <h2 className="section-title text-4xl md:text-5xl text-center font-bold mb-16 text-[#1a1a1a] animate-on-scroll">Why Choose LuxeVision?</h2>
        
        <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          <div className="feature-card bg-white p-8 rounded-3xl shadow-lg text-center transition-all hover:-translate-y-2 hover:shadow-xl border border-[rgba(255,215,0,0.1)] animate-on-scroll">
            <div className="feature-icon w-20 h-20 bg-gradient-to-r from-[#ffd700] to-[#ffed4e] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🎬</div>
            <h3 className="text-2xl font-bold mb-4 text-[#1a1a1a]">Premium 4K Quality</h3>
            <p className="text-gray-600">Every video is shot in stunning 4K resolution, delivering crystal-clear visuals that bring luxury to life with unprecedented detail and clarity.</p>
          </div>
          
          <div className="feature-card bg-white p-8 rounded-3xl shadow-lg text-center transition-all hover:-translate-y-2 hover:shadow-xl border border-[rgba(255,215,0,0.1)] animate-on-scroll">
            <div className="feature-icon w-20 h-20 bg-gradient-to-r from-[#ffd700] to-[#ffed4e] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🏖️</div>
            <h3 className="text-2xl font-bold mb-4 text-[#1a1a1a]">Exclusive Content</h3>
            <p className="text-gray-600">Access rare and exclusive footage of luxury destinations, high-end lifestyles, and premium experiences you won't find anywhere else.</p>
          </div>
          
          <div className="feature-card bg-white p-8 rounded-3xl shadow-lg text-center transition-all hover:-translate-y-2 hover:shadow-xl border border-[rgba(255,215,0,0.1)] animate-on-scroll">
            <div className="feature-icon w-20 h-20 bg-gradient-to-r from-[#ffd700] to-[#ffed4e] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">⚡</div>
            <h3 className="text-2xl font-bold mb-4 text-[#1a1a1a]">Instant Downloads</h3>
            <p className="text-gray-600">Download videos instantly with our high-speed servers. No waiting, no delays – get your premium content when you need it.</p>
          </div>
          
          <div className="feature-card bg-white p-8 rounded-3xl shadow-lg text-center transition-all hover:-translate-y-2 hover:shadow-xl border border-[rgba(255,215,0,0.1)] animate-on-scroll">
            <div className="feature-icon w-20 h-20 bg-gradient-to-r from-[#ffd700] to-[#ffed4e] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🔄</div>
            <h3 className="text-2xl font-bold mb-4 text-[#1a1a1a]">Regular Updates</h3>
            <p className="text-gray-600">Our collection grows daily with fresh content. Stay ahead with the latest luxury trends and destinations from around the world.</p>
          </div>
          
          <div className="feature-card bg-white p-8 rounded-3xl shadow-lg text-center transition-all hover:-translate-y-2 hover:shadow-xl border border-[rgba(255,215,0,0.1)] animate-on-scroll">
            <div className="feature-icon w-20 h-20 bg-gradient-to-r from-[#ffd700] to-[#ffed4e] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">📱</div>
            <h3 className="text-2xl font-bold mb-4 text-[#1a1a1a]">Multi-Device Access</h3>
            <p className="text-gray-600">Stream and download on any device. Perfect for content creators, marketers, and luxury enthusiasts on the go.</p>
          </div>
          
          <div className="feature-card bg-white p-8 rounded-3xl shadow-lg text-center transition-all hover:-translate-y-2 hover:shadow-xl border border-[rgba(255,215,0,0.1)] animate-on-scroll">
            <div className="feature-icon w-20 h-20 bg-gradient-to-r from-[#ffd700] to-[#ffed4e] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-4 text-[#1a1a1a]">Commercial License</h3>
            <p className="text-gray-600">Full commercial rights included. Use our luxury videos for your business, marketing campaigns, or creative projects without restrictions.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
