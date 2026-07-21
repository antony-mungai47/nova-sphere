import { IRateLimiter } from "./IRateLimiter";

export class RedisRateLimiter implements IRateLimiter {
  constructor(private limitCount: number, private windowMs: number) {}

  async limit(identifier: string) {
    throw new Error("RedisRateLimiter is not configured. A distributed backend (e.g., Upstash) is required for production.");
    return {
      success: false,
      limit: this.limitCount,
      remaining: 0,
      reset: Date.now() + this.windowMs
    };
  }
}
