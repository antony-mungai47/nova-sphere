# Why we chose the Next.js App Router architecture\n\n**Date:** July 2026
**Status:** Accepted
**Context:** We needed a framework capable of handling complex server-side rendering, SEO requirements, and edge caching for a global marketplace. V2 used a mix of React SPA and separate backend services.
**Decision:** We adopted the Next.js App Router.
**Consequences:**
- Allowed us to heavily leverage React Server Components (RSC) to reduce client-side bundle size.
- Improved LCP and TTFB by streaming UI from the server.
- Forced a paradigm shift in how we handle data fetching (moving away from `useEffect` toward server-side fetching).\n