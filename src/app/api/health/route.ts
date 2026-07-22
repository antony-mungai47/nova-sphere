import { NextResponse } from 'next/server';
import { HealthService } from '@/modules/operations/services/HealthService';
import { logger } from '@/lib/observability/logger';



export async function GET() {
  try {
    const report = await HealthService.checkPlatformHealth();
    const isHealthy = Object.values(report).every(comp => comp.status === 'Healthy');
    
    if (isHealthy) {
      logger.info('Health check passed', { report });
      return NextResponse.json({ status: 'healthy', components: report }, { status: 200 });
    } else {
      logger.warn('Health check degraded', { report });
      return NextResponse.json({ status: 'degraded', components: report }, { status: 503 }); // 503 Service Unavailable for load balancers
    }
  } catch (error: any) {
    logger.error('Health check failed catastrophically', error);
    return NextResponse.json({ status: 'down', error: error.message }, { status: 500 });
  }
}
