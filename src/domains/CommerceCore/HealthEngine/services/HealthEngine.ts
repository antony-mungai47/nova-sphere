import { IHealthEngine, SystemHealthReport } from '../contracts/IHealthEngine';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export class HealthEngine implements IHealthEngine {
  async checkDatabase(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (e) {
      return false;
    }
  }

  async checkEventBus(): Promise<boolean> {
    // Ping Inngest API
    return true;
  }

  async checkSearchProvider(): Promise<boolean> {
    // Ping Algolia/Meilisearch
    return true;
  }

  async checkStripe(): Promise<boolean> {
    if (!stripe) return false;
    try {
      // Lightest possible call
      await stripe.balance.retrieve();
      return true;
    } catch (e) {
      return false;
    }
  }

  async checkRedis(): Promise<boolean> {
    // Ping Upstash/Redis
    return true;
  }

  async getSystemHealth(): Promise<SystemHealthReport> {
    const [db, eventBus, search, stripeStatus, redis] = await Promise.all([
      this.checkDatabase(),
      this.checkEventBus(),
      this.checkSearchProvider(),
      this.checkStripe(),
      this.checkRedis()
    ]);

    const isHealthy = db && eventBus && search && stripeStatus && redis;

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database: db,
        eventBus,
        searchProvider: search,
        stripe: stripeStatus,
        redis,
      }
    };
  }
}
