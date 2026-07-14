# Automated Disaster Recovery (DR) Hooks

## Recovery Procedures

### 1. PostgreSQL Restoration
Execute `scripts/dr/restore-postgres.sh`. This script:
- Fetches the latest WAL (Write-Ahead Log) from S3.
- Provisions a standby replica and executes point-in-time recovery.
- Runs data-integrity checks against the Event Bus ledger.

### 2. Redis Cache Rebuild
Execute `scripts/dr/rebuild-redis.ts`. This script:
- Assumes the cache is completely lost.
- Fetches active configuration from `GlobalConfig`.
- Warm-boots top 50,000 product pages and homepage permutations directly from PostgreSQL.

### 3. Vector Embedding Regeneration
Execute `scripts/dr/regenerate-vectors.ts`. This script:
- Pulls all active catalog items.
- Batches them to the `AIGateway` using the `EmbeddingProvider`.
- Upserts directly into the Vector DB.
- *SLA Target:* < 30 minutes for 1M SKUs.

## Performance SLAs (Load Testing Targets)
When executing K6 load scripts against Staging, the following SLAs must be met:
- **Search (10k concurrent):** P95 < 300ms
- **Checkout (5k concurrent):** P95 < 500ms
- **AI Semantic Search:** P95 < 2s
- **AI Recommendations:** P95 < 800ms
