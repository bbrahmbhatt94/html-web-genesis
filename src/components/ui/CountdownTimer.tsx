
import { useCountdownTimer } from "@/hooks/useCountdownTimer";

export const CountdownTimer = () => {
  const { countdownTimerRef } = useCountdownTimer();

  return (
    <div id="countdown-timer" ref={countdownTimerRef} className="flex justify-center gap-4 font-mono">
      <div className="bg-[#1a1a1a] text-[#ffd700] px-4 py-2 rounded-lg min-w-[60px]">
        <div id="hours" className="text-2xl font-bold">23</div>
        <div className="text-xs">HOURS</div>
      </div>
      <div className="bg-[#1a1a1a] text-[#ffd700] px-4 py-2 rounded-lg min-w-[60px]">
        <div id="minutes" className="text-2xl font-bold">59</div>
        <div className="text-xs">MINUTES</div>
      </div>
      <div className="bg-[#1a1a1a] text-[#ffd700] px-4 py-2 rounded-lg min-w-[60px]">
        <div id="seconds" className="text-2xl font-bold">59</div>
        <div className="text-xs">SECONDS</div>
      </div>
    </div>
  );
};
