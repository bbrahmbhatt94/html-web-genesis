
import { useEffect, useRef } from "react";

export const useCountdownTimer = () => {
  const countdownTimerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const timeLeft = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor(timeLeft % (1000 * 60 * 60) / (1000 * 60));
      const seconds = Math.floor(timeLeft % (1000 * 60) / 1000);

      const hoursEl = document.getElementById('hours');
      const minutesEl = document.getElementById('minutes');
      const secondsEl = document.getElementById('seconds');
      if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
      if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
      if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');

      if (countdownTimerRef.current) {
        if (hours === 0 && minutes < 10) {
          countdownTimerRef.current.style.animation = 'pulse 1s infinite';
        } else {
          countdownTimerRef.current.style.animation = 'none';
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return { countdownTimerRef };
};
