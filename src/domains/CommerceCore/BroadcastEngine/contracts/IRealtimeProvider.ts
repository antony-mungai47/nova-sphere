export interface IRealtimeProvider {
  /**
   * Publishes a message to a specific channel.
   * @param channel The channel name (e.g. 'public-auction-123' or 'private-admin-dash')
   * @param event The event name (e.g. 'BidPlaced')
   * @param data The JSON payload
   */
  publish(channel: string, event: string, data: any): Promise<void>;

  /**
   * Subscribes to a channel (Client-side use case)
   */
  subscribe(channel: string, event: string, callback: (data: any) => void): void;

  /**
   * Unsubscribes from a channel
   */
  unsubscribe(channel: string, event?: string): void;

  /**
   * Triggers a typing indicator (Client-side presence)
   */
  typing(channel: string, isTyping: boolean): Promise<void>;
}
