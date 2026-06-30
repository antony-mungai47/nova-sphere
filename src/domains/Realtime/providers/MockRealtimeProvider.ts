import { ConnectionState, IRealtimeEngine } from '../contracts/IRealtimeEngine';
import { RealtimeEventName, EventSchemas } from '../contracts/EventRegistry';
import { z } from 'zod';

export class MockRealtimeProvider implements IRealtimeEngine {
  private state: ConnectionState = 'Disconnected';
  private stateListeners: Set<(state: ConnectionState) => void> = new Set();
  
  // channel -> event -> Set of callbacks
  private subscriptions: Map<string, Map<RealtimeEventName, Set<(data: any) => void>>> = new Map();
  private reconnectTimeouts: NodeJS.Timeout[] = [];
  
  // Simulate a queue for offline capabilities
  private offlineQueue: Array<{ channel: string, event: RealtimeEventName, data: any }> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  private setState(newState: ConnectionState) {
    this.state = newState;
    this.stateListeners.forEach(cb => cb(newState));
  }

  private handleNetworkChange(isOnline: boolean) {
    if (!isOnline) {
      this.setState('Offline');
    } else {
      this.connect(); // Automatically attempt reconnect on network restore
    }
  }

  async connect(): Promise<void> {
    if (this.state === 'Connected' || this.state === 'Connecting') return;
    
    this.setState('Connecting');
    
    // Simulate network delay
    return new Promise(resolve => {
      setTimeout(() => {
        this.setState('Connected');
        this.flushOfflineQueue();
        
        // Start heartbeat simulation
        this.startHeartbeat();
        resolve();
      }, 500);
    });
  }

  disconnect(): void {
    this.setState('Disconnected');
    this.reconnectTimeouts.forEach(clearTimeout);
  }

  getConnectionState(): ConnectionState {
    return this.state;
  }

  onConnectionStateChange(callback: (state: ConnectionState) => void): void {
    this.stateListeners.add(callback);
  }

  subscribe(channel: string): void {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Map());
      console.log(`[MockRealtime] Subscribed to ${channel}`);
    }
  }

  unsubscribe(channel: string): void {
    this.subscriptions.delete(channel);
    console.log(`[MockRealtime] Unsubscribed from ${channel}`);
  }

  bind(channel: string, event: RealtimeEventName, callback: (data: any) => void): void {
    this.subscribe(channel); // Auto-subscribe if not already
    
    const channelEvents = this.subscriptions.get(channel)!;
    if (!channelEvents.has(event)) {
      channelEvents.set(event, new Set());
    }
    channelEvents.get(event)!.add(callback);
  }

  unbind(channel: string, event: RealtimeEventName, callback?: (data: any) => void): void {
    const channelEvents = this.subscriptions.get(channel);
    if (!channelEvents) return;

    if (callback) {
      channelEvents.get(event)?.delete(callback);
    } else {
      channelEvents.delete(event);
    }
  }

  async publish(channel: string, event: RealtimeEventName, data: any): Promise<void> {
    // Schema validation (Enterprise strictness)
    const schema = EventSchemas[event as keyof typeof EventSchemas];
    if (schema) {
      try {
        schema.parse(data);
      } catch (err) {
        console.error(`[MockRealtime] Event schema validation failed for ${event}`, err);
        throw new Error('EventValidationFailed');
      }
    }

    if (this.state !== 'Connected') {
      console.log(`[MockRealtime] Offline. Queuing event ${event} on ${channel}`);
      this.offlineQueue.push({ channel, event, data });
      return;
    }

    // Simulate network RTT for publish
    setTimeout(() => {
      this.dispatchLocally(channel, event, data);
    }, 50);
  }

  // Internal helper to trigger bound callbacks
  private dispatchLocally(channel: string, event: RealtimeEventName, data: any) {
    const channelEvents = this.subscriptions.get(channel);
    if (channelEvents && channelEvents.has(event)) {
      channelEvents.get(event)!.forEach(cb => cb(data));
    }
  }

  private flushOfflineQueue() {
    if (this.offlineQueue.length > 0) {
      console.log(`[MockRealtime] Flushing ${this.offlineQueue.length} queued events...`);
      const toFlush = [...this.offlineQueue];
      this.offlineQueue = [];
      toFlush.forEach(e => this.publish(e.channel, e.event, e.data));
    }
  }

  private startHeartbeat() {
    // In a real system, if server doesn't respond to ping, we set state to 'Reconnecting' with Exponential Backoff
    setInterval(() => {
      if (this.state === 'Connected') {
        // ping -> pong
      }
    }, 30000);
  }
}
