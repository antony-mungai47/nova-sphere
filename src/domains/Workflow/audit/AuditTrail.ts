export interface AuditEvent {
  workflowId: string;
  correlationId: string;
  timestamp: string;
  actor: string;
  fromState: string;
  toState: string;
  reason: string;
}

/**
 * Immutable log of all workflow state transitions.
 * Crucial for compliance and operational support.
 */
export class AuditTrail {
  private events: AuditEvent[] = [];

  public logTransition(event: AuditEvent): void {
    // In production, this writes to an append-only datastore or Kafka topic
    this.events.push(event);
    console.log(`[Audit] [${event.timestamp}] Workflow ${event.workflowId} transition: ${event.fromState} -> ${event.toState} by ${event.actor}. Reason: ${event.reason}`);
  }

  public getHistory(workflowId: string): AuditEvent[] {
    return this.events.filter(e => e.workflowId === workflowId);
  }
}

export const GlobalAuditTrail = new AuditTrail();
