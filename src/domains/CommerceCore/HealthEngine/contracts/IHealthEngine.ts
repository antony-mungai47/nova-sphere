export type HealthStatus = 'healthy' | 'degraded' | 'unavailable';

export interface IHealthEngine {
  checkDatabase(): Promise<HealthStatus>;
  checkInngest(): Promise<HealthStatus>;
  checkRedis(): Promise<HealthStatus>;
  checkStripe(): Promise<HealthStatus>;
  checkPusher(): Promise<HealthStatus>;
  checkEmailProvider(): Promise<HealthStatus>;
  getSystemHealth(): Promise<SystemHealthReport>;
}

export interface SystemHealthReport {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  checks: {
    database: HealthStatus;
    inngest: HealthStatus;
    redis: HealthStatus;
    stripe: HealthStatus;
    pusher: HealthStatus;
    emailProvider: HealthStatus;
  };
}
