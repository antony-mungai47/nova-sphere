# ADR-006: Why V1 was Retired in favor of V2 Next.js App Router

**Date:** July 2026
**Status:** Accepted
**Context:** The original V1 codebase relied on an older version of Next.js using the Pages Router, tangled client-side data fetching, and weak typing. This caused high Cumulative Layout Shift (CLS), bloated JavaScript bundles, poor SEO, and difficulty maintaining security across routes.
**Decision:** We entirely retired the V1 architecture and adopted the Next.js V2 App Router.
**Consequences:**
- React Server Components (RSC) became the default, drastically reducing the client-side JavaScript payload.
- Layouts are nested and data fetching occurs securely on the server.
- The repository was restructured around Domain-Driven Design (DDD) to isolate CommerceCore, Identity, and Operations logic.
- We are now bound to "Engineering Rule #2", explicitly freezing the V2 architecture and preventing any parallel "V3" rewrites.
