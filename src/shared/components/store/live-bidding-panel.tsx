"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedButton } from "../ui/animated-button";
import { Clock, TrendingUp, Users, ShieldCheck } from "lucide-react";
import Pusher from "pusher-js";

interface LiveBiddingPanelProps {
  auctionId: string;
  initialBid: string;
  initialEndTime: string;
  reserveMet: boolean;
}

export function LiveBiddingPanel({ auctionId, initialBid, initialEndTime, reserveMet }: LiveBiddingPanelProps) {
  const [currentBid, setCurrentBid] = useState(initialBid);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [activeBidders, setActiveBidders] = useState(1);
  const [isReserveMet, setIsReserveMet] = useState(reserveMet);
  const [recentlyUpdated, setRecentlyUpdated] = useState(false);

  useEffect(() => {
    // 1. Connect to Realtime Engine (Pusher)
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || "", {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
    });

    const channel = pusher.subscribe(`auction-${auctionId}`);
    const presenceChannel = pusher.subscribe(`presence-auction-${auctionId}`);

    channel.bind("bid-placed", (data: { amount: string }) => {
      setCurrentBid(data.amount);
      setRecentlyUpdated(true);
      setTimeout(() => setRecentlyUpdated(false), 1000);
      
      // Assume reserve met if price passes a hidden threshold (server sends this flag realistically)
      setIsReserveMet(true); 
    });

    channel.bind("time-extended", (data: { newEndTime: string }) => {
      setEndTime(data.newEndTime);
    });

    presenceChannel.bind("user-entered", () => {
      setActiveBidders(prev => prev + 1);
    });
    
    presenceChannel.bind("user-left", () => {
      setActiveBidders(prev => Math.max(1, prev - 1));
    });

    return () => {
      pusher.unsubscribe(`auction-${auctionId}`);
      pusher.unsubscribe(`presence-auction-${auctionId}`);
    };
  }, [auctionId]);

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/10 sticky top-24">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-nova-blue" />
          Live Auction
        </h3>
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-nova-silver">{activeBidders} Active</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Current Bid Display */}
        <div className="bg-black/30 p-4 rounded-2xl border border-white/5 text-center relative overflow-hidden">
          <AnimatePresence>
            {recentlyUpdated && (
              <motion.div 
                initial={{ opacity: 0.8, scale: 0.95 }}
                animate={{ opacity: 0, scale: 1.1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-emerald-500/20 z-0"
              />
            )}
          </AnimatePresence>
          <p className="text-sm text-nova-silver mb-1 relative z-10">Current Bid</p>
          <motion.p 
            key={currentBid}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-bold text-white tracking-tight relative z-10"
          >
            ${currentBid}
          </motion.p>
          
          <div className="mt-3 flex justify-center">
            {isReserveMet ? (
              <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Reserve Met
              </span>
            ) : (
              <span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">
                Reserve Not Met
              </span>
            )}
          </div>
        </div>

        {/* Action Area */}
        <div className="space-y-3">
          <AnimatedButton className="w-full h-12 text-lg">
            Place Bid
          </AnimatedButton>
          <AnimatedButton variant="outline" className="w-full h-12 text-sm border-white/10 hover:bg-white/5">
            Set Proxy Bid (Max)
          </AnimatedButton>
        </div>

        {/* Trust Indicators */}
        <div className="pt-4 border-t border-white/10 flex justify-between text-xs text-nova-silver">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Ends: {new Date(endTime).toLocaleTimeString()}
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Authenticated
          </span>
        </div>
      </div>
    </div>
  );
}
