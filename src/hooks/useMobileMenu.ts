
import { useState, useEffect } from "react";

export const useMobileMenu = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return { mobileMenuOpen, setMobileMenuOpen };
};
