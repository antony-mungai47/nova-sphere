import { CheckoutMetrics } from "./CheckoutMetrics";

export interface AlertResult {
  name: string;
  severity: "P1" | "P2" | "P3";
  triggered: boolean;
  value: number;
  threshold: number;
  message: string;
}

export class CheckoutAlertEvaluator {
  public static evaluateAll(): AlertResult[] {
    const alerts: AlertResult[] = [];

    // P1: SagaManualReconciliationRequired
    const stuckSagas = CheckoutMetrics.getGauge("saga_stuck_total") || 0;
    alerts.push({
      name: "SagaManualReconciliationRequired",
      severity: "P1",
      triggered: stuckSagas > 0,
      value: stuckSagas,
      threshold: 0,
      message: `${stuckSagas} sagas flagged for manual reconciliation (>24h stuck).`
    });

    // P1: OutboxRelayLagCritical
    const oldestOutboxAge = CheckoutMetrics.getGauge("outbox_oldest_record_age_seconds") || 0;
    alerts.push({
      name: "OutboxRelayLagCritical",
      severity: "P1",
      triggered: oldestOutboxAge > 60,
      value: oldestOutboxAge,
      threshold: 60,
      message: `Oldest unpublished outbox event is ${oldestOutboxAge}s old (threshold: 60s).`
    });

    // P2: OutboxBacklogHigh
    const outboxBacklog = CheckoutMetrics.getGauge("outbox_backlog_count") || 0;
    alerts.push({
      name: "OutboxBacklogHigh",
      severity: "P2",
      triggered: outboxBacklog > 500,
      value: outboxBacklog,
      threshold: 500,
      message: `Outbox backlog count is ${outboxBacklog} records (threshold: 500).`
    });

    // P3: IdempotencyConflictSpike
    const idempotency409s = CheckoutMetrics.getCounter("idempotency_conflicts_409_total");
    alerts.push({
      name: "IdempotencyConflictSpike",
      severity: "P3",
      triggered: idempotency409s > 20,
      value: idempotency409s,
      threshold: 20,
      message: `Total 409 idempotency conflicts is ${idempotency409s} (threshold: 20).`
    });

    return alerts;
  }
}
