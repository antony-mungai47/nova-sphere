import { IAIProvider } from '../providers/IAIProvider';

export interface AgentConfig {
  name: string;
  role: string;
  allowedTools: string[];
  systemPrompt: string;
}

export class ShoppingAgent {
  private config: AgentConfig = {
    name: 'Nova Shopping Assistant',
    role: 'Help users find, compare, and purchase products.',
    allowedTools: ['SearchProducts', 'CompareProducts'],
    systemPrompt: 'You are an expert shopping assistant. You help users find exactly what they need.'
  };

  constructor(private aiProvider: IAIProvider) {}

  async handleQuery(userQuery: string, context: any) {
    // Orchestrator handles routing, this agent handles execution
    console.log(`[ShoppingAgent] Handling query: ${userQuery}`);
    return this.aiProvider.generateText(userQuery);
  }
}
