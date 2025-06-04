
import { CountdownTimer } from "@/components/ui/CountdownTimer";

interface PricingSectionProps {
  onCheckout: () => void;
  isProcessingPayment: boolean;
}

export const PricingSection = ({ onCheckout, isProcessingPayment }: PricingSectionProps) => {
  return (
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
            
            <button onClick={onCheckout} disabled={isProcessingPayment} className="w-full block text-xl bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#1a1a1a] px-10 py-4 rounded-full font-bold transition-all hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(255,215,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
              {isProcessingPayment ? 'Processing...' : 'Get Instant Access - $19.99'}
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
              <CountdownTimer />
            </div>
            
            <p className="text-sm text-gray-600">
              This exclusive pricing won't last long. Secure your lifetime access now!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
