# Why Stripe uses the Outbox pattern\n\n**Date:** July 2026
**Status:** Accepted
**Context:** When a Stripe webhook is received (e.g. `payment_intent.succeeded`), we need to update the Order status, update the Ledger, and trigger downstream fulfillment logic. Doing this synchronously risks timeouts and partial failures if downstream services are slow.
**Decision:** We implemented the Transactional Outbox pattern specifically for Stripe events.
**Consequences:**
- The webhook handler only performs an atomic database transaction (updating Order, Attempt, Ledger, and inserting an `OutboxEvent`).
- If the database transaction succeeds, Stripe receives a 200 OK immediately.
- A background processor (Inngest) reliably picks up the `OutboxEvent` to trigger fulfillment, ensuring Eventual Consistency without holding the webhook connection open.\n