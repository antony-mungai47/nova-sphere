import { IHealthEngine, SystemHealthReport } from '../contracts/IHealthEngine';
import { prisma } from '@/lib/prisma';
// import { inngest } from '@/lib/inngest/client';

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
    // Ping Inngest API / redis
    return true;
  }

  async checkSearchProvider(): Promise<boolean> {
    // Ping Algolia/Meilisearch
    return true;
  }

  async getSystemHealth(): Promise<SystemHealthReport> {
    const [db, eventBus, search] = await Promise.all([
      this.checkDatabase(),
      this.checkEventBus(),
      this.checkSearchProvider()
    ]);

    const isHealthy = db && eventBus && search;

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database: db,
        eventBus,
        searchProvider: search,
      }
    };
  }
}
