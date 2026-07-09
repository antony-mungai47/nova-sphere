# ADR-001: Why Inventory is the Source of Truth

**Date:** July 2026
**Status:** Accepted
**Context:** During the Sprint 2 (Inventory Stabilization) phase of the Nova Sphere V2 recovery, we observed multiple tables holding stock information. Both the main `Product` table and an `Inventory` table tracked stock counts independently, causing race conditions, split-brain scenarios, and overselling during high-concurrency checkouts.
**Decision:** We established the `Inventory` model as the singular, absolute source of truth for stock levels and reservations. The `Product.stock` field was redefined as a read-only cache optimized for product listing queries.
**Consequences:** 
- Checkout flows now decrement from `Inventory` and use database-level atomic transactions to ensure no overselling.
- Any background sync updates `Product.stock` asynchronously to reflect the `Inventory` count.
- The `InventoryEngine` handles all stock reservations, and `ProductEngine` defers to it for exact available quantities.
