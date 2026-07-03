import { RealtimeEngine } from '../Realtime/RealtimeEngine';

export class PresenceEngine {
  
  static async trackUserEnter(auctionId: string, userId: string, isAnonymous: boolean) {
    await RealtimeEngine.broadcast(`presence-auction-${auctionId}`, 'user-entered', {
      userId,
      isAnonymous,
      timestamp: new Date().toISOString()
    });
  }

  static async trackUserLeave(auctionId: string, userId: string) {
    await RealtimeEngine.broadcast(`presence-auction-${auctionId}`, 'user-left', {
      userId,
      timestamp: new Date().toISOString()
    });
  }

  static async trackUserIdle(auctionId: string, userId: string) {
    await RealtimeEngine.broadcast(`presence-auction-${auctionId}`, 'user-idle', {
      userId,
      timestamp: new Date().toISOString()
    });
  }

  static async trackUserTyping(auctionId: string, userId: string) {
    await RealtimeEngine.broadcast(`presence-auction-${auctionId}`, 'user-typing', {
      userId,
      timestamp: new Date().toISOString()
    });
  }
}
