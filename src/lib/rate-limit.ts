export class RateLimiter {
  private cache = new Map<string, { count: number; timestamp: number }>();
  private windowMs: number;
  private maxLimit: number;

  constructor(windowMs: number = 60000, maxLimit: number = 100) {
    this.windowMs = windowMs;
    this.maxLimit = maxLimit;
  }

  /**
   * Check if the given IP/Identifier is rate limited.
   * Returns true if request should be allowed, false if blocked.
   */
  check(identifier: string): boolean {
    const now = Date.now();
    const record = this.cache.get(identifier);

    if (!record) {
      this.cache.set(identifier, { count: 1, timestamp: now });
      return true;
    }

    if (now - record.timestamp > this.windowMs) {
      // Reset window
      this.cache.set(identifier, { count: 1, timestamp: now });
      return true;
    }

    if (record.count >= this.maxLimit) {
      return false; // Rate limited
    }

    record.count += 1;
    this.cache.set(identifier, record);
    return true;
  }
}

// Global instance for general API routes (100 req per minute per IP)
export const globalRateLimiter = new RateLimiter(60000, 100);

// Stricter instance for authentication/sensitive actions (10 req per minute per IP)
export const strictRateLimiter = new RateLimiter(60000, 10);
