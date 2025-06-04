
import { Menu, X } from "lucide-react";
import { useMobileMenu } from "@/hooks/useMobileMenu";

interface HeaderProps {
  onCheckout: () => void;
  isProcessingPayment: boolean;
}

export const Header = ({ onCheckout, isProcessingPayment }: HeaderProps) => {
  const { mobileMenuOpen, setMobileMenuOpen } = useMobileMenu();

  return (
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
        
        <button onClick={onCheckout} disabled={isProcessingPayment} className="hidden md:inline-block bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#1a1a1a] px-6 py-3 rounded-full font-bold transition-all hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(255,215,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
          {isProcessingPayment ? 'Processing...' : 'Get Offer Now'}
        </button>
        
        <div id="mobile-menu" className={`absolute top-full left-0 right-0 bg-[rgba(26,26,26,0.95)] backdrop-blur-lg border-t border-[rgba(255,215,0,0.3)] p-4 ${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <a href="#home" className="block text-white py-4 border-b border-[rgba(255,255,255,0.1)] hover:text-[#ffd700]">Home</a>
          <a href="#categories" className="block text-white py-4 border-b border-[rgba(255,255,255,0.1)] hover:text-[#ffd700]">Categories</a>
          <a href="#pricing" className="block text-white py-4 border-b border-[rgba(255,255,255,0.1)] hover:text-[#ffd700]">Pricing</a>
          <a href="#about" className="block text-white py-4 border-b border-[rgba(255,255,255,0.1)] hover:text-[#ffd700]">About</a>
          <a href="#contact" className="block text-white py-4 border-b border-[rgba(255,255,255,0.1)] hover:text-[#ffd700]">Contact</a>
          <button onClick={onCheckout} disabled={isProcessingPayment} className="mt-4 block w-full text-center bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#1a1a1a] py-3 px-6 rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed">
            {isProcessingPayment ? 'Processing...' : 'Get Offer Now'}
          </button>
        </div>
      </nav>
    </header>
  );
};
