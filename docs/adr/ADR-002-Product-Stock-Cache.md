# ADR-002: Why Product.stock is a Cache

**Date:** July 2026
**Status:** Accepted
**Context:** With `Inventory` established as the source of truth (ADR-001), querying the `Inventory` table for every single product on the homepage or category pages introduced significant N+1 query latency and lock contention on the hot-path.
**Decision:** The `Product.stock` field was retained but demoted from "source of truth" to a "cache field". 
**Consequences:**
- The storefront reads from `Product.stock` to display "In Stock" or "Out of Stock".
- Eventual consistency is accepted for the storefront. The cache is updated after successful checkouts or restocks via the `InventorySyncJob` or background events.
- If a user attempts to add an item to the cart that `Product.stock` says is available but `Inventory` says is not, the `InventoryEngine` blocks the transaction at the add-to-cart or checkout boundary.
