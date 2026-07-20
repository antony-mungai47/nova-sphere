export type Events = {
  // Order Domain
  'OrderCreated': { data: { orderId: string; userId: string; totalAmount: number; } };
  'OrderPaid': { data: { orderId: string; userId: string; } };
  'OrderCancelled': { data: { orderId: string; reason: string; } };

  // Product Domain
  'ProductCreated': { data: { productId: string; } };
  'ProductUpdated': { data: { productId: string; } };
  'ProductDeleted': { data: { productId: string; } };

  // Auction Domain
  'AuctionCreated': { data: { auctionId: string; } };
  'AuctionStarted': { data: { auctionId: string; } };
  'AuctionEnded': { data: { auctionId: string; winnerId?: string; winningBid?: number; } };
  'AuctionBidPlaced': { data: { auctionId: string; userId: string; amount: number; } };
  'AuctionOutbid': { data: { auctionId: string; userId: string; previousBidAmount: number; newBidAmount: number; } };
  'AuctionExtended': { data: { auctionId: string; newEndTime: string; } };
  'AuctionBuyNow': { data: { auctionId: string; userId: string; amount: number; } };
  'AuctionReserveFailed': { data: { auctionId: string; highestBidAmount?: number; } };
  'AuctionWon': { data: { auctionId: string; winnerId: string; amount: number; } };
  'AuctionCancelled': { data: { auctionId: string; reason?: string; } };

  // User & Interaction Domain
  'UserCreated': { data: { userId: string; email: string; } };
  'UserActivityLogged': { 
    data: { 
      userId?: string; 
      sessionId?: string;
      activityType: 'VIEW_PRODUCT' | 'SEARCH' | 'CLICK_CATEGORY' | 'SAVE_WISHLIST' | 'ADD_CART' | 'REMOVE_CART' | 'CHECKOUT' | 'PURCHASE' | 'REVIEW' | 'SHARE_PRODUCT';
      resourceId?: string; // e.g. productId, categoryId
      metadata?: Record<string, any>;
    } 
  };

  // Support Domain
  'SupportOpened': { data: { ticketId: string; userId: string; } };
  'SupportResolved': { data: { ticketId: string; } };

  // Admin Domain
  'CouponCreated': { data: { couponId: string; code: string; } };
  'InventoryChanged': { data: { productId: string; quantityDelta: number; } };
};
