export type SignalCategory = 
  | "commerce"
  | "interaction"
  | "engagement"
  | "search"
  | "ai_training"
  | "performance";

export type EventName = 
  // Commerce
  | "product.viewed"
  | "product.impression"
  | "product.shared"
  | "cart.added"
  | "cart.removed"
  | "checkout.started"
  | "checkout.completed"
  | "wishlist.added"
  | "coupon.applied"
  // Interaction
  | "button.clicked"
  | "modal.opened"
  | "drawer.opened"
  // Engagement
  | "scroll.depth"
  | "session.duration"
  // Search
  | "search.executed"
  | "search.cleared"
  // AI Training
  | "recommendation.clicked"
  | "recommendation.ignored"
  | "recommendation.viewed";

export interface SignalContext {
  sessionId: string;
  userId?: string;
  deviceId: string;
  timestamp: string;
  pageUrl: string;
  referrer: string;
  userAgent: string;
}

export interface SignalPayload {
  [key: string]: any;
}

export interface BaseSignal {
  id: string; // Unique event ID
  eventName: EventName;
  category: SignalCategory;
  payload: SignalPayload;
  context: SignalContext;
  isImmediate: boolean; // True for actions like cart.added, false for passive like scroll.depth
}

export interface Destination {
  name: string;
  initialize: () => void | Promise<void>;
  send: (signal: BaseSignal) => void | Promise<void>;
  sendBatch: (signals: BaseSignal[]) => void | Promise<void>;
}
