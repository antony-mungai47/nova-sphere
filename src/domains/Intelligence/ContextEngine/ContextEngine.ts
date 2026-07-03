export interface AIContext {
  userId?: string;
  role: 'customer' | 'admin' | 'anonymous';
  region: string;
  currency: string;
  language: string;
  activeFeatureCarts?: number;
  recentViews?: string[];
  cartItemIds?: string[];
  tenantId?: string;
  timestamp: string;
}

export class ContextEngine {
  
  /**
   * Assembles the runtime context before a prompt is sent to the LLM.
   */
  static async assembleContext(requestContext: { userId?: string, url?: string, userAgent?: string }): Promise<AIContext> {
    
    // In a real implementation, query the session, user profile, and recent activity here.
    const role = requestContext.userId ? 'customer' : 'anonymous'; // Simplification
    
    return {
      userId: requestContext.userId,
      role,
      region: 'US', // Fallback, would parse from headers or profile
      currency: 'USD',
      language: 'en',
      timestamp: new Date().toISOString(),
      recentViews: [], // Would fetch from PersonalizationEngine
      cartItemIds: [], // Would fetch from Cart Engine
    };
  }

  /**
   * Formats the context into a system prompt injection.
   */
  static formatForPrompt(context: AIContext): string {
    return `
=== SYSTEM CONTEXT ===
User Role: ${context.role}
Region/Currency: ${context.region} / ${context.currency}
Language: ${context.language}
Current Time: ${context.timestamp}
======================
`;
  }
}
