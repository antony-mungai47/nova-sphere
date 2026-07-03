import { IWorkflowEngine, WorkflowOptions } from '../contracts/IWorkflowEngine';
import { inngest } from '@/lib/inngest/client';

export class InngestWorkflowEngine implements IWorkflowEngine {
  async execute(workflowName: string, payload: any, options?: WorkflowOptions): Promise<{ workflowId: string }> {
    // Inngest uses event names to trigger functions
    const eventPayload: any = {
      name: workflowName,
      data: payload,
    };

    // Note: Inngest handles idempotency based on event data or distinct IDs 
    // depending on function config, but we can pass it in the event for reference.
    if (options?.idempotencyKey) {
      eventPayload.data._idempotencyKey = options.idempotencyKey;
    }

    const { ids } = await inngest.send(eventPayload);
    
    return { workflowId: ids.length > 0 ? ids[0] : `wf-${Date.now()}` };
  }

  async schedule(workflowName: string, payload: any, options: WorkflowOptions): Promise<{ workflowId: string }> {
    // We send an event and let the workflow handle the delay via step.sleep(options.delay), 
    // or we could use Inngest's scheduled events feature.
    // For now, we will pass the delay down into the payload.
    const eventPayload: any = {
      name: workflowName,
      data: {
        ...payload,
        _scheduledDelay: options.delay,
      },
    };

    if (options.idempotencyKey) {
      eventPayload.data._idempotencyKey = options.idempotencyKey;
    }

    const { ids } = await inngest.send(eventPayload);
    
    return { workflowId: ids.length > 0 ? ids[0] : `wf-${Date.now()}` };
  }

  async cancel(workflowId: string): Promise<boolean> {
    // Inngest provides cancel functionality on step runs if configured, 
    // but typically you cancel via an event (e.g. step.waitForEvent('Cancel'))
    // Here we emit a global cancel event that running workflows can listen to.
    await inngest.send({
      name: 'Workflow.Cancel',
      data: { workflowId }
    });
    return true;
  }

  async waitForEvent(eventName: string, matchCondition: Record<string, string>, timeout: string): Promise<any> {
    throw new Error('waitForEvent should be called via step.waitForEvent inside the Inngest function handler, not via the Engine facade.');
  }

  async publish(eventName: string, payload: any): Promise<void> {
    await inngest.send({
      name: eventName,
      data: payload,
    });
  }
}
