export class ConfigurationService {
  private config: Map<string, string> = new Map();

  constructor() {
    this.config.set("MAINTENANCE_MODE", "false");
    this.config.set("LOG_LEVEL", "info");
    this.config.set("MAX_CART_ITEMS", "50");
  }

  public get(key: string): string | null {
    return this.config.get(key) || null;
  }

  public getBoolean(key: string): boolean {
    return this.config.get(key) === "true";
  }

  public getNumber(key: string): number {
    return parseInt(this.config.get(key) || "0", 10);
  }

  public set(key: string, value: string): void {
    // In production, this would persist to a distributed K/V store like Consul or Redis
    this.config.set(key, value);
  }
}

export const GlobalConfig = new ConfigurationService();

/**
 * Diagnostics layer for Platform Health
 */
export class HealthDiagnostics {
  public async checkAllSystems(): Promise<{ status: 'healthy' | 'degraded' | 'down', components: any }> {
    return {
      status: 'healthy',
      components: {
        database: 'up',
        redis: 'up',
        ai_gateway: 'up',
        feature_flags: 'up'
      }
    };
  }
}

export const GlobalHealth = new HealthDiagnostics();
