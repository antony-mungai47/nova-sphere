const fs = require('fs');
const path = require('path');

const adrDir = path.join(__dirname, '..', 'docs', 'adr');
if (!fs.existsSync(adrDir)) {
    fs.mkdirSync(adrDir, { recursive: true });
}

const adrs = [
    {
        name: 'ADR-007-Nextjs-App-Router.md',
        title: 'Why we chose the Next.js App Router architecture',
        content: `**Date:** July 2026
**Status:** Accepted
**Context:** We needed a framework capable of handling complex server-side rendering, SEO requirements, and edge caching for a global marketplace. V2 used a mix of React SPA and separate backend services.
**Decision:** We adopted the Next.js App Router.
**Consequences:**
- Allowed us to heavily leverage React Server Components (RSC) to reduce client-side bundle size.
- Improved LCP and TTFB by streaming UI from the server.
- Forced a paradigm shift in how we handle data fetching (moving away from \`useEffect\` toward server-side fetching).`
    },
    {
        name: 'ADR-008-Stripe-Outbox.md',
        title: 'Why Stripe uses the Outbox pattern',
        content: `**Date:** July 2026
**Status:** Accepted
**Context:** When a Stripe webhook is received (e.g. \`payment_intent.succeeded\`), we need to update the Order status, update the Ledger, and trigger downstream fulfillment logic. Doing this synchronously risks timeouts and partial failures if downstream services are slow.
**Decision:** We implemented the Transactional Outbox pattern specifically for Stripe events.
**Consequences:**
- The webhook handler only performs an atomic database transaction (updating Order, Attempt, Ledger, and inserting an \`OutboxEvent\`).
- If the database transaction succeeds, Stripe receives a 200 OK immediately.
- A background processor (Inngest) reliably picks up the \`OutboxEvent\` to trigger fulfillment, ensuring Eventual Consistency without holding the webhook connection open.`
    },
    {
        name: 'ADR-009-Cart-Merge-Capping.md',
        title: 'Why cart merges use deterministic quantity capping',
        content: `**Date:** July 2026
**Status:** Accepted
**Context:** When a user logs in, their anonymous guest cart must be merged with their persisted user cart. However, adding quantities naively (e.g., 2 items + 2 items = 4 items) might exceed available inventory or warehouse limits.
**Decision:** We adopted deterministic quantity capping during cart merges.
**Consequences:**
- We execute a strict \`min(combined_quantity, available_inventory, max_per_customer)\` logic.
- Ensures the merged cart never contains an unfulfillable state, avoiding runtime checkout failures.
- Requires real-time inventory checks during the authentication/merge phase.`
    },
    {
        name: 'ADR-010-Auctions-Inngest.md',
        title: 'Why auctions are event-driven with Inngest',
        content: `**Date:** July 2026
**Status:** Accepted
**Context:** Auctions have strict time boundaries. We need reliable execution when an auction ends to declare a winner, capture payment, and notify users. Cron jobs or setTimeout are brittle and lose state on server restarts.
**Decision:** We use Inngest for event-driven orchestration of auctions.
**Consequences:**
- We can schedule reliable future events (e.g., \`AuctionEnded\`) weeks in advance.
- Built-in retries, dead-letter queues, and step-functions allow us to handle payment failures gracefully without losing the auction state.
- Decouples the frontend from complex state-machine transitions.`
    },
    {
        name: 'ADR-011-Pusher-Realtime.md',
        title: 'Why Pusher is used for real-time updates',
        content: `**Date:** July 2026
**Status:** Accepted
**Context:** Auctions require millisecond-level latency for bid broadcasts to prevent sniping conflicts. Maintaining our own WebSockets infrastructure (Socket.io) introduced significant operational overhead and scaling challenges.
**Decision:** We adopted Pusher for real-time WebSocket broadcasting.
**Consequences:**
- Offloads connection management and presence channels to a managed service.
- Provides immediate scale for highly contested auctions.
- Required us to implement strict error handling and degradation strategies (falling back to polling if Pusher drops).`
    },
    {
        name: 'ADR-012-Cache-Strategy.md',
        title: 'Cache invalidation and revalidation strategy',
        content: `**Date:** July 2026
**Status:** Accepted
**Context:** E-commerce requires fast page loads (heavily cached) but accurate inventory and pricing (highly dynamic).
**Decision:** We adopted Next.js Incremental Static Regeneration (ISR) and Tag-Based Invalidation.
**Consequences:**
- Product pages are statically generated and cached at the Edge.
- We use \`revalidateTag('product-[id]')\` when a product is updated in the admin panel or inventory drops to 0.
- Prices and inventory for the cart/checkout are ALWAYS fetched dynamically (cache: 'no-store') to prevent overselling.`
    },
    {
        name: 'ADR-013-Database-Transactions.md',
        title: 'Database transaction boundaries',
        content: `**Date:** July 2026
**Status:** Accepted
**Context:** Operations like placing a bid or processing a payment touch multiple entities (Auctions, Bids, Ledgers, Orders, Inventory).
**Decision:** We strictly enforce ACID transaction boundaries using Prisma's \`$transaction\`.
**Consequences:**
- We never rely on application-level rollbacks for core commerce operations.
- Optimistic Concurrency Control (OCC) via version fields is used for high-contention resources (like Auctions) to avoid database lock contention.
- Write-heavy paths must keep transactions as short as possible to prevent pool starvation.`
    },
    {
        name: 'ADR-014-AIGateway-Architecture.md',
        title: 'AI gateway architecture',
        content: `**Date:** July 2026
**Status:** Accepted
**Context:** We use AI for search semantic analysis and recommendation. Hitting OpenAI directly from client requests exposes keys and lacks rate limiting.
**Decision:** We implemented an AI Gateway pattern.
**Consequences:**
- All AI requests pass through our backend \`AIEngine\`.
- Enables prompt caching, semantic cache lookups, and cost control.
- Allows us to swap underlying LLM providers without touching frontend code.`
    },
    {
        name: 'ADR-015-Feature-Flags.md',
        title: 'Feature flag strategy',
        content: `**Date:** July 2026
**Status:** Accepted
**Context:** We need to safely roll out V3 features (like the new Checkout or AI Search) without risky "big bang" deployments.
**Decision:** We adopted a centralized Feature Flag system.
**Consequences:**
- Features are decoupled from deployments. We deploy dark code and enable it via flags.
- Flags can be targeted (e.g., 10% of users, or specific beta-tester user IDs).
- Requires discipline to remove old flags to prevent technical debt.`
    }
];

adrs.forEach(adr => {
    const filePath = path.join(adrDir, adr.name);
    const text = '# ' + adr.title + '\\n\\n' + adr.content + '\\n';
    fs.writeFileSync(filePath, text);
    console.log('Created ' + filePath);
});
