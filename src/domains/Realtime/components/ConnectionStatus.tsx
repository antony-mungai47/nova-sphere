"use client";

import { useRealtime } from '../hooks/useRealtime';
import { RealtimeEvents } from '../contracts/EventRegistry';
import { ChannelRegistry } from '../contracts/ChannelRegistry';

export function ConnectionStatus() {
  // Use public home feed just to bind global connection status easily
  const { connectionState } = useRealtime({
    channel: ChannelRegistry.publicHomeFeed(),
    event: RealtimeEvents.USER_ONLINE, // dummy bind
    onEvent: () => {}
  });

  if (connectionState === 'Connected') return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 pointer-events-none">
      <div className="bg-black/80 backdrop-blur border border-white/10 text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${
          connectionState === 'Connecting' ? 'bg-amber-400 animate-pulse' :
          connectionState === 'Reconnecting' ? 'bg-orange-500 animate-pulse' :
          'bg-red-500'
        }`} />
        {connectionState === 'Offline' ? 'Network Offline' : `Realtime: ${connectionState}`}
      </div>
    </div>
  );
}
