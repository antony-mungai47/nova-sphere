import { IRealtimeEngine } from '../contracts/IRealtimeEngine';
import { MockRealtimeProvider } from './MockRealtimeProvider';

export class RealtimeFactory {
  private static instance: IRealtimeEngine;

  static getInstance(): IRealtimeEngine {
    if (!this.instance) {
      const providerType = process.env.NEXT_PUBLIC_REALTIME_PROVIDER || 'mock';
      
      switch (providerType.toLowerCase()) {
        case 'pusher':
          console.warn('[RealtimeFactory] Pusher requested but not fully implemented. Falling back to Mock.');
          this.instance = new MockRealtimeProvider();
          break;
        case 'ably':
          console.warn('[RealtimeFactory] Ably requested but not fully implemented. Falling back to Mock.');
          this.instance = new MockRealtimeProvider();
          break;
        case 'mock':
        default:
          this.instance = new MockRealtimeProvider();
          break;
      }

      // Auto-connect on instantiation for the global singleton
      this.instance.connect();
    }
    
    return this.instance;
  }
}
