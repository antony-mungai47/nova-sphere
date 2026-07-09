'use client';

import React, { useState } from 'react';
import { useAuction } from '../hooks/useAuction';

export function LiveAuctionTicker({ auctionId, initialBid, initialEndTime }: { auctionId: string, initialBid: number, initialEndTime: string }) {
  const { auctionState, placeOptimisticBid } = useAuction(auctionId, {
    currentBid: initialBid,
    highestBidderId: null,
    endTime: initialEndTime,
    status: 'LIVE',
    winnerId: null,
    bidHistory: []
  });

  const [bidAmount, setBidAmount] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= auctionState.currentBid) {
      setError('Bid must be greater than current bid.');
      return;
    }

    setIsBidding(true);
    setError(null);
    placeOptimisticBid(amount);
    
    // Generate idempotency key
    const idempotencyKey = crypto.randomUUID();

    try {
      const res = await fetch(`/api/auctions/${auctionId}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({ amount, isProxyBid: false })
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to place bid');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsBidding(false);
      setBidAmount('');
    }
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-xl border border-gray-800 shadow-xl max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Live Auction
        </h3>
        <span className="text-xs font-semibold px-2 py-1 bg-gray-800 text-gray-300 rounded-md">
          {auctionState.viewers} {auctionState.viewers === 1 ? 'Viewer' : 'Viewers'}
        </span>
      </div>
      
      <div className="mb-6 bg-gray-800 p-4 rounded-lg">
        <div className="text-sm text-gray-400 mb-1">Current Bid</div>
        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          ${auctionState.currentBid.toLocaleString()}
        </div>
      </div>

      {auctionState.status === 'LIVE' || auctionState.status === 'EXTENDED' ? (
        <form onSubmit={handleBid} className="flex gap-2 mb-4">
          <input 
            type="number" 
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder={`> $${auctionState.currentBid}`}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-lg font-medium text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            min={auctionState.currentBid + 1}
            disabled={isBidding}
          />
          <button 
            type="submit"
            disabled={isBidding}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white font-bold px-6 py-3 rounded-lg transition-colors"
          >
            {isBidding ? 'Bidding...' : 'Bid'}
          </button>
        </form>
      ) : (
        <div className="bg-gray-800 text-center py-4 rounded-lg mb-4 text-emerald-400 font-bold border border-emerald-500/30">
          {auctionState.status === 'AWAITING_PAYMENT' ? 'Auction Ended - Awaiting Payment' : 
           auctionState.status === 'RESERVE_NOT_MET' ? 'Auction Ended - Reserve Not Met' : 'Auction Closed'}
        </div>
      )}

      {error && <div className="text-red-400 text-sm mb-4 bg-red-900/20 p-3 rounded">{error}</div>}

      <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
        {auctionState.bidHistory.map((b, i) => (
          <div key={i} className={`flex justify-between items-center text-sm py-2 border-b border-gray-800/50 last:border-0 ${b.isOptimistic ? 'opacity-50' : ''}`}>
            <span className="text-gray-400">{new Date(b.timestamp).toLocaleTimeString()}</span>
            <span className="font-semibold text-gray-200">${b.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
