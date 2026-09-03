"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function AuctionCountdown({ endTimeStr }: { endTimeStr: string }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const target = new Date(endTimeStr).getTime();

    const updateTime = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ d, h, m, s });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [endTimeStr]);

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-2 text-nova-silver animate-pulse">
        <Clock className="w-5 h-5" /> Calculating...
      </div>
    );
  }

  if (timeLeft.d === 0 && timeLeft.h === 0 && timeLeft.m === 0 && timeLeft.s === 0) {
    return <span className="text-red-400 font-bold uppercase tracking-wider">Ended</span>;
  }

  return (
    <div className="flex items-center gap-3">
      <Clock className="w-5 h-5 text-[var(--color-primary)]" />
      <div className="flex gap-2 text-lg font-bold text-white font-mono">
        {timeLeft.d > 0 && (
          <div className="flex flex-col items-center">
            <span>{timeLeft.d.toString().padStart(2, "0")}</span>
            <span className="text-[10px] text-nova-slate uppercase font-sans tracking-wider">Days</span>
          </div>
        )}
        {timeLeft.d > 0 && <span className="text-nova-slate mt-1">:</span>}
        <div className="flex flex-col items-center">
          <span>{timeLeft.h.toString().padStart(2, "0")}</span>
          <span className="text-[10px] text-nova-slate uppercase font-sans tracking-wider">Hrs</span>
        </div>
        <span className="text-nova-slate mt-1">:</span>
        <div className="flex flex-col items-center">
          <span>{timeLeft.m.toString().padStart(2, "0")}</span>
          <span className="text-[10px] text-nova-slate uppercase font-sans tracking-wider">Min</span>
        </div>
        <span className="text-nova-slate mt-1">:</span>
        <div className="flex flex-col items-center text-[var(--color-accent)] drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          <span>{timeLeft.s.toString().padStart(2, "0")}</span>
          <span className="text-[10px] text-[var(--color-accent)] opacity-70 uppercase font-sans tracking-wider">Sec</span>
        </div>
      </div>
    </div>
  );
}