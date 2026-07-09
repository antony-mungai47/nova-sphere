# ADR-004: Why PaymentEngine uses Provider Abstraction

**Date:** July 2026
**Status:** Accepted
**Context:** Payment logic was tightly coupled to Stripe APIs directly inside checkout components, API routes, and database models. This made testing difficult without mocking external network calls, and prevented Nova Sphere from adopting multi-provider payment support (e.g., PayPal, Crypto).
**Decision:** We introduced the `IPaymentProvider` interface and abstracted Stripe behind the `PaymentEngine`.
**Consequences:**
- The domain layer now depends on an abstract `createPaymentIntent()` contract, not Stripe-specific webhooks or tokens.
- We can easily mock the `IPaymentProvider` for unit tests, ensuring robust test suites without relying on Stripe's test environment.
- Any future payment gateway integration (e.g., Braintree, Square) only requires implementing the `IPaymentProvider` interface.
