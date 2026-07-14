/**
 * In-memory store for Shopping Session context (can be backed by Redis in production).
 * This allows agents to recall what the user was doing 5 minutes ago.
 */
export class ShoppingMemory {
  private memoryMap = new Map<string, string[]>();

  public addContext(sessionId: string, context: string) {
    const existing = this.memoryMap.get(sessionId) || [];
    existing.push(context);
    // Keep only last 10 contexts to prevent prompt bloat
    if (existing.length > 10) existing.shift();
    this.memoryMap.set(sessionId, existing);
  }

  public getContext(sessionId: string): string[] {
    return this.memoryMap.get(sessionId) || [];
  }

  public clear(sessionId: string) {
    this.memoryMap.delete(sessionId);
  }
}

export const GlobalShoppingMemory = new ShoppingMemory();
