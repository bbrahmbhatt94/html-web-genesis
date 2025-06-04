
interface TargetAudienceProps {
  onCheckout: () => void;
  isProcessingPayment: boolean;
}

export const TargetAudience = ({ onCheckout, isProcessingPayment }: TargetAudienceProps) => {
  const targetCards = [
    {
      icon: "🏡",
      title: "Real Estate Agents",
      description: "Showcase luxury properties with stunning lifestyle footage that sells dreams, not just homes.",
      features: [
        "High-end property marketing videos",
        "Luxury lifestyle brand positioning",
        "Premium client presentations",
        "Social media content that converts"
      ]
    },
    {
      icon: "📱",
      title: "Instagram Theme Pages",
      description: "Build massive followings with premium content that stops the scroll and drives engagement.",
      features: [
        "Daily luxury lifestyle posts",
        "Story content that captivates",
        "Reels that go viral",
        "Brand partnership opportunities"
      ]
    },
    {
      icon: "🎭",
      title: "Faceless Content Creators",
      description: "Create compelling content without showing your face using our premium B-roll footage.",
      features: [
        "YouTube automation channels",
        "TikTok compilation videos",
        "Motivational content creation",
        "Passive income opportunities"
      ]
    },
    {
      icon: "💪",
      title: "Fitness & Gym Owners",
      description: "Inspire transformation with luxury fitness content that motivates and attracts premium clients.",
      features: [
        "Premium gym marketing videos",
        "Luxury fitness lifestyle content",
        "High-end trainer branding",
        "Motivational social media posts"
      ]
    },
    {
      icon: "✨",
      title: "Luxury Lifestyle Brands",
      description: "Elevate your brand with authentic luxury content that resonates with affluent audiences.",
      features: [
        "Premium brand storytelling",
        "Luxury product launches",
        "High-end marketing campaigns",
        "Affluent audience targeting"
      ]
    },
    {
      icon: "🎬",
      title: "Digital Marketing Agencies",
      description: "Deliver premium results for luxury clients with our exclusive high-end video collection.",
      features: [
        "Client campaign materials",
        "Premium ad creatives",
        "Luxury brand consulting",
        "High-ROI content strategies"
      ]
    }
  ];

  return (
    <section className="perfect-for bg-gradient-to-r from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] text-white py-24">
      <div className="container mx-auto px-5">
        <h2 className="section-title text-4xl md:text-5xl text-center font-bold mb-6 text-white animate-on-scroll">Perfect For</h2>
        <p className="text-center text-xl text-gray-300 mb-16 max-w-3xl mx-auto animate-on-scroll">
          Transform your content strategy with premium luxury videos that captivate and convert
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {targetCards.map((card, index) => (
            <div key={index} className="target-card bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] p-8 rounded-2xl border border-[rgba(255,215,0,0.2)] transition-all hover:-translate-y-2 hover:border-[#ffd700] animate-on-scroll">
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="text-2xl font-bold mb-4 text-[#ffd700]">{card.title}</h3>
              <p className="text-gray-300 mb-4">{card.description}</p>
              <ul className="text-sm text-gray-400 space-y-2">
                {card.features.map((feature, featureIndex) => (
                  <li key={featureIndex}>• {feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-[#2d2d2d] to-[#1a1a1a] p-8 rounded-2xl border border-[rgba(255,215,0,0.2)] max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-[#ffd700] mb-4">Ready to Transform Your Content?</h3>
            <p className="text-xl text-gray-300 mb-6">
              Join thousands of successful creators, agencies, and businesses who trust LuxeVision for their premium content needs.
            </p>
            <button onClick={onCheckout} disabled={isProcessingPayment} className="text-xl bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#1a1a1a] px-10 py-4 rounded-full font-bold transition-all hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(255,215,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
              {isProcessingPayment ? 'Processing...' : 'Start Creating Premium Content - $19.99'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
