import { WorkflowDefinition } from "../engine/StateMachine";

export const RefundWorkflowV1: WorkflowDefinition = {
  id: "refund_pipeline",
  version: "v1",
  initialState: "pending_review",
  states: [
    { name: "pending_review" },
    { 
      name: "approved",
      onEnter: async (context) => {
        console.log(`[RefundWorkflow] Triggering payment gateway refund for order ${context.orderId}`);
      }
    },
    { 
      name: "rejected",
      onEnter: async (context) => {
        console.log(`[RefundWorkflow] Sending rejection email for order ${context.orderId}`);
      }
    },
    { name: "completed" }
  ],
  transitions: [
    {
      from: "pending_review",
      to: "approved",
      event: "APPROVE",
      action: async (context) => console.log("Approving refund...")
    },
    {
      from: "pending_review",
      to: "rejected",
      event: "REJECT",
      action: async (context) => console.log("Rejecting refund...")
    },
    {
      from: "approved",
      to: "completed",
      event: "PAYMENT_CLEARED"
    }
  ]
};
