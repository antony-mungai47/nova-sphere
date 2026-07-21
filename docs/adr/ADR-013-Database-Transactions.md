# Database transaction boundaries\n\n**Date:** July 2026
**Status:** Accepted
**Context:** Operations like placing a bid or processing a payment touch multiple entities (Auctions, Bids, Ledgers, Orders, Inventory).
**Decision:** We strictly enforce ACID transaction boundaries using Prisma's `$transaction`.
**Consequences:**
- We never rely on application-level rollbacks for core commerce operations.
- Optimistic Concurrency Control (OCC) via version fields is used for high-contention resources (like Auctions) to avoid database lock contention.
- Write-heavy paths must keep transactions as short as possible to prevent pool starvation.\n