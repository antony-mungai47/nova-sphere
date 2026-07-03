import { prisma } from '@/lib/prisma';

export interface AppConfiguration {
  storeName: string;
  supportEmail: string;
  defaultCurrency: string;
  features: Record<string, boolean>;
  [key: string]: any;
}

export class ConfigurationEngine {
  private static cache: AppConfiguration | null = null;
  private static lastFetched: number = 0;
  private static readonly TTL = 1000 * 60 * 5; // 5 minutes

  static async getConfig(tenantId: string = 'DEFAULT'): Promise<AppConfiguration> {
    const now = Date.now();
    if (this.cache && (now - this.lastFetched) < this.TTL) {
      return this.cache;
    }

    const settings = await prisma.storeSettings.findFirst();

    this.cache = {
      storeName: settings?.storeName || process.env.NEXT_PUBLIC_STORE_NAME || 'Nova Sphere',
      supportEmail: settings?.supportEmail || process.env.SUPPORT_EMAIL || 'support@novasphere.com',
      defaultCurrency: settings?.currency || 'USD',
      features: {}
    };

    this.lastFetched = now;
    return this.cache;
  }
}
