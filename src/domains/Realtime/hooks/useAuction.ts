import { useState, useCallback } from 'react';
import { useRealtime } from './useRealtime';
import { RealtimeEvents } from '../contracts/EventRegistry';
import { ChannelRegistry } from '../contracts/ChannelRegistry';
import { ConnectionState } from '../contracts/IRealtimeEngine';

export interface AuctionRealtimeState {
  highestBid: number;
  highestBidderId: string | null;
  endTime: string;
  bidHistory: Array<{ bidderId: string; amount: number; timestamp: string }>;
  connectionState: ConnectionState;
}

export function useAuction(auctionId: string, initialState: Omit<AuctionRealtimeState, 'connectionState'>) {
  const [auctionState, setAuctionState] = useState<AuctionRealtimeState>({
    ...initialState,
    connectionState: 'Connecting',
  });

  const handleBidPlaced = useCallback((data: any) => {
    // If multiple bids come in buffer, process them or just take latest
    const events = Array.isArray(data) ? data : [data];
    
    setAuctionState(prev => {
      let newState = { ...prev };
      for (const event of events) {
        if (event.highestBid > newState.highestBid) {
          newState.highestBid = event.highestBid;
          newState.highestBidderId = event.bidderId;
          newState.bidHistory = [
            { bidderId: event.bidderId, amount: event.highestBid, timestamp: event.timestamp },
            ...newState.bidHistory
          ];
          
          // Anti-sniping: if auction was extended
          if (event.newEndTime) {
            newState.endTime = event.newEndTime;
          }
        }
      }
      return newState;
    });
  }, []);

  const { connectionState } = useRealtime({
    channel: ChannelRegistry.publicAuction(auctionId),
    event: RealtimeEvents.BID_PLACED,
    onEvent: handleBidPlaced,
    bufferSize: 3 // flush every 3 bids in high concurrency, or if flushBuffer is called
  });

  // Keep connection state synced
  if (connectionState !== auctionState.connectionState) {
    setAuctionState(prev => ({ ...prev, connectionState }));
  }

  return auctionState;
}
