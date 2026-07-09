"use client";

import { useAuction } from "@/domains/Realtime/hooks/useAuction";
import { usePresence } from "@/domains/Realtime/hooks/usePresence";
import { ChannelRegistry } from "@/domains/Realtime/contracts/ChannelRegistry";
import { Clock, History, Gavel, User as UserIcon, Eye } from "lucide-react";
import { BidForm } from "./bid-form";
import Link from "next/link";
import { useEffect, useState } from "react";

interface AuctionLiveViewProps {
  auctionId: string;
  productName: string;
  initialHighestBid: number;
  initialHighestBidderId: string | null;
  initialEndTime: string;
  initialBidHistory: Array<{ id?: string, bidderId: string, bidderName: string, amount: number, timestamp: string }>;
  startingBid: number;
  status: string;
  userId: string | null;
}

export function AuctionLiveView({
  auctionId,
  productName,
  initialHighestBid,
  initialHighestBidderId,
  initialEndTime,
  initialBidHistory,
  startingBid,
  status,
  userId
}: AuctionLiveViewProps) {
  // Client-side countdown state
  const [now, setNow] = useState(new Date().getTime());
  
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date().getTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { auctionState: auction, placeOptimisticBid } = useAuction(auctionId, {
    currentBid: initialHighestBid,
    highestBidderId: initialHighestBidderId,
    endTime: initialEndTime,
    status: status,
    winnerId: null,
    bidHistory: initialBidHistory.map(b => ({ amount: b.amount, timestamp: b.timestamp }))
  });

  const presence = usePresence(ChannelRegistry.presenceAuction(auctionId));

  const endTimeMs = new Date(auction.endTime).getTime();
  const isEndingSoon = endTimeMs - now < 86400000 && endTimeMs > now;
  const hasEnded = now > endTimeMs || status !== "LIVE";
  
  // Format countdown
  const timeLeft = Math.max(0, endTimeMs - now);
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  
  const formattedCountdown = hasEnded ? "Ended" : `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const currentBid = auction.currentBid > 0 ? auction.currentBid : startingBid;
  const isWinning = userId && auction.highestBidderId === userId;
  const isOutbid = userId && initialBidHistory.some(b => b.bidderId === userId) && !isWinning;

  // Merge live history with initial history to get bidder names where possible
  const combinedHistory = auction.bidHistory.map((liveBid: any, idx: number) => {
    const existing = initialBidHistory.find(b => b.amount === liveBid.amount);
    return {
      id: existing?.id || `live-${idx}`,
      bidderName: existing?.bidderName || "Anonymous User",
      amount: liveBid.amount,
      timestamp: liveBid.timestamp
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="bg-nova-blue/20 text-nova-blue px-3 py-1 rounded-full text-xs font-bold border border-nova-blue/30 uppercase tracking-wider">
              Live Auction
            </span>
            {isEndingSoon && !hasEnded && (
              <span className="bg-nova-amber/20 text-nova-amber px-3 py-1 rounded-full text-xs font-bold border border-nova-amber/30 flex items-center gap-1 uppercase tracking-wider animate-pulse">
                <Clock className="w-3 h-3" /> Ending Soon
              </span>
            )}
            {auction.connectionState === 'Reconnecting' && (
              <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-bold border border-orange-500/30 uppercase tracking-wider">
                Reconnecting...
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-nova-silver text-sm bg-white/5 px-3 py-1 rounded-full">
            <Eye className="w-4 h-4" />
            <span className="font-medium">{presence.count} watching</span>
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-6">
          {productName}
        </h1>

        <div className={`glass-panel p-8 rounded-2xl relative overflow-hidden transition-all duration-500 ${isWinning ? 'border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]' : isOutbid ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : ''}`}>
          {/* Decorative gradient */}
          <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full pointer-events-none transition-colors duration-500 ${isWinning ? 'bg-green-500/10' : isOutbid ? 'bg-red-500/10' : 'bg-nova-blue/10'}`} />
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative z-10">
            <div>
              <p className="text-nova-silver mb-2 font-medium flex items-center gap-2">
                <Gavel className="w-4 h-4" /> Current Highest Bid
              </p>
              <div className="flex items-center gap-3">
                <p className="text-5xl font-black text-white tracking-tight tabular-nums">
                  ${currentBid.toFixed(2)}
                </p>
                {isWinning && (
                  <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider animate-in zoom-in">
                    Winning
                  </span>
                )}
                {isOutbid && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider animate-in zoom-in">
                    Outbid
                  </span>
                )}
              </div>
              <p className="text-sm text-nova-slate mt-2">
                {combinedHistory.length} total bids
              </p>
            </div>

            <div className={`bg-black/40 border rounded-xl p-4 min-w-[200px] ${isEndingSoon && !hasEnded ? 'border-nova-amber/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-white/5'}`}>
              <p className="text-nova-silver text-xs mb-1 uppercase tracking-wider font-semibold">Time Remaining</p>
              <p className="text-2xl font-bold text-white flex items-center gap-2 tabular-nums">
                <Clock className={`w-5 h-5 ${isEndingSoon && !hasEnded ? 'text-nova-amber animate-pulse' : 'text-nova-blue'}`} />
                {formattedCountdown}
              </p>
            </div>
          </div>

          {!hasEnded ? (
            userId ? (
              <div className="mt-8">
                <BidForm 
                  auctionId={auctionId} 
                  currentBid={currentBid} 
                  startingBid={startingBid} 
                />
              </div>
            ) : (
              <div data-testid="login-to-bid-prompt" className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl text-center relative z-10">
                <p className="text-white mb-2">You must be signed in to place a bid.</p>
                <Link href="/sign-in" className="text-nova-blue hover:underline font-medium">Sign in to bid &rarr;</Link>
              </div>
            )
          ) : (
            <div className="mt-8 p-6 bg-nova-blue/10 border border-nova-blue/20 rounded-xl text-center relative z-10">
              <h3 className="text-xl font-bold text-white mb-2">Auction Ended</h3>
              {combinedHistory.length > 0 ? (
                <p className="text-nova-silver">Winning bid: <span className="font-bold text-white">${combinedHistory[0].amount.toFixed(2)}</span></p>
              ) : (
                <p className="text-nova-silver">No bids were placed on this item.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <History className="w-5 h-5 text-nova-blue" />
          Live Bid History
        </h3>
        
        {combinedHistory.length > 0 ? (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {combinedHistory.map((bid: any, index: number) => (
              <div 
                key={bid.id || `bid-${index}`} 
                className={`flex items-center justify-between p-4 rounded-xl border animate-in slide-in-from-top-2 fade-in ${
                  index === 0 
                    ? 'bg-nova-blue/10 border-nova-blue/30' 
                    : 'bg-black/30 border-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-nova-blue/20 text-nova-blue' : 'bg-white/5 text-nova-silver'
                  }`}>
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium flex items-center gap-2">
                      {bid.bidderName}
                      {index === 0 && <span className="text-[10px] uppercase bg-nova-blue text-white px-2 py-0.5 rounded-full font-bold">Highest</span>}
                    </p>
                    <p className="text-xs text-nova-slate">
                      {new Date(bid.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-white text-lg">
                  ${bid.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <History className="w-8 h-8 text-nova-slate mx-auto mb-3 opacity-50" />
            <p className="text-nova-silver">No bids yet. Be the first to bid!</p>
          </div>
        )}
      </div>
    </div>
  );
}
