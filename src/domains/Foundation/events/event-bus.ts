// A simple in-memory Event Bus for Domain Events.
// In a highly scaled production environment, this could be replaced with Redis Pub/Sub, Kafka, or AWS EventBridge.

type EventHandler<T = any> = (payload: T) => Promise<void> | void;

class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, EventHandler[]> = new Map();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe<T>(eventName: string, handler: EventHandler<T>): void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)!.push(handler);
  }

  public publish<T>(eventName: string, payload: T): void {
    const handlers = this.listeners.get(eventName) || [];
    
    // Execute asynchronously to prevent blocking the main business transaction
    handlers.forEach(handler => {
      setImmediate(async () => {
        try {
          await handler(payload);
        } catch (error) {
          console.error(`[EventBus] Error in handler for event ${eventName}:`, error);
        }
      });
    });
  }
}

export const DomainEvents = EventBus.getInstance();
