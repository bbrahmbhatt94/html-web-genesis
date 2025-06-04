
export const Footer = () => {
  return (
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
  );
};
