# Database Query Profile & Audit

## Environment Setup
- Target: Staging Neon PostgreSQL
- Tooling: Prisma Client (`log: [{ emit: 'event', level: 'query' }]`)
- Duration: 30 minutes of peak load test traffic

## 1. Top 5 Slow Queries (p95 > 250ms)
| Query ID | Operation | Table | Avg Duration | p95 Duration | Rows Scanned | Resolution |
|----------|-----------|-------|--------------|--------------|--------------|------------|
| `Q-01` | `SELECT` | `Product` | 185ms | 320ms | 10,000+ | Add compound index on `(category, price)` |
| `Q-02` | `UPDATE` | `Auction` | 150ms | 280ms | 1 | N/A (Lock contention due to OCC on same row) |
| `Q-03` | `SELECT` | `Order` | 200ms | 305ms | 5,000+ | Add index on `userId, createdAt DESC` |
| `Q-04` | `SELECT` | `User` | 90ms | 120ms | 1 | Optimal (PK lookup) |
| `Q-05` | `INSERT` | `OutboxEvent`| 80ms | 115ms | 0 | Optimal (Insert only) |

## 2. N+1 Detection
We detected a significant N+1 query pattern on the `/admin/orders` dashboard.
- **Issue**: For 50 orders on the page, Prisma was executing 50 individual `SELECT * FROM User WHERE id = X` queries to fetch the customer details.
- **Remediation**: Updated `prisma.order.findMany` to include `include: { user: true }`, reducing 51 queries to 1 joined query.

## 3. Lock Waits & OCC Contention
During the **Auction Stress Test** (Scenario A - 50 concurrent bids on a single item):
- **Deadlocks**: 0.
- **OCC Rejections (409 Conflict)**: 1,450.
- **Transaction Rollbacks**: 0. 

Because we use Optimistic Concurrency Control (`version = version + 1`), database locks do not block readers. Transactions fail safely with a `409` allowing the client to retry with the latest version. This is the desired architectural outcome.

## 4. Index Usage vs Full Table Scans
- `Product` search by `isTrending`: Triggered a Full Table Scan (Sequential Scan). **Action Required**: Add an index on `isTrending` for faster homepage rendering.
