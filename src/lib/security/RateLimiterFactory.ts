import { IRateLimiter } from "./IRateLimiter";
import { MemoryRateLimiter } from "./MemoryRateLimiter";
import { RedisRateLimiter } from "./RedisRateLimiter";

let defaultLimiter: IRateLimiter | null = null;

export function getRateLimiter(): IRateLimiter {
  if (!defaultLimiter) {
    if (process.env.NODE_ENV === "production" && !process.env.UPSTASH_REDIS_REST_URL) {
      console.warn("WARNING: Production rate limiting requires a distributed backend. Falling back to local MemoryRateLimiter which will not sync across edge nodes.");
      defaultLimiter = new MemoryRateLimiter(100, 60000);
      return defaultLimiter;
    }
    
    // Fallback to memory for local development / testing
    const isTest = process.env.PLAYWRIGHT_TEST === '1';
    defaultLimiter = new MemoryRateLimiter(isTest ? 500 : 100, 60000); 
  }
  return defaultLimiter;
}
