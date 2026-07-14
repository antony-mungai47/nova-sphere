import { GlobalAuditTrail } from "../audit/AuditTrail";

export interface WorkflowState {
  name: string;
  onEnter?: (context: any) => Promise<void>;
  onExit?: (context: any) => Promise<void>;
}

export interface WorkflowTransition {
  from: string;
  to: string;
  event: string;
  action?: (context: any) => Promise<void>;
}

export interface WorkflowDefinition {
  id: string;
  version: string;
  initialState: string;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
}

export class StateMachineRunner {
  private definition: WorkflowDefinition;
  
  constructor(definition: WorkflowDefinition) {
    this.definition = definition;
  }

  public getDefinitionId(): string {
    return `${this.definition.id}_${this.definition.version}`;
  }

  public async triggerEvent(
    workflowInstanceId: string, 
    currentState: string, 
    event: string, 
    context: any, 
    actor: string,
    reason: string
  ): Promise<string> {
    const transition = this.definition.transitions.find(t => t.from === currentState && t.event === event);
    if (!transition) {
      throw new Error(`Invalid transition: ${event} from state ${currentState} in workflow ${this.definition.id}`);
    }

    const currentStateObj = this.definition.states.find(s => s.name === currentState);
    const nextStateObj = this.definition.states.find(s => s.name === transition.to);

    if (currentStateObj?.onExit) await currentStateObj.onExit(context);
    if (transition.action) await transition.action(context);
    
    // Log transition
    GlobalAuditTrail.logTransition({
      workflowId: workflowInstanceId,
      correlationId: context.correlationId || crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      actor,
      fromState: currentState,
      toState: transition.to,
      reason
    });

    if (nextStateObj?.onEnter) await nextStateObj.onEnter(context);

    return transition.to;
  }
}
