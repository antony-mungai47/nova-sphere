import { z } from 'zod';

export const RealtimeEvents = {
  // Commerce Events
  PRODUCT_UPDATED: 'PRODUCT_UPDATED',
  INVENTORY_CHANGED: 'INVENTORY_CHANGED',
  PRICE_CHANGED: 'PRICE_CHANGED',

  // Order Events
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_CONFIRMED: 'ORDER_CONFIRMED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',

  // Auction Events
  BID_PLACED: 'BID_PLACED',
  BID_OUTBID: 'BID_OUTBID',
  AUCTION_ENDED: 'AUCTION_ENDED',

  // Global Feed
  ACTIVITY_FEED_EVENT: 'ACTIVITY_FEED_EVENT',

  // Support, Conversations & Presence
  MESSAGE_SENT: 'MESSAGE_SENT',
  MESSAGE_DELIVERED: 'MESSAGE_DELIVERED',
  MESSAGE_SEEN: 'MESSAGE_SEEN',
  USER_ONLINE: 'USER_ONLINE',
  USER_OFFLINE: 'USER_OFFLINE',
  USER_TYPING: 'USER_TYPING',
  PRESENCE_UPDATE: 'PRESENCE_UPDATE',

  // Notifications
  NOTIFICATION_RECEIVED: 'NOTIFICATION_RECEIVED',
} as const;

export type RealtimeEventName = typeof RealtimeEvents[keyof typeof RealtimeEvents];

// Zod schemas for event payloads
export const EventSchemas = {
  [RealtimeEvents.INVENTORY_CHANGED]: z.object({
    productId: z.string(),
    newStock: z.number().int().min(0),
    reservedCount: z.number().int().min(0),
  }),
  [RealtimeEvents.ACTIVITY_FEED_EVENT]: z.object({
    id: z.string(),
    type: z.enum(['BID', 'PURCHASE', 'REVIEW', 'USER_JOINED']),
    title: z.string(),
    description: z.string(),
    timestamp: z.string().datetime(),
    link: z.string().optional(),
  }),
  [RealtimeEvents.BID_PLACED]: z.object({
    auctionId: z.string(),
    highestBid: z.number(),
    bidderId: z.string(),
    timestamp: z.string().datetime(),
    newEndTime: z.string().datetime().optional(),
  }),
  [RealtimeEvents.BID_OUTBID]: z.object({
    auctionId: z.string(),
    previousBidderId: z.string(),
    newHighestBid: z.number(),
  }),
  [RealtimeEvents.USER_ONLINE]: z.object({
    userId: z.string(),
    role: z.string().optional(),
    timestamp: z.string().datetime().optional(),
  }),
  [RealtimeEvents.USER_OFFLINE]: z.object({
    userId: z.string(),
    timestamp: z.string().datetime().optional(),
  }),
  [RealtimeEvents.USER_TYPING]: z.object({
    conversationId: z.string(),
    userId: z.string(),
    isTyping: z.boolean(),
  }),
  [RealtimeEvents.PRESENCE_UPDATE]: z.object({
    userId: z.string(),
    status: z.enum(['ONLINE', 'OFFLINE', 'AWAY', 'IDLE']),
    lastSeenAt: z.string().datetime().optional(),
  }),
  [RealtimeEvents.MESSAGE_SENT]: z.object({
    messageId: z.string(),
    conversationId: z.string(),
    senderId: z.string(),
    content: z.string(),
    timestamp: z.string().datetime(),
    attachments: z.array(z.any()).optional(),
  }),
  [RealtimeEvents.MESSAGE_DELIVERED]: z.object({
    messageId: z.string(),
    conversationId: z.string(),
    timestamp: z.string().datetime(),
  }),
  [RealtimeEvents.MESSAGE_SEEN]: z.object({
    messageId: z.string(),
    conversationId: z.string(),
    userId: z.string(),
    timestamp: z.string().datetime(),
  }),
  [RealtimeEvents.NOTIFICATION_RECEIVED]: z.object({
    id: z.string(),
    type: z.string(),
    priority: z.string(),
    title: z.string(),
    message: z.string(),
    link: z.string().nullable().optional(),
    timestamp: z.string(),
    isRead: z.boolean(),
  }),
};
