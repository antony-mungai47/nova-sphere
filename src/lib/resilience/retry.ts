/**
 * Enterprise Retry Policy with Exponential Backoff
 */
export async function withRetry<T>(
  action: () => Promise<T>, 
  maxAttempts: number = 3, 
  baseDelayMs: number = 500
): Promise<T> {
  let attempt = 1;

  while (attempt <= maxAttempts) {
    try {
      return await action();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`[RetryPolicy] Action failed, retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxAttempts})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }
  
  throw new Error('Unreachable code');
}
