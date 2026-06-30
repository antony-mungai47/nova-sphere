import { NextResponse } from 'next/server';
import { HealthEngine } from '@/domains/CommerceCore/HealthEngine/services/HealthEngine';
import { logger } from '@/lib/observability/logger';

const healthEngine = new HealthEngine();

export async function GET() {
  try {
    const report = await healthEngine.getSystemHealth();
    
    if (report.status === 'healthy') {
      logger.info('Health check passed', { report });
      return NextResponse.json(report, { status: 200 });
    } else {
      logger.warn('Health check degraded', { report });
      return NextResponse.json(report, { status: 503 }); // 503 Service Unavailable for load balancers
    }
  } catch (error: any) {
    logger.error('Health check failed catastrophically', error);
    return NextResponse.json({ status: 'down', error: error.message }, { status: 500 });
  }
}
