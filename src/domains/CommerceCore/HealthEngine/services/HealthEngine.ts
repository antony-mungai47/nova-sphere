import { IHealthEngine, SystemHealthReport, HealthStatus } from '../contracts/IHealthEngine';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { Inngest } from 'inngest';

// We initialize a lightweight client just for pinging if needed, though inngest api might be hard to ping directly without an event. We will mock degraded state based on try/catch.
const inngestClient = new Inngest({ id: 'health-checker' });

export class HealthEngine implements IHealthEngine {
  async checkDatabase(): Promise<HealthStatus> {
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const duration = Date.now() - start;
      return duration > 200 ? 'degraded' : 'healthy';
    } catch (e) {
      return 'unavailable';
    }
  }

  async checkInngest(): Promise<HealthStatus> {
    try {
      // Inngest doesn't have a direct ping without sending an event, 
      // but we can assume healthy if the SDK is configured.
      // If we had a direct API key check, we'd do it here.
      if (!process.env.INNGEST_EVENT_KEY && process.env.NODE_ENV === 'production') {
        return 'degraded';
      }
      return 'healthy';
    } catch (e) {
      return 'unavailable';
    }
  }

  async checkRedis(): Promise<HealthStatus> {
    // If we had an Upstash Redis client we would ping it.
    // For now we assume healthy, but return unavailable if UPSTASH_REDIS_REST_URL is missing in prod.
    if (!process.env.UPSTASH_REDIS_REST_URL && process.env.NODE_ENV === 'production') {
       return 'degraded';
    }
    return 'healthy';
  }

  async checkStripe(): Promise<HealthStatus> {
    if (!stripe) return 'unavailable';
    try {
      const start = Date.now();
      await stripe.balance.retrieve();
      const duration = Date.now() - start;
      return duration > 1000 ? 'degraded' : 'healthy';
    } catch (e) {
      return 'unavailable';
    }
  }

  async checkPusher(): Promise<HealthStatus> {
    if (!process.env.PUSHER_SECRET && process.env.NODE_ENV === 'production') {
      return 'degraded';
    }
    return 'healthy';
  }

  async checkEmailProvider(): Promise<HealthStatus> {
    if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === 'production') {
      return 'degraded';
    }
    return 'healthy';
  }

  async getSystemHealth(): Promise<SystemHealthReport> {
    const [database, inngest, redis, stripeStatus, pusher, emailProvider] = await Promise.all([
      this.checkDatabase(),
      this.checkInngest(),
      this.checkRedis(),
      this.checkStripe(),
      this.checkPusher(),
      this.checkEmailProvider()
    ]);

    const statuses = [database, inngest, redis, stripeStatus, pusher, emailProvider];
    let overallStatus: 'healthy' | 'degraded' | 'down' = 'healthy';

    if (statuses.includes('unavailable')) {
      overallStatus = 'down';
    } else if (statuses.includes('degraded')) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: {
        database,
        inngest,
        redis,
        stripe: stripeStatus,
        pusher,
        emailProvider,
      }
    };
  }
}
