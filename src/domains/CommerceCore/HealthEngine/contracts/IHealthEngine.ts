export interface IHealthEngine {
  checkDatabase(): Promise<boolean>;
  checkEventBus(): Promise<boolean>;
  checkSearchProvider(): Promise<boolean>;
  checkStripe(): Promise<boolean>;
  checkRedis(): Promise<boolean>;
  getSystemHealth(): Promise<SystemHealthReport>;
}

export interface SystemHealthReport {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  checks: {
    database: boolean;
    eventBus: boolean;
    searchProvider: boolean;
    stripe: boolean;
    redis: boolean;
  };
}
