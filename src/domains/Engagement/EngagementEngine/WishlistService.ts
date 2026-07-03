import { prisma } from '@/lib/prisma';
import { ActivityTrackingService } from './ActivityTrackingService';

export class WishlistService {
  /**
   * Toggles a product in the user's wishlist and logs the activity.
   */
  static async toggleWishlist(userId: string, productId: string) {
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      
      await ActivityTrackingService.logEvent(userId, null, 'WISHLIST_REMOVED', productId);
      
      return { status: 'removed' };
    } else {
      await prisma.wishlistItem.create({
        data: { userId, productId }
      });
      
      await ActivityTrackingService.logEvent(userId, null, 'WISHLIST_ADDED', productId);
      
      return { status: 'added' };
    }
  }

  static async getWishlist(userId: string) {
    return prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}
