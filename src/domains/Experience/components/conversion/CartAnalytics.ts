"use client";

import { CartAnalyticsEvent } from "./types";

class CartAnalyticsService {
  private events: CartAnalyticsEvent[] = [];

  /**
   * Tracks a conversion-related event.
   * In V3.0, this will emit to the backend/AI engine.
   * For now, it logs to the console in development mode.
   */
  track(eventName: CartAnalyticsEvent["eventName"], payload: Record<string, any> = {}) {
    const event: CartAnalyticsEvent = {
      eventName,
      payload,
      timestamp: new Date().toISOString(),
    };
    
    this.events.push(event);
    
    if (process.env.NODE_ENV === "development") {
      console.log(`[CartAnalytics] ${eventName}`, payload);
    }
    
    // TODO (V3.0): Implement backend sync
    // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) })
  }

  getEvents() {
    return [...this.events];
  }
}

export const CartAnalytics = new CartAnalyticsService();
