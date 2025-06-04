
import { useEffect } from "react";

export const useScrollAnimations = () => {
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
};
