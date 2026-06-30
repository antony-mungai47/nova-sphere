import { RealtimeEventName } from './EventRegistry';

export type ConnectionState = 'Connecting' | 'Connected' | 'Disconnected' | 'Reconnecting' | 'Offline' | 'Failed';

export interface IRealtimeEngine {
  /**
   * Initializes the engine and attempts to connect to the backend provider.
   */
  connect(): Promise<void>;

  /**
   * Gracefully disconnects the engine.
   */
  disconnect(): void;

  /**
   * Retrieves the current state of the connection.
   */
  getConnectionState(): ConnectionState;

  /**
   * Listens to changes in the connection state.
   */
  onConnectionStateChange(callback: (state: ConnectionState) => void): void;

  /**
   * Subscribes to a channel.
   */
  subscribe(channel: string): void;

  /**
   * Unsubscribes from a channel.
   */
  unsubscribe(channel: string): void;

  /**
   * Binds a callback to a specific event on a specific channel.
   */
  bind(channel: string, event: RealtimeEventName, callback: (data: any) => void): void;

  /**
   * Unbinds a callback from a specific event on a specific channel.
   */
  unbind(channel: string, event: RealtimeEventName, callback?: (data: any) => void): void;

  /**
   * Client-to-client publishing (usually restricted to Private/Presence channels).
   */
  publish(channel: string, event: RealtimeEventName, data: any): Promise<void>;
}
