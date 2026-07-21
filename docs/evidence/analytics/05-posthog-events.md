# PostHog Event Documentation

The `processAnalyticsEvent` Inngest function reliably formats and forwards our Outbox events to PostHog.

## Tracking & Forwarding Code
We implemented `posthog-node` strictly on the backend to consume the sanitized Outbox events.
```ts
client.capture({
  distinctId: outboxEvent.userId || outboxEvent.sessionId || 'anonymous',
  event: outboxEvent.eventName,
  properties: {
    ...((outboxEvent.metadata as any) || {}),
    tenantId: outboxEvent.tenantId,
    vendorId: outboxEvent.vendorId,
    device: outboxEvent.device,
    country: outboxEvent.country,
    currency: outboxEvent.currency,
    source: outboxEvent.source,
    server_timestamp: outboxEvent.occurredAt
  }
});
```

## Supported KPI Generation
With this standard schema, PostHog dashboards are now capable of generating:
1. **AOV (Average Order Value)**: Aggregating `metadata.totalAmount` on `commerce.checkout.completed`.
2. **Auction Win Rate**: Ratio of `auction.won` to `auction.bid.placed`.
3. **CAC (Customer Acquisition Cost)**: Breaking down the user conversion by the `source` (UTM) tags passed in the standard schema.
4. **Repeat Purchase Rate**: Cohort analysis measuring time between consecutive `commerce.checkout.completed` events.
