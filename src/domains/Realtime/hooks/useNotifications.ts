import { useState, useCallback, useEffect } from 'react';
import { useRealtime } from './useRealtime';
import { RealtimeEvents } from '../contracts/EventRegistry';
import { ChannelRegistry } from '../contracts/ChannelRegistry';
import { ConnectionState } from '../contracts/IRealtimeEngine';

export interface NotificationItem {
  id: string;
  type: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  message: string;
  link?: string;
  timestamp: string;
  isRead: boolean;
}

export interface NotificationsState {
  items: NotificationItem[];
  unreadCount: number;
  connectionState: ConnectionState;
}

export function useNotifications(userId: string | null) {
  const [state, setState] = useState<NotificationsState>({
    items: [],
    unreadCount: 0,
    connectionState: 'Connecting',
  });

  const handleNotification = useCallback((data: any) => {
    setState(prev => {
      const isDuplicate = prev.items.some(n => n.id === data.id);
      if (isDuplicate) return prev;

      const newItem: NotificationItem = {
        id: data.id,
        type: data.type,
        priority: data.priority,
        title: data.title,
        message: data.message,
        link: data.link,
        timestamp: data.timestamp,
        isRead: data.isRead,
      };

      return {
        ...prev,
        items: [newItem, ...prev.items],
        unreadCount: prev.unreadCount + (newItem.isRead ? 0 : 1)
      };
    });
  }, []);

  const { connectionState } = useRealtime({
    channel: userId ? ChannelRegistry.privateUser(userId) : '',
    event: RealtimeEvents.NOTIFICATION_RECEIVED,
    onEvent: handleNotification,
    bufferSize: 1 // No buffering for private notifications, deliver immediately
  });

  if (connectionState !== state.connectionState) {
    setState(prev => ({ ...prev, connectionState }));
  }

  return {
    ...state,
    setNotifications: (items: NotificationItem[], unreadCount: number) => {
      setState(prev => ({ ...prev, items, unreadCount }));
    },
    markAsRead: (id: string) => {
      setState(prev => ({
        ...prev,
        items: prev.items.map(n => n.id === id ? { ...n, isRead: true } : n),
        unreadCount: Math.max(0, prev.unreadCount - 1)
      }));
    }
  };
}
