# Funnel Validation

We have validated the end-to-end telemetry propagation through the Outbox into PostHog for the extended e-commerce funnel.

## Validated Funnel Architecture

1. **Landing Page** (`page_viewed` with UTMs)
2. **Search** (`commerce.search.executed`)
3. **Category** (`commerce.category.viewed`)
4. **Product** (`commerce.product.viewed`)
5. **Cart** (`commerce.cart.added`)
6. **Checkout** (`commerce.checkout.started`)
7. **Payment** (`commerce.payment.initiated`)
8. **Order** (`commerce.checkout.completed`)

## PostHog Funnel Metrics Validation
By utilizing this granular funnel structure, PostHog dashboards can now accurately calculate:
- **Cart Abandonment Rate**: Users at Step 5 who did not reach Step 8.
- **Checkout Abandonment Rate**: Users at Step 6 who did not reach Step 8.
- **Micro-conversions**: Click-through rates from Search to PDP.

## Cohort Analysis Integration
The extended funnel supports filtering by our predefined cohorts:
- New vs Returning Users
- VIP / High Spenders
- Auction Participants vs Buy-It-Now (Dropshipping) Users
- Dormant User Reactivations
