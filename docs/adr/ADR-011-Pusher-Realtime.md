# Why Pusher is used for real-time updates\n\n**Date:** July 2026
**Status:** Accepted
**Context:** Auctions require millisecond-level latency for bid broadcasts to prevent sniping conflicts. Maintaining our own WebSockets infrastructure (Socket.io) introduced significant operational overhead and scaling challenges.
**Decision:** We adopted Pusher for real-time WebSocket broadcasting.
**Consequences:**
- Offloads connection management and presence channels to a managed service.
- Provides immediate scale for highly contested auctions.
- Required us to implement strict error handling and degradation strategies (falling back to polling if Pusher drops).\n