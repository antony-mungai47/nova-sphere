# Chaos Testing Execution Report
**Date:** 2026-07-10
**Environment:** Staging (Simulated Production Load)

| Scenario | Expected | Actual Result | Recovery Time | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Redis Failure** | Rate limiter fallback, cache bypass | Passed. App successfully read directly from Postgres. Checkout unaffected. | <60s | PASS |
| **Stripe Outage** | 500 errors handled, Outbox exponential backoff | Passed. Async events entered PENDING state. | Auto-recovered | PASS |
| **Database Latency** | 2000ms injected. Circuit breakers trip on non-critical reads. | Passed. 500 rate < 1%. | Immediate upon removal | PASS |
| **Worker Crash** | Pods killed mid-process. Visibilty timeout triggers retry. | Passed. Exactly-once semantics held. No duplicate charges. | 5 mins | PASS |
