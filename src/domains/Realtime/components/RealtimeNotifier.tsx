"use client";

import { useEffect, useState } from 'react';
import { useRealtime } from '../hooks/useRealtime';
import { RealtimeEvents } from '../contracts/EventRegistry';
import { ChannelRegistry } from '../contracts/ChannelRegistry';
import { useAuth } from '@clerk/nextjs'; // Or whatever auth provider is used

export function RealtimeNotifier() {
  const { userId } = useAuth();
  const [toast, setToast] = useState<string | null>(null);

  const handleOrderConfirmed = (data: any) => {
    setToast(`Order ${data.orderId} Confirmed!`);
    setTimeout(() => setToast(null), 5000);
  };

  useRealtime({
    channel: userId ? ChannelRegistry.privateUser(userId) : 'none',
    event: RealtimeEvents.ORDER_CONFIRMED,
    onEvent: handleOrderConfirmed
  });

  if (!toast) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right fade-in">
      <div className="bg-nova-obsidian text-white border border-nova-sapphire/50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
        <div className="w-2 h-2 bg-nova-sapphire rounded-full animate-pulse" />
        <p className="text-sm font-medium">{toast}</p>
      </div>
    </div>
  );
}
