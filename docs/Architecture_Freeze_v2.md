# Architecture Freeze (v2.0.0)

As of Nova Sphere v2.0.0, the core architecture is formally **frozen**. 
This freeze applies strictly to the Domain-Driven Design (DDD) boundaries established in the `CommerceCore`, `Platform`, `Marketplace`, and `Auction` contexts.

## Prohibited Architectural Changes
1. **Cross-Domain Synchronous Calls:** Domains may NOT communicate synchronously. All inter-domain communication MUST occur via the Transactional Outbox and Event Bus.
2. **Database Boundary Violations:** A domain may NOT query another domain's tables directly.
3. **Framework Swaps:** The core stack (Next.js App Router, Prisma, Inngest, Neon, Stripe) is locked. No new major infrastructure dependencies may be introduced without a formal ADR.

## Permitted Changes (v2.0.x and v2.1.x)
- Internal refactoring within a bounded context.
- Optimizing database indexes and queries.
- Adding new asynchronous event handlers (Sagas) conforming to the Outbox pattern.
- Cosmetic UI and accessibility improvements.
