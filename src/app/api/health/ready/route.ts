import { NextResponse } from 'next/server';
import { HealthEngine } from '@/domains/CommerceCore/HealthEngine/services/HealthEngine';

const healthEngine = new HealthEngine();

export async function GET() {
  try {
    const report = await healthEngine.getSystemHealth();
    
    if (report.status === 'healthy') {
      return NextResponse.json(report, { status: 200 });
    } else {
      // Readiness probe strictly requires all dependencies to be up.
      // If degraded, we return 503 so load balancers remove us from rotation.
      return NextResponse.json(report, { status: 503 }); 
    }
  } catch (error: any) {
    return NextResponse.json({ status: 'down', error: error.message }, { status: 500 });
  }
}
