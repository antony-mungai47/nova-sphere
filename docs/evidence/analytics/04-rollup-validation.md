# Rollup Validation

The architecture has fully shifted from querying raw transaction tables to utilizing Materialized Rollup Tables populated via the `Inngest` event pipeline.

## Near-Real-Time Execution
When a `commerce.checkout.completed` event is dispatched to the `AnalyticsEvent` outbox, Inngest triggers the `processAnalyticsEvent` function.
This immediately invokes `prisma.dailyMetrics.upsert`, incrementing `revenue` and `orders` dynamically. 

This guarantees the Admin Dashboard has sub-100ms load times for Revenue charts, avoiding expensive `SUM()` queries over massive historical data.

## Nightly Reconciliation CRON
We implemented `nightlyReconciliation` via Inngest (`cron: '0 0 * * *'`).
At midnight UTC, this function scans the primary `Order` table for the previous day, recalculates the exact `_sum` of captured payments, and overwrites the `DailyMetrics` table. This acts as a self-healing mechanism to correct any data drift caused by missed events, manual refunds, or chargebacks that occurred outside the standard flow.

## Validated Tables
- `DailyMetrics`
- `VendorMetrics`
- `CategoryMetrics`
- `AuctionMetrics`
- `CustomerMetrics`
