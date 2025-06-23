
import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { trackPurchase } from "@/utils/metaPixel";
import { Button } from "@/components/ui/button";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Track the successful purchase conversion
    trackPurchase(19.99, 'USD', 'LuxeVision Premium Collection');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] text-white flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-[#ffd700] to-[#ffed4e] rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            ✓
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-[#ffd700] bg-clip-text text-transparent">
            Order Confirmed!
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            Thank you for your purchase! Your premium video collection is ready for download.
          </p>
        </div>

        <div className="bg-gradient-to-r from-[#2d2d2d] to-[#1a1a1a] p-8 rounded-2xl border border-[rgba(255,215,0,0.2)] mb-8">
          <h2 className="text-2xl font-bold text-[#ffd700] mb-4">What You Get:</h2>
          <ul className="text-left space-y-3 text-gray-300">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-[#ffd700] rounded-full mr-3"></span>
              Access to over 120,000+ premium 4K videos
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-[#ffd700] rounded-full mr-3"></span>
              Full commercial license for all videos
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-[#ffd700] rounded-full mr-3"></span>
              Lifetime access with future updates
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-[#ffd700] rounded-full mr-3"></span>
              High-quality downloads in multiple formats
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <Button 
            asChild 
            className="bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#1a1a1a] px-8 py-3 rounded-full font-bold text-lg hover:shadow-lg mb-4"
          >
            <a 
              href="https://drive.google.com/drive/folders/1pE1hFsl2x2bS25qWanS-JNDITpodkJNv" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Access Your Videos Now
            </a>
          </Button>
          
          <Button asChild variant="outline" className="border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700] hover:text-[#1a1a1a]">
            <Link to="/">
              Return to Home
            </Link>
          </Button>
          
          <p className="text-sm text-gray-400 mt-6">
            Need help? Contact us at support@luxevisionshop.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
