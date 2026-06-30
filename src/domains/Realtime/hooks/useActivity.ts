import { useState, useCallback } from 'react';
import { useRealtime } from './useRealtime';
import { RealtimeEvents } from '../contracts/EventRegistry';
import { ChannelRegistry } from '../contracts/ChannelRegistry';
import { ConnectionState } from '../contracts/IRealtimeEngine';

export interface ActivityFeedItem {
  id: string;
  type: 'BID' | 'PURCHASE' | 'REVIEW' | 'USER_JOINED';
  title: string;
  description: string;
  timestamp: string;
  link?: string;
}

export interface ActivityState {
  feed: ActivityFeedItem[];
  connectionState: ConnectionState;
}

export function useActivity(maxItems: number = 50) {
  const [activity, setActivity] = useState<ActivityState>({
    feed: [],
    connectionState: 'Connecting',
  });

  const handleActivityEvent = useCallback((data: any) => {
    const events = Array.isArray(data) ? data : [data];
    
    setActivity(prev => {
      // Avoid duplicates and prepend new events
      const newItems = events.filter(e => !prev.feed.some(p => p.id === e.id));
      const updatedFeed = [...newItems, ...prev.feed].slice(0, maxItems);
      
      return {
        ...prev,
        feed: updatedFeed
      };
    });
  }, [maxItems]);

  const { connectionState } = useRealtime({
    channel: ChannelRegistry.publicHomeFeed(),
    event: RealtimeEvents.ACTIVITY_FEED_EVENT,
    onEvent: handleActivityEvent,
    bufferSize: 5 // Batch up to 5 events at a time to prevent layout thrashing
  });

  if (connectionState !== activity.connectionState) {
    setActivity(prev => ({ ...prev, connectionState }));
  }

  return activity;
}
