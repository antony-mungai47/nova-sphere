export const ChannelRegistry = {
  // Public Channels
  publicProductStock: (productId: string) => `public.product.stock.${productId}`,
  publicAuction: (auctionId: string) => `public.auction.${auctionId}`,
  publicHomeFeed: () => `public.home.livefeed`,

  // Private Channels (Requires Authentication)
  privateUser: (userId: string) => `private.user.${userId}`,
  privateAdmin: () => `private.admin`,
  adminLiveSupport: () => `private.admin.support`,
  privateConversation: (conversationId: string) => `private.conversation.${conversationId}`,

  // Presence Channels (Requires Authentication, shows who is online)
  presenceSupport: () => `presence.support`,
  presenceAuction: (auctionId: string) => `presence.auction.${auctionId}`,
  presenceConversation: (conversationId: string) => `presence.conversation.${conversationId}`,
} as const;
