# Financial & Cost Analysis

**Date**: July 2026
**Status**: APPROVED
**Platform**: Nova Sphere Market v1.0.0-rc1

## Projected Monthly Infrastructure Costs

### 1. Compute & Edge (Vercel)
- **1,000 MAU**: Included in Pro Tier ($20/mo).
- **10,000 MAU**: Edge function spikes; approx $50/mo.
- **100,000 MAU**: Enterprise Tier negotiation required. Estimated $800/mo for bandwidth + Edge invocations.

### 2. Database (Prisma / Neon Postgres)
- **1,000 MAU**: Serverless scale-to-zero; ~$15/mo.
- **100,000 MAU**: Dedicated compute required. Approx $350/mo.

### 3. Financial Gateway (Stripe)
- Standard processing: 2.9% + 30¢ per transaction.
- Nova Sphere charges a 5% vendor commission. 
- **Profit Margin**: Positive on all orders > $15.00.

### 4. Intelligence (OpenAI / Algolia)
- **Search (Algolia)**: 100k requests/mo = $100.
- **AI Recommendations (OpenAI gpt-4o-mini)**: Caching implemented via Redis. Max expected cost at 100k users: $250/mo.

## Conclusion
The unit economics of the marketplace remain strongly profitable at scale. Stripe fees are fully offset by the 5% platform commission. The system is certified financially viable for Launch.
