import { GlobalWorkflowRegistry } from "../engine/VersionRegistry";
import { RefundWorkflowV1 } from "./RefundWorkflow.v1";

// Registration hook for application startup
export function bootstrapWorkflows() {
  GlobalWorkflowRegistry.register(RefundWorkflowV1, true);
  console.log("[Workflow] Bootstrapped active workflows.");
}
