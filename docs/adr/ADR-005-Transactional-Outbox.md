# ADR-005: Why Transactional Outbox was Selected

**Date:** July 2026
**Status:** Accepted
**Context:** When an order is placed, several secondary tasks must occur: sending a confirmation email, updating the search index, and notifying the fulfillment center. In V1, these tasks were executed synchronously alongside the database transaction. If the email API timed out, the entire order failed and the user saw a 500 error, resulting in lost sales.
**Decision:** We adopted the Transactional Outbox pattern alongside Inngest for asynchronous workflows.
**Consequences:**
- Secondary tasks are decoupled from the main critical path.
- Instead of calling the email service directly, the checkout transaction writes a `NotificationEvent` to the database (or queues it securely) in the same atomic transaction as the order creation.
- A background worker (Inngest) guarantees at-least-once execution of the notification, allowing for automatic retries, backoff, and failure recovery without breaking the user experience.
