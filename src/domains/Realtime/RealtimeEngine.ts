import Pusher from 'pusher';

/**
 * Universal abstraction for Realtime Engine.
 * If we ever switch from Pusher to Ably or Socket.io, we only change it here.
 */
class RealtimeEngineClass {
  private pusher: Pusher;

  constructor() {
    this.pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID || '',
      key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
      secret: process.env.PUSHER_SECRET || '',
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
      useTLS: true,
    });
  }

  async broadcast(channel: string, event: string, data: any) {
    if (!process.env.PUSHER_APP_ID) {
      console.warn('[RealtimeEngine] Missing Pusher credentials. Broadcast ignored.');
      return;
    }
    
    try {
      await this.pusher.trigger(channel, event, data);
    } catch (error) {
      console.error(`[RealtimeEngine] Failed to broadcast ${event} to ${channel}:`, error);
    }
  }
}

export const RealtimeEngine = new RealtimeEngineClass();
