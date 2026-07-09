import { prisma } from '@/lib/prisma';
import { RealtimeEngine } from '../Realtime/RealtimeEngine';

export class AntiSnipingEngine {
  
  static async evaluateSnipe(auctionId: string) {
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId }
    });

    if (!auction || auction.status !== 'LIVE') return;

    // Use auction config or fallback to global defaults (e.g. 90s window, 3min extension, max 5)
    const windowSeconds = auction.antiSnipingWindowSeconds ?? 90;
    const extensionSeconds = auction.antiSnipingExtensionSeconds ?? 180;
    const maxExtensions = auction.antiSnipingMaxExtensions ?? 5;

    const now = new Date();
    const timeRemainingSeconds = (auction.endTime.getTime() - now.getTime()) / 1000;

    if (timeRemainingSeconds > 0 && timeRemainingSeconds <= windowSeconds) {
      if (auction.extensionsUsed < maxExtensions) {
        
        const newEndTime = new Date(auction.endTime.getTime() + (extensionSeconds * 1000));
        
        await prisma.auction.update({
          where: { id: auctionId },
          data: {
            endTime: newEndTime,
            extensionsUsed: { increment: 1 }
          }
        });

        await RealtimeEngine.broadcast(`presence-auction-${auctionId}`, 'time-extended', {
          auctionId,
          newEndTime: newEndTime.toISOString(),
          extensionsRemaining: maxExtensions - (auction.extensionsUsed + 1),
          timestamp: new Date().toISOString()
        });
      }
    }
  }
}
