# Outbox Dead Letter Queue (DLQ) Verification
**Date:** 2026-07-12
**Target:** `staging-worker-isolated`

## Verification Goal
Ensure that the Transactional Outbox pattern guarantees message delivery even when downstream consumers repeatedly fail, and that failed messages are safely routed to a DLQ for inspection and manual replay.

## Execution
1. **Fault Injection:** 
   Forced the `PaymentEngine` to reject all incoming `OrderCreated` events by injecting a hardcoded `500 Internal Server Error` into the staging Stripe webhook handler.
2. **Event Generation:** 
   Generated 10 mock orders. Outbox workers picked up the events and attempted dispatch.
3. **Retry Mechanism:** 
   Workers successfully executed exponential backoff (attempting at 1s, 5s, 30s, 60s, 300s).
4. **DLQ Routing:** 
   After 5 consecutive failures (max retries reached), the worker successfully transitioned the event status from `PENDING` to `FAILED` and inserted a corresponding record into the `OutboxDLQ` table.
5. **Inspection & Replay:** 
   Queried the DLQ table to verify all 10 messages were present. Removed the fault injection. Ran the `npm run worker:replay-dlq` script. All 10 messages successfully processed and transitioned to `PROCESSED`.

## Result
**Status:** PASS
**Data Loss:** 0 events dropped.
**Conclusion:** The Outbox DLQ guarantees reliable asynchronous processing under severe downstream failure.
