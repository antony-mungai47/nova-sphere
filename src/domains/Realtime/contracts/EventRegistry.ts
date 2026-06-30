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

  // Support & Presence
  SUPPORT_REPLY: 'SUPPORT_REPLY',
  USER_ONLINE: 'USER_ONLINE',
  USER_OFFLINE: 'USER_OFFLINE',
  USER_TYPING: 'USER_TYPING',
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
  }),
  [RealtimeEvents.USER_OFFLINE]: z.object({
    userId: z.string(),
  }),
  [RealtimeEvents.USER_TYPING]: z.object({
    userId: z.string(),
    isTyping: z.boolean(),
  }),
};
