
interface CTAUrgencyProps {
  onCheckout: () => void;
  isProcessingPayment: boolean;
}

export const CTAUrgency = ({ onCheckout, isProcessingPayment }: CTAUrgencyProps) => {
  return (
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
          <button onClick={onCheckout} disabled={isProcessingPayment} className="text-xl md:text-2xl bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#1a1a1a] px-8 md:px-12 py-4 md:py-5 rounded-full font-bold transition-all hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(255,215,0,0.4)] animate-pulse disabled:opacity-50 disabled:cursor-not-allowed">
            {isProcessingPayment ? 'Processing...' : 'Claim Your 90% Discount Now - $19.99'}
          </button>
          <p className="text-sm md:text-base mt-4 opacity-80">
            🔥 Price increases to $199.99 after this promotion ends
          </p>
        </div>
      </div>
    </section>
  );
};
