import { Destination, BaseSignal } from "./types";
import posthog from "posthog-js";

export class ConsoleDestination implements Destination {
  name = "Console";

  initialize() {
    console.log("[Signals] Console Destination Initialized");
  }

  send(signal: BaseSignal) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Signal: ${signal.eventName}]`, signal);
    }
  }

  sendBatch(signals: BaseSignal[]) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Signal Batch: ${signals.length} events]`, signals);
    }
  }
}

export class PostHogDestination implements Destination {
  name = "PostHog";
  private isInitialized = false;

  initialize() {
    if (typeof window !== "undefined" && !this.isInitialized) {
      // Assuming PostHog is already initialized in layout via PostHogProvider,
      // but we can ensure it's ready or just use the global posthog instance.
      this.isInitialized = true;
    }
  }

  send(signal: BaseSignal) {
    if (this.isInitialized) {
      posthog.capture(signal.eventName, {
        category: signal.category,
        ...signal.payload,
        $current_url: signal.context.pageUrl,
        $referrer: signal.context.referrer,
      });
    }
  }

  sendBatch(signals: BaseSignal[]) {
    // PostHog handles its own batching under the hood, so we just iterate
    signals.forEach(s => this.send(s));
  }
}

export class DestinationRouter {
  private destinations: Destination[] = [];

  register(destination: Destination) {
    destination.initialize();
    this.destinations.push(destination);
  }

  route(signal: BaseSignal) {
    this.destinations.forEach(dest => {
      try {
        dest.send(signal);
      } catch (e) {
        console.error(`[Signals] Failed to route to ${dest.name}`, e);
      }
    });
  }

  routeBatch(signals: BaseSignal[]) {
    this.destinations.forEach(dest => {
      try {
        dest.sendBatch(signals);
      } catch (e) {
        console.error(`[Signals] Failed to route batch to ${dest.name}`, e);
      }
    });
  }
}
