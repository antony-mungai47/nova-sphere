import { IWorkflowEngine } from './contracts/IWorkflowEngine';
import { InngestWorkflowEngine } from './providers/InngestWorkflowEngine';

// Default export uses Inngest for production.
export const WorkflowEngine: IWorkflowEngine = new InngestWorkflowEngine();
