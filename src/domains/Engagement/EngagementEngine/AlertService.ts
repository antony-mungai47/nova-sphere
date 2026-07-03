import { prisma } from '@/lib/prisma';

export class AlertService {
  /**
   * Evaluates alerts when a product's price drops.
   * This is called by the Admin or Pricing Engine.
   */
  static async evaluatePriceDrop(productId: string, newPrice: number) {
    const watchers = await prisma.wishlistItem.findMany({
      where: { productId },
      include: { user: { include: { notificationPreferences: true } } }
    });

    for (const watcher of watchers) {
      const prefs = watcher.user.notificationPreferences.find(p => p.type === 'PRICE_DROP');
      
      // If no pref, assume true for in-app as default for wishlisted items
      if (!prefs || prefs.inApp) {
        await prisma.notification.create({
          data: {
            userId: watcher.userId,
            type: 'PRICE_DROP',
            title: 'Price Drop Alert!',
            message: `An item on your wishlist just dropped in price.`,
            link: `/store/product/${productId}`
          }
        });
      }
    }
  }
}
