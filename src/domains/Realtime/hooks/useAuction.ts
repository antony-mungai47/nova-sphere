import { useState, useEffect, useCallback } from 'react';
import Pusher from 'pusher-js';

export interface AuctionRealtimeState {
  currentBid: number;
  highestBidderId: string | null;
  endTime: string;
  status: string;
  viewers: number;
  winnerId: string | null;
  connectionState: 'Connecting' | 'Connected' | 'Disconnected' | 'Reconnecting';
  bidHistory: Array<{ amount: number; timestamp: string; isOptimistic?: boolean }>;
}

let pusherClient: Pusher | null = null;

export function useAuction(auctionId: string, initialState: Omit<AuctionRealtimeState, 'connectionState' | 'viewers'>) {
  const [auctionState, setAuctionState] = useState<AuctionRealtimeState>({
    ...initialState,
    viewers: 0,
    connectionState: 'Connecting',
  });

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return;

    if (!pusherClient) {
      pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
        authEndpoint: '/api/pusher/auth',
      });
    }

    const channelName = `presence-auction-${auctionId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind('pusher:subscription_succeeded', (members: any) => {
      setAuctionState(prev => ({
        ...prev,
        connectionState: 'Connected',
        viewers: members.count
      }));
    });

    channel.bind('pusher:member_added', () => {
      setAuctionState(prev => ({ ...prev, viewers: prev.viewers + 1 }));
    });

    channel.bind('pusher:member_removed', () => {
      setAuctionState(prev => ({ ...prev, viewers: Math.max(0, prev.viewers - 1) }));
    });

    channel.bind('bid-placed', (data: any) => {
      setAuctionState(prev => {
        // Remove optimistic bids that match or are lower than server truth
        const filteredHistory = prev.bidHistory.filter(b => !b.isOptimistic || b.amount > data.currentBid);
        return {
          ...prev,
          currentBid: data.currentBid,
          highestBidderId: data.highestBidderId,
          bidHistory: [
            { amount: data.currentBid, timestamp: data.timestamp },
            ...filteredHistory
          ]
        };
      });
    });

    channel.bind('time-extended', (data: any) => {
      setAuctionState(prev => ({
        ...prev,
        endTime: data.newEndTime
      }));
    });

    channel.bind('state-changed', (data: any) => {
      setAuctionState(prev => ({
        ...prev,
        status: data.status
      }));
    });

    channel.bind('auction-ended-winner', (data: any) => {
      setAuctionState(prev => ({
        ...prev,
        winnerId: data.winnerId,
        currentBid: data.winningAmount,
        status: 'AWAITING_PAYMENT'
      }));
    });

    pusherClient.connection.bind('state_change', (states: any) => {
      if (states.current === 'connecting') setAuctionState(p => ({ ...p, connectionState: 'Connecting' }));
      else if (states.current === 'connected') setAuctionState(p => ({ ...p, connectionState: 'Connected' }));
      else if (states.current === 'unavailable' || states.current === 'failed') setAuctionState(p => ({ ...p, connectionState: 'Disconnected' }));
    });

    return () => {
      if (pusherClient) {
        pusherClient.unsubscribe(channelName);
      }
    };
  }, [auctionId]);

  const placeOptimisticBid = useCallback((amount: number) => {
    setAuctionState(prev => ({
      ...prev,
      currentBid: amount,
      bidHistory: [
        { amount, timestamp: new Date().toISOString(), isOptimistic: true },
        ...prev.bidHistory
      ]
    }));
  }, []);

  return { auctionState, placeOptimisticBid };
}
