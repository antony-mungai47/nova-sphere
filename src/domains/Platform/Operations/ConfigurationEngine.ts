export class ConfigurationEngine {
  /**
   * Centralized configuration provider to avoid scattered process.env reads.
   */
  static get(key: string, defaultValue?: string): string {
    const value = process.env[key] || defaultValue;
    if (value === undefined) {
      // In strict mode, missing config should fail fast
      console.warn(`[ConfigurationEngine] Missing configuration for key: ${key}`);
    }
    return value || '';
  }

  static getNumber(key: string, defaultValue?: number): number {
    const value = this.get(key);
    if (!value) return defaultValue || 0;
    return Number(value);
  }

  static getBoolean(key: string, defaultValue?: boolean): boolean {
    const value = this.get(key);
    if (!value) return defaultValue || false;
    return value.toLowerCase() === 'true';
  }
}
