import { AIContext } from '../ContextEngine/ContextEngine';

export class SafetyEngine {
  
  /**
   * Validates if the user is authorized to call a specific tool.
   */
  static validateToolAccess(toolName: string, context: AIContext) {
    const adminTools = ['getRevenue', 'getInventoryAlerts', 'cancelOrder'];
    
    if (adminTools.includes(toolName) && context.role !== 'admin') {
      throw new Error(`Unauthorized: User cannot execute ${toolName}`);
    }

    return true;
  }

  /**
   * Basic injection check before passing prompt to LLM.
   */
  static scanPrompt(prompt: string): boolean {
    const dangerousPatterns = [
      /ignore previous instructions/i,
      /system prompt/i,
      /drop table/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(prompt)) {
        console.warn('[SafetyEngine] Detected potentially malicious prompt:', prompt);
        return false;
      }
    }
    
    return true;
  }
}
