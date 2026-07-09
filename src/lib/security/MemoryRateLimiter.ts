import { IRateLimiter, RateLimitResult } from "./IRateLimiter";

export class MemoryRateLimiter implements IRateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const record = this.store.get(identifier);

    if (!record || now > record.resetTime) {
      // Create or reset record
      this.store.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset: now + this.windowMs,
      };
    }

    if (record.count >= this.maxRequests) {
      // Rate limit exceeded
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: record.resetTime,
      };
    }

    // Increment request count
    record.count += 1;
    this.store.set(identifier, record);

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - record.count,
      reset: record.resetTime,
    };
  }
}
