import { useState, useCallback, useEffect } from 'react';
import { useRealtime } from './useRealtime';
import { RealtimeEvents } from '../contracts/EventRegistry';
import { ConnectionState } from '../contracts/IRealtimeEngine';

export interface PresenceState {
  count: number;
  users: Array<{ id: string; role: string }>;
  connectionState: ConnectionState;
}

export function usePresence(channel: string) {
  const [presenceState, setPresenceState] = useState<PresenceState>({
    count: 1, // assume self is watching
    users: [],
    connectionState: 'Connecting',
  });

  const handleUserOnline = useCallback((data: any) => {
    setPresenceState(prev => {
      // Avoid duplicates
      if (prev.users.find(u => u.id === data.userId)) return prev;
      return {
        ...prev,
        count: prev.count + 1,
        users: [...prev.users, { id: data.userId, role: data.role || 'user' }]
      };
    });
  }, []);

  const handleUserOffline = useCallback((data: any) => {
    setPresenceState(prev => {
      return {
        ...prev,
        count: Math.max(1, prev.count - 1),
        users: prev.users.filter(u => u.id !== data.userId)
      };
    });
  }, []);

  const { connectionState, publish } = useRealtime({
    channel,
    event: RealtimeEvents.USER_ONLINE,
    onEvent: handleUserOnline
  });

  // Bind to offline event as well
  useRealtime({
    channel,
    event: RealtimeEvents.USER_OFFLINE,
    onEvent: handleUserOffline
  });

  // Keep connection state synced
  if (connectionState !== presenceState.connectionState) {
    setPresenceState(prev => ({ ...prev, connectionState }));
  }

  // Publish presence on mount
  useEffect(() => {
    if (connectionState === 'Connected') {
      publish({ userId: 'anon-' + Math.random().toString(36).substr(2, 9), role: 'user' });
    }
  }, [connectionState, publish]);

  return presenceState;
}
