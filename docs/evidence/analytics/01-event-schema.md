# Event Schema Documentation

The Business Event Bus is the canonical source of truth for all telemetry and business analytics in Nova Sphere V3. It acts as an Outbox capturing frontend and backend interactions, which are fanned out to downstream consumers (PostHog and DB Rollup Tables) via Inngest.

## Standard Event Schema (Prisma `AnalyticsEvent`)

Every event must adhere to the following schema:
```json
{
  "eventId": "uuid-v4",
  "eventName": "commerce.checkout.completed",
  "occurredAt": "2026-07-21T16:00:00.000Z",
  "userId": "usr_123",
  "sessionId": "sess_456",
  "tenantId": "tnt_789",
  "vendorId": "vnd_012",
  "device": "desktop",
  "country": "US",
  "currency": "USD",
  "source": "utm_source=twitter",
  "metadata": {
    "totalAmount": 1250.50,
    "itemsCount": 3
  }
}
```

## Supported Namespaces

### Commerce Funnel
- `commerce.product.viewed`
- `commerce.cart.added`
- `commerce.cart.removed`
- `commerce.checkout.started`
- `commerce.checkout.completed`

### Auctions
- `auction.bid.placed`
- `auction.bid.outbid`
- `auction.won`

### Vendors
- `vendor.product.created`
- `vendor.product.updated`

### Authentication & AI
- `auth.signup`
- `auth.login`
- `ai.prompt.executed`
- `ai.workflow.completed`
