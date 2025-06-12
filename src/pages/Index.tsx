
import { useEffect } from "react";
import { trackViewContent } from "@/utils/metaPixel";
import { useCheckout } from "@/hooks/useCheckout";
import { useScrollAnimations } from "@/hooks/useScrollAnimations";
import { useVideoAutoplay } from "@/hooks/useVideoAutoplay";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/sections/HeroSection";
import { VideoShowcase } from "@/components/sections/VideoShowcase";
import { CTAUrgency } from "@/components/sections/CTAUrgency";
import { Features } from "@/components/sections/Features";
import { TargetAudience } from "@/components/sections/TargetAudience";
import { Categories } from "@/components/sections/Categories";
import { PricingSection } from "@/components/sections/PricingSection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  const { handleCheckout, isProcessingPayment } = useCheckout();
  
  // Initialize hooks for animations and video management
  useScrollAnimations();
  useVideoAutoplay();

  // Track page view on component mount
  useEffect(() => {
    trackViewContent('LuxeVision Home Page', 'Premium Video Collection');
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header onCheckout={handleCheckout} isProcessingPayment={isProcessingPayment} />
      <HeroSection onCheckout={handleCheckout} />
      <VideoShowcase />
      <CTAUrgency onCheckout={handleCheckout} isProcessingPayment={isProcessingPayment} />
      <Features />
      <TargetAudience onCheckout={handleCheckout} isProcessingPayment={isProcessingPayment} />
      <Categories />
      <PricingSection onCheckout={handleCheckout} isProcessingPayment={isProcessingPayment} />
      <ReviewsSection />
      <Footer />
    </div>
  );
};

export default Index;
