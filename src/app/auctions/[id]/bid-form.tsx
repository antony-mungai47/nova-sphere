"use client";

import { useState } from "react";
import { placeBid } from "@/domains/Marketplace/auctions/actions";
import { Loader2, TrendingUp, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRealtime } from "@/domains/Realtime/hooks/useRealtime";
import { useAuth } from "@clerk/nextjs";
import { RealtimeEvents } from "@/domains/Realtime/contracts/EventRegistry";
import { ChannelRegistry } from "@/domains/Realtime/contracts/ChannelRegistry";

interface BidFormProps {
  auctionId: string;
  currentBid: number;
  startingBid: number;
}

export function BidForm({ auctionId, currentBid, startingBid }: BidFormProps) {
  const { userId } = useAuth();
  const router = useRouter();
  const minBid = Math.max(startingBid, currentBid + 1);
  const [amount, setAmount] = useState<string>(minBid.toFixed(2));
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { publish } = useRealtime({
    channel: ChannelRegistry.publicAuction(auctionId),
    event: RealtimeEvents.BID_PLACED,
    onEvent: () => {}
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    
    try {
      const bidAmount = parseFloat(amount);
      if (isNaN(bidAmount) || bidAmount < minBid) {
        throw new Error(`Minimum bid is $${minBid.toFixed(2)}`);
      }
      
      const newBidResult = await placeBid(auctionId, bidAmount);
      
      // Optimistic realtime broadcast
      await publish({
        auctionId,
        highestBid: bidAmount,
        bidderId: userId || 'anonymous',
        timestamp: new Date().toISOString(),
        newEndTime: newBidResult?.updatedAuction?.endTime || undefined
      });

      setAmount((bidAmount + 1).toFixed(2)); // suggest next bid
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to place bid");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-nova-silver mb-2">
            Your Bid Amount ($)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-nova-silver">$</span>
            <input
              type="number"
              step="0.01"
              min={minBid}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              data-testid="bid-amount-input"
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors"
            />
          </div>
          <p className="text-xs text-nova-silver mt-2">
            Enter ${minBid.toFixed(2)} or more
          </p>
        </div>
        <button
          type="submit"
          disabled={isPending}
          data-testid="place-bid-btn"
          className="bg-nova-blue hover:bg-nova-blue/80 text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 h-[50px] shadow-glow-primary disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
          Place Bid
        </button>
      </div>

      {error && (
        <div data-testid="bid-error-msg" className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </form>
  );
}
