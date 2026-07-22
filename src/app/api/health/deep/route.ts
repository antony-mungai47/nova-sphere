import { NextResponse } from 'next/server';
import { HealthService } from '@/modules/operations/services/HealthService';



export async function GET() {
  try {
    const report = await HealthService.checkPlatformHealth();
    
    // Check if any component is not 'Healthy'
    const isHealthy = Object.values(report).every(comp => comp.status === 'Healthy');
    
    if (isHealthy) {
      return NextResponse.json({ status: 'healthy', components: report }, { status: 200 });
    } else {
      return NextResponse.json({ status: 'degraded', components: report }, { status: 503 }); 
    }
  } catch (error: any) {
    return NextResponse.json({ status: 'down', error: error.message }, { status: 500 });
  }
}
