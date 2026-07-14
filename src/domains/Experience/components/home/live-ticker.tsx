"use client";

import React from "react";
import { motion } from "framer-motion";
import { useActivity } from "@/domains/Realtime/hooks/useActivity";

const STATIC_TICKER_ITEMS = [
  { id: '1', title: "231 people viewing laptops", icon: "🟢" },
  { id: '2', title: "54 orders completed today", icon: "🚚" },
  { id: '3', title: "8,421 active shoppers", icon: "⭐" },
  { id: '4', title: "1,102 verified vendors", icon: "🏪" },
  { id: '5', title: "Secure checkout", icon: "💳" },
  { id: '6', title: "PCI Compliant", icon: "🔒" },
  { id: '7', title: "Ships nationwide", icon: "🇰🇪" },
];

export function LiveTicker({ liveActivityEnabled = false }: { liveActivityEnabled?: boolean }) {
  const { feed, connectionState } = useActivity(20);

  const displayItems = React.useMemo(() => {
    if (liveActivityEnabled && feed.length > 0) {
      return feed.map(f => ({ 
        id: f.id, 
        title: f.title, 
        icon: f.type === 'BID' ? "🔥" : f.type === 'PURCHASE' ? "💰" : f.type === 'REVIEW' ? "⭐" : f.type === 'USER_JOINED' ? "👋" : "⚡" 
      }));
    }
    return STATIC_TICKER_ITEMS;
  }, [feed, liveActivityEnabled]);

  return (
    <div className="w-full bg-surface border-y border-border py-2 overflow-hidden flex items-center relative h-12 shadow-soft z-z-base">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-surface to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-surface to-transparent z-10" />
      
      <div className="flex items-center absolute left-6 z-20 gap-2 bg-surface px-2 rounded-full border border-border shadow-soft">
        <span className={`w-2 h-2 rounded-full ${liveActivityEnabled && connectionState === 'Connected' ? 'bg-success animate-pulse' : liveActivityEnabled && connectionState === 'Reconnecting' ? 'bg-warning animate-pulse' : 'bg-muted'}`} />
        <span className="text-[10px] uppercase font-bold tracking-widest text-muted hidden md:inline-block pr-1">
          {liveActivityEnabled ? 'NOVA LIVE' : 'MARKET'}
        </span>
      </div>

      {/* Marquee Animation */}
      <motion.div 
        className="flex whitespace-nowrap pl-40"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ ease: "linear", duration: 50, repeat: Infinity }}
      >
        {[...displayItems, ...displayItems, ...displayItems, ...displayItems].map((item, index) => (
          <div key={`${item.id}-${index}`} className="flex items-center mx-8 text-sm font-medium text-foreground">
            <span className="mr-2 text-base">{item.icon}</span>
            <span>{item.title}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
