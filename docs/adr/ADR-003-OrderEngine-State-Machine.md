# ADR-003: Why OrderEngine uses a State Machine

**Date:** July 2026
**Status:** Accepted
**Context:** In earlier V1 iterations, order statuses were simple string flags (`status: 'PAID'`) updated arbitrarily throughout the codebase. This led to impossible state transitions (e.g., an order moving from `CANCELLED` back to `SHIPPED`), orphaned states, and unhandled side-effects (e.g., not releasing inventory when cancelled).
**Decision:** We implemented a strict State Machine pattern inside the `OrderEngine`. Orders must move linearly through defined states (`PENDING` -> `PAID` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED` or `CANCELLED`).
**Consequences:**
- All state transitions are strongly typed and centralized within the `OrderEngine.transitionOrder(id, newState)` method.
- Invalid transitions throw `InvalidStateTransitionError` exceptions.
- Side effects (like releasing inventory upon cancellation) are guaranteed to execute because they are hooked directly into the transition logic.
