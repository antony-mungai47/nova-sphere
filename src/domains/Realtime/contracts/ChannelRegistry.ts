export const ChannelRegistry = {
  // Public Channels
  publicProductStock: (productId: string) => `public.product.stock.${productId}`,
  publicAuction: (auctionId: string) => `public.auction.${auctionId}`,
  publicHomeFeed: () => `public.home.livefeed`,

  // Private Channels (Requires Authentication)
  privateUser: (userId: string) => `private.user.${userId}`,
  privateAdmin: () => `private.admin`,

  // Presence Channels (Requires Authentication, shows who is online)
  presenceSupport: () => `presence.support`,
  presenceAuction: (auctionId: string) => `presence.auction.${auctionId}`,
} as const;
