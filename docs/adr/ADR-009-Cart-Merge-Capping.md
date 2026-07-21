# Why cart merges use deterministic quantity capping\n\n**Date:** July 2026
**Status:** Accepted
**Context:** When a user logs in, their anonymous guest cart must be merged with their persisted user cart. However, adding quantities naively (e.g., 2 items + 2 items = 4 items) might exceed available inventory or warehouse limits.
**Decision:** We adopted deterministic quantity capping during cart merges.
**Consequences:**
- We execute a strict `min(combined_quantity, available_inventory, max_per_customer)` logic.
- Ensures the merged cart never contains an unfulfillable state, avoiding runtime checkout failures.
- Requires real-time inventory checks during the authentication/merge phase.\n