import { IRateLimiter } from "./IRateLimiter";
import { MemoryRateLimiter } from "./MemoryRateLimiter";

let defaultLimiter: IRateLimiter | null = null;

export function getRateLimiter(): IRateLimiter {
  if (!defaultLimiter) {
    // We can swap this for UpstashRateLimiter later when Redis credentials are provided.
    // 500 requests per minute to avoid blocking Playwright automated tests locally.
    const isTest = process.env.PLAYWRIGHT_TEST === '1';
    defaultLimiter = new MemoryRateLimiter(isTest ? 500 : 100, 60000); 
  }
  return defaultLimiter;
}
