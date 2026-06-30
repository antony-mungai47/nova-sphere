import { useState, useCallback } from 'react';
import { useRealtime } from './useRealtime';
import { RealtimeEvents } from '../contracts/EventRegistry';
import { ChannelRegistry } from '../contracts/ChannelRegistry';
import { ConnectionState } from '../contracts/IRealtimeEngine';

export interface InventoryState {
  stock: number;
  reservedCount: number;
  connectionState: ConnectionState;
}

export function useInventory(productId: string, initialStock: number, initialReserved: number = 0) {
  const [inventory, setInventory] = useState<InventoryState>({
    stock: initialStock,
    reservedCount: initialReserved,
    connectionState: 'Connecting',
  });

  const handleInventoryChanged = useCallback((data: any) => {
    setInventory(prev => ({
      ...prev,
      stock: data.newStock ?? prev.stock,
      reservedCount: data.reservedCount ?? prev.reservedCount
    }));
  }, []);

  const { connectionState, publish } = useRealtime({
    channel: ChannelRegistry.publicProductStock(productId),
    event: RealtimeEvents.INVENTORY_CHANGED,
    onEvent: handleInventoryChanged
  });

  if (connectionState !== inventory.connectionState) {
    setInventory(prev => ({ ...prev, connectionState }));
  }

  return { ...inventory, publish };
}
