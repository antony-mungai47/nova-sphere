import { v4 as uuidv4 } from "uuid";
import { BaseSignal, EventName, SignalCategory, SignalPayload } from "./types";
import { DestinationRouter, ConsoleDestination, PostHogDestination } from "./DestinationRouter";
import { PrivacyLayer } from "./PrivacyLayer";

export class SignalsEngine {
  private router = new DestinationRouter();
  private privacy = new PrivacyLayer();
  
  private batch: BaseSignal[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_LIMIT = 20;
  private readonly BATCH_INTERVAL_MS = 5000;

  // Context state
  private sessionId: string;
  private deviceId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.getOrCreateCookie("ns_session_id");
    this.deviceId = this.getOrCreateCookie("ns_device_id", true); // Long lived

    // Register destinations
    this.router.register(new ConsoleDestination());
    this.router.register(new PostHogDestination());

    // Setup page unload flushes
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => this.flush());
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          this.flush();
        }
      });
    }
  }

  private getOrCreateCookie(name: string, longLived = false): string {
    if (typeof window === "undefined") return uuidv4();
    
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    
    const id = uuidv4();
    const expiry = longLived ? "max-age=31536000" : "Session"; // 1 year vs session
    document.cookie = `${name}=${id}; path=/; ${expiry}; SameSite=Strict`;
    return id;
  }

  public identify(userId: string) {
    this.userId = userId;
    // We could emit a merge identity signal here if we wanted
  }

  public track(
    eventName: EventName, 
    category: SignalCategory, 
    payload: SignalPayload, 
    isImmediate: boolean = false
  ) {
    let signal: BaseSignal = {
      id: uuidv4(),
      eventName,
      category,
      payload,
      isImmediate,
      context: {
        sessionId: this.sessionId,
        deviceId: this.deviceId,
        userId: this.userId,
        timestamp: new Date().toISOString(),
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
        referrer: typeof window !== "undefined" ? document.referrer : "",
        userAgent: typeof window !== "undefined" ? navigator.userAgent : "",
      }
    };

    if (!this.privacy.canTrack(signal)) return;
    signal = this.privacy.sanitize(signal);

    if (isImmediate) {
      this.router.route(signal);
    } else {
      this.enqueue(signal);
    }
  }

  private enqueue(signal: BaseSignal) {
    this.batch.push(signal);
    
    if (this.batch.length >= this.BATCH_LIMIT) {
      this.flush();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flush(), this.BATCH_INTERVAL_MS);
    }
  }

  public flush() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.batch.length === 0) return;

    // TODO: If offline, push to IndexedDB offline queue here instead of routing
    this.router.routeBatch([...this.batch]);
    this.batch = [];
  }
}

// Global Singleton
export const Telemetry = new SignalsEngine();
