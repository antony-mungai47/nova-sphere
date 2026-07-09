export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export interface IRateLimiter {
  /**
   * Checks if a request is allowed based on the identifier (e.g. IP address or user ID).
   * @param identifier The unique identifier for the requester
   */
  limit(identifier: string): Promise<RateLimitResult>;
}
