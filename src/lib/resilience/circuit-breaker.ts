/**
 * Enterprise Circuit Breaker
 * Prevents cascading failures when a downstream service is struggling.
 */
export class CircuitBreaker {
  private failureThreshold: number;
  private recoveryTimeout: number;
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(failureThreshold = 5, recoveryTimeout = 30000) {
    this.failureThreshold = failureThreshold;
    this.recoveryTimeout = recoveryTimeout;
  }

  async execute<T>(action: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit Breaker is OPEN. Downstream service unavailable.');
      }
    }

    try {
      const result = await action();
      // Success resets the breaker
      this.failures = 0;
      this.state = 'CLOSED';
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      if (this.failures >= this.failureThreshold) {
        this.state = 'OPEN';
        console.error('[CircuitBreaker] Threshold reached. Circuit is now OPEN.');
      }
      throw error;
    }
  }
}

// Singletons for external services
export const stripeCircuitBreaker = new CircuitBreaker(3, 10000); // 3 failures, 10s wait
export const aiCircuitBreaker = new CircuitBreaker(5, 30000);    // 5 failures, 30s wait
