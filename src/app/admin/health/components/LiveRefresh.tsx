"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LiveRefresh() {
  const [interval, setRefreshInterval] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    if (interval === 0) return;
    
    const timer = setInterval(() => {
      router.refresh();
    }, interval * 1000);

    return () => clearInterval(timer);
  }, [interval, router]);

  return (
    <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
      <div className="flex items-center gap-2 text-sm text-nova-silver border-r border-white/10 pr-4">
        <RefreshCw className={`w-4 h-4 ${interval > 0 ? "animate-spin text-nova-emerald" : ""}`} />
        Auto Refresh
      </div>
      <div className="flex gap-2">
        {[10, 30, 60].map((sec) => (
          <button
            key={sec}
            onClick={() => setRefreshInterval(sec)}
            className={`text-xs font-bold px-2 py-1 rounded ${
              interval === sec 
                ? "bg-nova-emerald/20 text-nova-emerald border border-nova-emerald/30" 
                : "bg-black/30 text-nova-silver border border-transparent hover:text-white"
            }`}
          >
            {sec}s
          </button>
        ))}
        <button
            onClick={() => setRefreshInterval(0)}
            className={`text-xs font-bold px-2 py-1 rounded ${
              interval === 0 
                ? "bg-white/20 text-white border border-white/30" 
                : "bg-black/30 text-nova-silver border border-transparent hover:text-white"
            }`}
          >
            Manual
        </button>
      </div>
    </div>
  );
}
