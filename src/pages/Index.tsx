import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackInitiateCheckout, trackViewContent } from "@/utils/metaPixel";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const countdownTimerRef = useRef<HTMLDivElement>(null);

  // Function to handle Stripe checkout with Meta Pixel tracking
  const handleCheckout = () => {
    // Track checkout initiation
    trackInitiateCheckout(19.99, 'USD');
    window.open("https://buy.stripe.com/aFa9ASgRq8E803b4RX2kw00", "_blank");
  };

  // Track page view on component mount
  useEffect(() => {
    trackViewContent('LuxeVision Home Page', 'Premium Video Collection');
  }, []);

  // Function to handle scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
        }
      });
    }, observerOptions);
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
    return () => {
      observer.disconnect();
    };
  }, []);

  // Function to animate numbers in stats
  useEffect(() => {
    const statsObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateNumbers();
          statsObserver.unobserve(entry.target);
        }
      });
    });
    const statsSection = document.querySelector('.stats');
    if (statsSection) {
      statsObserver.observe(statsSection);
    }
    return () => {
      statsObserver.disconnect();
    };
  }, []);

  // Animation for numbers
  const animateNumbers = () => {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
      const text = stat.textContent;
      if (text && text.includes('120,000+')) {
        let count = 0;
        const target = 120000;
        const increment = Math.floor(target / 100);
        const timer = setInterval(() => {
          count += increment;
          if (count >= target) {
            if (stat.textContent) stat.textContent = '120,000+';
            clearInterval(timer);
          } else {
            if (stat.textContent) stat.textContent = Math.floor(count).toLocaleString() + '+';
          }
        }, 20);
      }
    });
  };

  // Countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // Set to midnight

      const timeLeft = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor(timeLeft % (1000 * 60 * 60) / (1000 * 60));
      const seconds = Math.floor(timeLeft % (1000 * 60) / 1000);

      // Update the display
      const hoursEl = document.getElementById('hours');
      const minutesEl = document.getElementById('minutes');
      const secondsEl = document.getElementById('seconds');
      if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
      if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
      if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');

      // Add pulsing effect when time is running low
      if (countdownTimerRef.current) {
        if (hours === 0 && minutes < 10) {
          countdownTimerRef.current.style.animation = 'pulse 1s infinite';
        } else {
          countdownTimerRef.current.style.animation = 'none';
        }
      }
    };

    // Update immediately and then every second
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const mobileMenu = document.getElementById('mobile-menu');
      const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
      if (mobileMenu && mobileMenuToggle && !mobileMenu.contains(e.target as Node) && !mobileMenuToggle.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Handle video overlay clicks
  useEffect(() => {
    const videoOverlays = document.querySelectorAll('.video-overlay');
    videoOverlays.forEach(overlay => {
      overlay.addEventListener('click', () => {
        const container = overlay.closest('.video-container');
        if (container) {
          const video = container.querySelector('video');
          if (video) {
            video.play();
            overlay.classList.add('hidden');

            // Show overlay again when video pauses or ends
            video.addEventListener('pause', () => {
              overlay.classList.remove('hidden');
            });
            video.addEventListener('ended', () => {
              overlay.classList.remove('hidden');
            });
          }
        }
      });
    });
  }, []);
  return <div className="min-h-screen overflow-x-hidden">
      <header className="fixed w-full top-0 z-50 bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] text-white py-4 backdrop-blur-lg">
        <nav className="container mx-auto px-5 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-[#ffd700] to-[#ffed4e] bg-clip-text text-transparent">LuxeVision</div>
          
          <ul className="hidden md:flex gap-8 list-none">
            <li><a href="#home" className="text-white hover:text-[#ffd700] transition-colors">Home</a></li>
            <li><a href="#categories" className="text-white hover:text-[#ffd700] transition-colors">Categories</a></li>
            <li><a href="#pricing" className="text-white hover:text-[#ffd700] transition-colors">Pricing</a></li>
            <li><a href="#about" className="text-white hover:text-[#ffd700] transition-colors">About</a></li>
            <li><a href="#contact" className="text-white hover:text-[#ffd700] transition-colors">Contact</a></li>
          </ul>
          
          <button id="mobile-menu-toggle" className="md:hidden text-white text-2xl bg-transparent border-none cursor-pointer p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
          
          <button onClick={handleCheckout} className="hidden md:inline-block bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#1a1a1a] px-6 py-3 rounded-full font-bold transition-all hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(255,215,0,0.3)]">
            Get Offer Now
          </button>
          
          <div id="mobile-menu" className={`absolute top-full left-0 right-0 bg-[rgba(26,26,26,0.95)] backdrop-blur-lg border-t border-[rgba(255,215,0,0.3)] p-4 ${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
            <a href="#home" className="block text-white py-4 border-b border-[rgba(255,255,255,0.1)] hover:text-[#ffd700]">Home</a>
            <a href="#categories" className="block text-white py-4 border-b border-[rgba(255,255,255,0.1)] hover:text-[#ffd700]">Categories</a>
            <a href="#pricing" className="block text-white py-4 border-b border-[rgba(255,255,255,0.1)] hover:text-[#ffd700]">Pricing</a>
            <a href="#about" className="block text-white py-4 border-b border-[rgba(255,255,255,0.1)] hover:text-[#ffd700]">About</a>
            <a href="#contact" className="block text-white py-4 border-b border-[rgba(255,255,255,0.1)] hover:text-[#ffd700]">Contact</a>
            <button onClick={handleCheckout} className="mt-4 block w-full text-center bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#1a1a1a] py-3 px-6 rounded-full font-bold">
              Get Offer Now
            </button>
          </div>
        </nav>
      </header>

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

            <button onClick={handleCheckout} className="text-xl bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#1a1a1a] px-10 py-4 rounded-full font-bold transition-all hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(255,215,0,0.3)]">
              Explore Collection
            </button>
          </div>
        </div>
      </section>

      <section className="video-showcase bg-gradient-to-r from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] text-white py-12 md:py-24" id="showcase">
        <div className="container mx-auto px-4 md:px-5">
          <h2 className="section-title text-3xl md:text-4xl lg:text-5xl text-center font-bold mb-4 md:mb-6 text-white animate-on-scroll">Experience Premium Quality</h2>
          <p className="text-center text-lg md:text-xl text-gray-300 mb-8 md:mb-12 max-w-3xl mx-auto animate-on-scroll px-4">
            See the stunning 4K quality that sets LuxeVision apart
          </p>
            
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
            {[{
            poster: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=250&h=350&fit=crop&crop=center",
            source: "/home-2.mp4"
          }, {
            poster: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=250&h=350&fit=crop&crop=center",
            source: "/home-3.mp4"
          }, {
            poster: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=250&h=350&fit=crop&crop=center",
            source: "/home-4.mp4"
          }, {
            poster: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=250&h=350&fit=crop&crop=center",
            source: "/home-5.mp4"
          }].map((video, index) => <div key={index} className="w-full animate-on-scroll">
                <div className="relative aspect-[9/16] w-full max-w-[300px] mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-[#ffd700]">
                  <video poster={video.poster} controls preload="metadata" className="w-full h-full object-cover" playsInline controlsList="nodownload">
                    <source src={video.source} type="video/mp4" />
                    <p>Your browser doesn't support video playback.</p>
                  </video>
                  <div className="video-overlay absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center cursor-pointer transition-opacity hover:bg-opacity-20">
                    <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[12px] border-l-black border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                    </div>
                  </div>
                </div>
              </div>)}
          </div>
            
          <div className="text-center mt-8 md:mt-10 px-4">
            <a href="#pricing" className="inline-block text-lg md:text-xl bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#1a1a1a] px-6 md:px-10 py-3 md:py-4 rounded-full font-bold transition-all hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(255,215,0,0.3)]">
              Access All Videos
            </a>
          </div>
        </div>
      </section>

      <section className="cta-urgency bg-gradient-to-r from-[#e74c3c] to-[#c0392b] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="container mx-auto px-4 md:px-5 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-on-scroll">
              ⚡ Limited Time Offer Expires Soon! ⚡
            </h2>
            <p className="text-xl md:text-2xl mb-6 opacity-90 animate-on-scroll">
              Don't miss out on 90% OFF our premium collection
            </p>
            <div className="bg-black bg-opacity-30 rounded-2xl p-6 mb-8 animate-on-scroll">
              <p className="text-lg md:text-xl mb-4">
                <span className="text-[#ffd700] font-bold">Only 47 spots left</span> at this exclusive price!
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#ffd700] rounded-full animate-pulse"></span>
                  <span>120,000+ Premium Videos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#ffd700] rounded-full animate-pulse"></span>
                  <span>4K HD Quality</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#ffd700] rounded-full animate-pulse"></span>
                  <span>Lifetime Access</span>
                </div>
              </div>
            </div>
            <button onClick={handleCheckout} className="text-xl md:text-2xl bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#1a1a1a] px-8 md:px-12 py-4 md:py-5 rounded-full font-bold transition-all hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(255,215,0,0.4)] animate-pulse">
              Claim Your 90% Discount Now - $19.99
            </button>
            <p className="text-sm md:text-base mt-4 opacity-80">
              🔥 Price increases to $199.99 after this promotion ends
            </p>
          </div>
        </div>
      </section>

      <section className="categories bg-[#1a1a1a] text-white py-24" id="categories">
        <div className="container mx-auto px-5">
          <h2 className="section-title text-4xl md:text-5xl text-center font-bold mb-16 text-white animate-on-scroll">Luxury Categories</h2>
          
          <div className="categories-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-12">
            {[{
            title: "Exotic Destinations",
            count: "15,000+"
          }, {
            title: "Luxury Hotels & Resorts",
            count: "12,000+"
          }, {
            title: "Private Jets & Yachts",
            count: "8,500+"
          }, {
            title: "Fine Dining",
            count: "10,000+"
          }, {
            title: "Luxury Cars",
            count: "9,200+"
          }, {
            title: "Fashion & Jewelry",
            count: "11,500+"
          }, {
            title: "Wellness & Spa",
            count: "7,800+"
          }, {
            title: "Architecture & Design",
            count: "13,000+"
          }, {
            title: "Events & Galas",
            count: "6,500+"
          }, {
            title: "Adventure & Sports",
            count: "8,900+"
          }, {
            title: "Art & Culture",
            count: "9,600+"
          }, {
            title: "Lifestyle & Beauty",
            count: "12,800+"
          }, {
            title: "Fitness & Gym",
            count: "8,400+"
          }, {
            title: "Premium Lifestyle",
            count: "9,200+"
          }].map((category, index) => <div key={index} className="category-card bg-gradient-to-r from-[#2d2d2d] to-[#1a1a1a] p-6 rounded-xl text-center transition-all hover:-translate-y-1 hover:border-[#ffd700] border border-[rgba(255,215,0,0.2)] relative overflow-hidden animate-on-scroll">
                <h3 className="text-xl font-bold mb-2 text-[#ffd700]">{category.title}</h3>
                <p className="category-count opacity-80">{category.count} Videos</p>
              </div>)}
          </div>
        </div>
      </section>

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

      <section className="categories bg-[#1a1a1a] text-white py-24" id="categories">
        <div className="container mx-auto px-5">
          <h2 className="section-title text-4xl md:text-5xl text-center font-bold mb-16 text-white animate-on-scroll">Luxury Categories</h2>
          
          <div className="categories-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-12">
            {[{
            title: "Exotic Destinations",
            count: "15,000+"
          }, {
            title: "Luxury Hotels & Resorts",
            count: "12,000+"
          }, {
            title: "Private Jets & Yachts",
            count: "8,500+"
          }, {
            title: "Fine Dining",
            count: "10,000+"
          }, {
            title: "Luxury Cars",
            count: "9,200+"
          }, {
            title: "Fashion & Jewelry",
            count: "11,500+"
          }, {
            title: "Wellness & Spa",
            count: "7,800+"
          }, {
            title: "Architecture & Design",
            count: "13,000+"
          }, {
            title: "Events & Galas",
            count: "6,500+"
          }, {
            title: "Adventure & Sports",
            count: "8,900+"
          }, {
            title: "Art & Culture",
            count: "9,600+"
          }, {
            title: "Lifestyle & Beauty",
            count: "12,800+"
          }, {
            title: "Fitness & Gym",
            count: "8,400+"
          }, {
            title: "Premium Lifestyle",
            count: "9,200+"
          }].map((category, index) => <div key={index} className="category-card bg-gradient-to-r from-[#2d2d2d] to-[#1a1a1a] p-6 rounded-xl text-center transition-all hover:-translate-y-1 hover:border-[#ffd700] border border-[rgba(255,215,0,0.2)] relative overflow-hidden animate-on-scroll">
                <h3 className="text-xl font-bold mb-2 text-[#ffd700]">{category.title}</h3>
                <p className="category-count opacity-80">{category.count} Videos</p>
              </div>)}
          </div>
        </div>
      </section>

      <section className="pricing bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] py-24" id="pricing">
        <div className="container mx-auto px-5">
          <h2 className="section-title text-4xl md:text-5xl text-center font-bold mb-16 text-[#1a1a1a] animate-on-scroll">Get Lifetime Access</h2>
          
          <div className="flex justify-center mt-12">
            <div className="pricing-card featured bg-white p-12 rounded-3xl shadow-xl text-center max-w-lg border-2 border-[#ffd700] animate-on-scroll transform scale-105">
              <h3 className="plan-name text-2xl font-bold mb-4 text-[#1a1a1a]">Lifetime Access</h3>
              <div className="plan-price text-5xl font-bold text-[#ffd700]">$19.99</div>
              <div className="plan-period text-gray-600 mb-8">one-time payment</div>
              
              <ul className="plan-features mb-8">
                <li className="py-2 text-gray-600 before:content-['✓'] before:text-[#ffd700] before:font-bold before:mr-2">Access to all 120,000+ videos</li>
                <li className="py-2 text-gray-600 before:content-['✓'] before:text-[#ffd700] before:font-bold before:mr-2">Premium 4K HD quality</li>
                <li className="py-2 text-gray-600 before:content-['✓'] before:text-[#ffd700] before:font-bold before:mr-2">All 15 luxury categories</li>
                <li className="py-2 text-gray-600 before:content-['✓'] before:text-[#ffd700] before:font-bold before:mr-2">Unlimited downloads</li>
                <li className="py-2 text-gray-600 before:content-['✓'] before:text-[#ffd700] before:font-bold before:mr-2">Full commercial license</li>
                <li className="py-2 text-gray-600 before:content-['✓'] before:text-[#ffd700] before:font-bold before:mr-2">Lifetime updates</li>
                <li className="py-2 text-gray-600 before:content-['✓'] before:text-[#ffd700] before:font-bold before:mr-2">No monthly fees ever</li>
              </ul>
              
              <button onClick={handleCheckout} className="w-full block text-xl bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#1a1a1a] px-10 py-4 rounded-full font-bold transition-all hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(255,215,0,0.3)]">
                Get Instant Access - $19.99
              </button>
              
              <p className="text-sm text-gray-600 mt-4">🔒 Secure payment processing available</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-white to-[#f8f9fa] p-8 rounded-2xl shadow-lg max-w-xl mx-auto">
              <h3 className="text-xl font-bold mb-4 text-[#1a1a1a]">🎉 Limited Time Offer</h3>
              <p className="text-lg text-gray-600 mb-4">
                Regular price: <span className="line-through text-gray-400">$199.99</span>
              </p>
              <p className="text-xl font-bold text-[#ffd700]">
                Today only: $19.99 (90% OFF!)
              </p>
              
              <div className="my-6">
                <p className="text-[#e74c3c] font-bold mb-2">⏰ Offer expires in:</p>
                <div id="countdown-timer" ref={countdownTimerRef} className="flex justify-center gap-4 font-mono">
                  <div className="bg-[#1a1a1a] text-[#ffd700] px-4 py-2 rounded-lg min-w-[60px]">
                    <div id="hours" className="text-2xl font-bold">23</div>
                    <div className="text-xs">HOURS</div>
                  </div>
                  <div className="bg-[#1a1a1a] text-[#ffd700] px-4 py-2 rounded-lg min-w-[60px]">
                    <div id="minutes" className="text-2xl font-bold">59</div>
                    <div className="text-xs">MINUTES</div>
                  </div>
                  <div className="bg-[#1a1a1a] text-[#ffd700] px-4 py-2 rounded-lg min-w-[60px]">
                    <div id="seconds" className="text-2xl font-bold">59</div>
                    <div className="text-xs">SECONDS</div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                This exclusive pricing won't last long. Secure your lifetime access now!
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#1a1a1a] text-white py-16 pt-24 pb-6" id="contact">
        <div className="container mx-auto px-5">
          <div className="footer-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="footer-section">
              <h3 className="text-xl font-bold text-[#ffd700] mb-4">LuxeVision</h3>
              <p className="text-gray-300">The world's premier destination for luxury lifestyle videos. Experience the extraordinary in stunning 4K quality.</p>
            </div>
            
            <div className="footer-section">
              <h3 className="text-xl font-bold text-[#ffd700] mb-4">Quick Links</h3>
              <a href="#categories" className="block mb-2 text-gray-300 hover:text-[#ffd700]">Browse Categories</a>
              <a href="#pricing" className="block mb-2 text-gray-300 hover:text-[#ffd700]">Pricing Plans</a>
              <a href="#about" className="block mb-2 text-gray-300 hover:text-[#ffd700]">About Us</a>
              <a href="#contact" className="block mb-2 text-gray-300 hover:text-[#ffd700]">Contact</a>
            </div>
            
            <div className="footer-section">
              <h3 className="text-xl font-bold text-[#ffd700] mb-4">Support</h3>
              <a href="#" className="block mb-2 text-gray-300 hover:text-[#ffd700]">Help Center</a>
              <a href="#" className="block mb-2 text-gray-300 hover:text-[#ffd700]">Download Guide</a>
              <a href="#" className="block mb-2 text-gray-300 hover:text-[#ffd700]">License Terms</a>
              <a href="#" className="block mb-2 text-gray-300 hover:text-[#ffd700]">Technical Support</a>
            </div>
            
            <div className="footer-section">
              <h3 className="text-xl font-bold text-[#ffd700] mb-4">Connect</h3>
              <a href="#" className="block mb-2 text-gray-300 hover:text-[#ffd700]">support@luxevisionshop.com</a>
              <a href="#" className="block mb-2 text-gray-300 hover:text-[#ffd700]">+1 (555) 123-4567</a>
              <a href="#" className="block mb-2 text-gray-300 hover:text-[#ffd700]">Follow Us</a>
            </div>
          </div>
          
          <div className="footer-bottom text-center pt-8 border-t border-gray-800">
            <p className="text-gray-500">&copy; 2025 LuxeVision. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;
