import { prisma } from "@/lib/prisma";

export class IncidentEngine {
  /**
   * Reports an SLO Violation. If the error budget is depleted, raises a P1 Incident.
   */
  static async reportSloViolation(params: {
    service: string;
    metric: string; // e.g. "Availability", "Latency"
    observedValue: number;
    thresholdValue: number;
    description: string;
  }) {
    // In a real APM, this might talk to Datadog or PagerDuty.
    console.error(`[SLO_VIOLATION] ${params.service} ${params.metric}: ${params.observedValue} (Threshold: ${params.thresholdValue})`);
    
    // Create an incident in our DB
    const incident = await prisma.incident.create({
      data: {
        title: `SLO Violation: ${params.service} ${params.metric}`,
        summary: params.description,
        affectedService: params.service,
        severity: "CRITICAL",
        startedAt: new Date(),
        detectedAt: new Date(),
        status: "OPEN"
      }
    });

    // We could emit to Inngest here to page the on-call engineer via SMS/Slack
    // await inngest.send({ name: "incident/created", data: { incidentId: incident.id } });

    return incident;
  }
}
