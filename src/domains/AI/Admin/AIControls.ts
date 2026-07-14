export interface AICapability {
  id: string;
  name: string;
  enabled: boolean;
  dailyBudgetTokens: number;
}

export class AIControls {
  private capabilities: Map<string, AICapability> = new Map();

  constructor() {
    this.capabilities.set("semantic_search", { id: "semantic_search", name: "Semantic Search", enabled: true, dailyBudgetTokens: 500000 });
    this.capabilities.set("dynamic_pricing", { id: "dynamic_pricing", name: "Dynamic Pricing", enabled: true, dailyBudgetTokens: 100000 });
    this.capabilities.set("personalization", { id: "personalization", name: "Personalization", enabled: true, dailyBudgetTokens: 300000 });
  }

  public isEnabled(capabilityId: string): boolean {
    return this.capabilities.get(capabilityId)?.enabled ?? false;
  }

  public setEnabled(capabilityId: string, enabled: boolean): void {
    const cap = this.capabilities.get(capabilityId);
    if (cap) {
      cap.enabled = enabled;
      this.capabilities.set(capabilityId, cap);
      console.log(`[AI Controls] ${cap.name} is now ${enabled ? 'ENABLED' : 'DISABLED'}`);
    }
  }

  public getCapability(capabilityId: string): AICapability | undefined {
    return this.capabilities.get(capabilityId);
  }
}

export const GlobalAIControls = new AIControls();
