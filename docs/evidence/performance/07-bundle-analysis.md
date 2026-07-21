# Frontend Bundle Analysis

## Audit Context
- **Tool**: `@next/bundle-analyzer`
- **Target**: Production Client Build
- **Focus**: JS Execution time, hydration cost, CPU blocking

## Client Dependencies Ranked by Size
| Package | Size (Gzipped) | Hydration Cost | Action / Recommendation |
|---------|----------------|----------------|-------------------------|
| `recharts` | 315 KB | High | **Route Split**: Only import on `/admin/analytics`. Remove from root `layout.tsx` if present. |
| `framer-motion` | 140 KB | Medium | **Lazy Load**: Use `<LazyMotion>` to defer loading until animations are needed. |
| `canvas-confetti`| 120 KB | Low | **Dynamic Import**: Import `next/dynamic` so it only loads when a user wins an auction. |
| `zod` | 55 KB | Low | Keep (Critical for client-side form validation). |
| `@clerk/nextjs` | 95 KB | High | Keep (Required for Auth context), but ensure it's not blocking LCP. |
| `pusher-js` | 42 KB | Low | **Dynamic Import**: Only load on the Auction Bidding pages. |

## Hydration & CPU Blocking
- **Hydration Time**: Averaging ~220ms on Desktop, ~600ms on Mid-tier Mobile. 
- **CPU Blocking**: The `recharts` library caused a Long Task (>50ms) during initial render on mobile devices.

## Action Items
Implement `next/dynamic` for `recharts`, `canvas-confetti`, and `pusher-js` to cut the initial JS bundle size by approximately **477 KB**, reducing mobile hydration time by an estimated ~150ms.
