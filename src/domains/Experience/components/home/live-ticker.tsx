"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useActivity } from "@/domains/Realtime/hooks/useActivity";

const STATIC_TICKER_ITEMS = [
  { id: '1', title: "Marketplace Milestone: 10,000 verified transactions", type: "MILESTONE" },
  { id: '2', title: "Trending Now: Smart Watch Elite", type: "TRENDING" },
  { id: '3', title: "Premium Collection 'Modern Living' just dropped", type: "ANNOUNCEMENT" },
  { id: '4', title: "New arrival: Original 'Girl with Balloon' by Banksy", type: "NEW_ARRIVAL" },
];

export function LiveTicker({ liveActivityEnabled = false }: { liveActivityEnabled?: boolean }) {
  const { feed, connectionState } = useActivity(20); // Keep max 20 items in memory
  const displayItems = React.useMemo(() => {
    if (liveActivityEnabled) {
      if (feed.length > 0) {
        return feed.map(f => ({ id: f.id, title: f.title, type: f.type }));
      } else {
        // If feed is empty but realtime is on, show a 'Waiting for activity...' or just static
        return [{ id: 'live-wait', title: 'Listening for live global activity...', type: 'SYSTEM' }, ...STATIC_TICKER_ITEMS];
      }
    } else {
      return STATIC_TICKER_ITEMS;
    }
  }, [feed, liveActivityEnabled]);

  return (
    <div className="w-full bg-black/60 border-b border-white/5 py-2 overflow-hidden flex items-center relative h-10">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black/80 to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black/80 to-transparent z-10" />
      
      <div className="flex items-center absolute left-4 z-20 gap-2">
        <span className={`w-2 h-2 rounded-full ${liveActivityEnabled && connectionState === 'Connected' ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]' : liveActivityEnabled && connectionState === 'Reconnecting' ? 'bg-orange-500 animate-pulse' : 'bg-nova-slate'}`} />
        <span className="text-[10px] uppercase font-bold tracking-widest text-nova-silver hidden md:inline-block">
          {liveActivityEnabled ? 'LIVE' : 'MARKET'}
        </span>
      </div>

      {/* Marquee Animation */}
      <motion.div 
        className="flex whitespace-nowrap pl-24"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ ease: "linear", duration: 40, repeat: Infinity }}
      >
        {[...displayItems, ...displayItems, ...displayItems].map((item, index) => (
          <div key={`${item.id}-${index}`} className="flex items-center mx-6 text-sm font-medium text-nova-silver/80">
            {item.type === 'BID' && <span className="mr-2">🔥</span>}
            {item.type === 'PURCHASE' && <span className="mr-2">💰</span>}
            {item.type === 'REVIEW' && <span className="mr-2">⭐</span>}
            {item.type === 'USER_JOINED' && <span className="mr-2">👋</span>}
            {item.type === 'SYSTEM' && <span className="mr-2">⚡</span>}
            <span className={item.id.startsWith('mock-') || item.id === 'live-wait' ? 'text-white' : ''}>
              {item.title}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
