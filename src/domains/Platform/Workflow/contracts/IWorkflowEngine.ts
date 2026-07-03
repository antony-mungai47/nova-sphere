export interface WorkflowOptions {
  idempotencyKey?: string;
  delay?: string;
  priority?: "low" | "normal" | "high" | "critical";
}

export interface IWorkflowEngine {
  /**
   * Executes a workflow immediately (or pushes it to the queue for immediate execution)
   */
  execute(workflowName: string, payload: any, options?: WorkflowOptions): Promise<{ workflowId: string }>;
  
  /**
   * Schedules a workflow to execute at a specific future time or after a delay
   */
  schedule(workflowName: string, payload: any, options: WorkflowOptions): Promise<{ workflowId: string }>;
  
  /**
   * Cancels a running or scheduled workflow
   */
  cancel(workflowId: string): Promise<boolean>;
  
  /**
   * Used within a workflow step to wait for an external domain event before continuing
   */
  waitForEvent(eventName: string, matchCondition: Record<string, string>, timeout: string): Promise<any>;
  
  /**
   * Used within a workflow to publish domain events to the Event Bus
   */
  publish(eventName: string, payload: any): Promise<void>;
}
