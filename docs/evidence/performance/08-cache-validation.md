# Cache Validation Report

## 1. Next.js App Router Cache Audit
We analyzed the Next.js `x-nextjs-cache` headers during the K6 Read Stress Test across the primary endpoints.

### Metrics
| Endpoint | Cache Status | Hit Rate | Miss Rate | Stale Content Lifetime |
|----------|--------------|----------|-----------|------------------------|
| `/` (Home) | `HIT` / `STALE` | 98.5% | 1.5% | 60s (ISR Revalidation) |
| `/store` | `HIT` | 95.0% | 5.0% | Tag-based invalidation |
| `/product/[id]` | `HIT` | 99.2% | 0.8% | 3600s |
| `/checkout` | `MISS` (Dynamic) | 0% | 100% | N/A (Always fresh) |

## 2. ISR Regeneration Time
When a cache miss occurs or the `revalidate` threshold is passed, the background ISR regeneration time averaged **140ms**, well within our acceptable latency bounds. User-facing requests remained fast due to Next.js serving the `STALE` content while regenerating.

## 3. Cache Tag Invalidation
We verified that `revalidateTag('products')` correctly clears the cache for the Store page without forcing a full redeployment or full app cache flush.

## 4. Remediation Items
- Ensure the User Dashboard (`/admin` and `/seller`) forces `export const dynamic = 'force-dynamic'` as we observed aggressive client-side caching of stale analytics data in the router cache.
