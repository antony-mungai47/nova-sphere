# Cache invalidation and revalidation strategy\n\n**Date:** July 2026
**Status:** Accepted
**Context:** E-commerce requires fast page loads (heavily cached) but accurate inventory and pricing (highly dynamic).
**Decision:** We adopted Next.js Incremental Static Regeneration (ISR) and Tag-Based Invalidation.
**Consequences:**
- Product pages are statically generated and cached at the Edge.
- We use `revalidateTag('product-[id]')` when a product is updated in the admin panel or inventory drops to 0.
- Prices and inventory for the cart/checkout are ALWAYS fetched dynamically (cache: 'no-store') to prevent overselling.\n