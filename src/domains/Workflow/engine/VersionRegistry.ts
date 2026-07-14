import { WorkflowDefinition, StateMachineRunner } from "./StateMachine";

/**
 * Registry to manage active workflow definitions by version.
 * Ensures that if a workflow is updated to v2, existing v1 orders finish out on v1.
 */
export class WorkflowVersionRegistry {
  private runners: Map<string, StateMachineRunner> = new Map();
  private latestVersions: Map<string, string> = new Map();

  public register(definition: WorkflowDefinition, isLatest: boolean = true): void {
    const runner = new StateMachineRunner(definition);
    this.runners.set(runner.getDefinitionId(), runner);
    
    if (isLatest) {
      this.latestVersions.set(definition.id, definition.version);
    }
  }

  public getRunner(workflowId: string, version?: string): StateMachineRunner {
    const targetVersion = version || this.latestVersions.get(workflowId);
    if (!targetVersion) throw new Error(`No version found for workflow ${workflowId}`);
    
    const runner = this.runners.get(`${workflowId}_${targetVersion}`);
    if (!runner) throw new Error(`Runner not found for ${workflowId} v${targetVersion}`);
    
    return runner;
  }
}

export const GlobalWorkflowRegistry = new WorkflowVersionRegistry();
