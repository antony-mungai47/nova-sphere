# Feature flag strategy\n\n**Date:** July 2026
**Status:** Accepted
**Context:** We need to safely roll out V3 features (like the new Checkout or AI Search) without risky "big bang" deployments.
**Decision:** We adopted a centralized Feature Flag system.
**Consequences:**
- Features are decoupled from deployments. We deploy dark code and enable it via flags.
- Flags can be targeted (e.g., 10% of users, or specific beta-tester user IDs).
- Requires discipline to remove old flags to prevent technical debt.\n