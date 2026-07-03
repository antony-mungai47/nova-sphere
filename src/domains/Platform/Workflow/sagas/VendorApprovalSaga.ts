import { inngest } from '@/lib/inngest/client';
import { KYCEngine } from '../../../Marketplace/Engines/KYCEngine';

export const vendorApprovalSaga = (inngest as any).createFunction(
  { id: 'vendor-approval-saga', retries: 3 },
  { event: 'VendorApprovalRequested.v1' },
  async ({ event, step }: any) => {
    const { tenantId, idempotencyKey } = event.data;

    await step.run('run-kyc-evaluation', async () => {
      await KYCEngine.evaluateProfile(tenantId);
    });
    
    // In a full saga, we might check if they were approved, and if so,
    // dispatch a notification, setup their wallet, etc.
    
    return { success: true };
  }
);

