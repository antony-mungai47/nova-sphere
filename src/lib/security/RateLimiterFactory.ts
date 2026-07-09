import { IRateLimiter } from "./IRateLimiter";
import { MemoryRateLimiter } from "./MemoryRateLimiter";

let defaultLimiter: IRateLimiter | null = null;

export function getRateLimiter(): IRateLimiter {
  if (!defaultLimiter) {
    // We can swap this for UpstashRateLimiter later when Redis credentials are provided.
    // 500 requests per minute to avoid blocking Playwright automated tests locally.
    defaultLimiter = new MemoryRateLimiter(500, 60000); 
  }
  return defaultLimiter;
}
