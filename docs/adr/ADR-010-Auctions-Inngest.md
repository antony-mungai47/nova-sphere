# Why auctions are event-driven with Inngest\n\n**Date:** July 2026
**Status:** Accepted
**Context:** Auctions have strict time boundaries. We need reliable execution when an auction ends to declare a winner, capture payment, and notify users. Cron jobs or setTimeout are brittle and lose state on server restarts.
**Decision:** We use Inngest for event-driven orchestration of auctions.
**Consequences:**
- We can schedule reliable future events (e.g., `AuctionEnded`) weeks in advance.
- Built-in retries, dead-letter queues, and step-functions allow us to handle payment failures gracefully without losing the auction state.
- Decouples the frontend from complex state-machine transitions.\n