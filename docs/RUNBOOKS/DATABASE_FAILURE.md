# Runbook: Database Failure

## Symptoms
- `HealthEngine` reports Database as `false`.
- Vercel `/api/health/ready` returns 503.
- APM logs show Prisma `P1001` (Can't reach database server) or `P2024` (Connection pool timeout).

## Severity: CRITICAL (SEV-1)
This implies complete platform outage. No orders can be processed.

## Immediate Mitigation Steps
1. **Verify Outage**: Check Neon / Postgres provider dashboard.
2. **Alert**: Inform the NOC channel (`#incident-p1`) immediately.
3. **If Provider Outage**:
   - We must wait for provider resolution if PITR (Point-In-Time-Recovery) is unavailable.
   - Set Cloudflare / Vercel Edge Cache to serve stale homepage content if possible.
4. **If Data Corruption / Accidental Drop**:
   - Download the latest backup from S3: `aws s3 cp s3://novasphere-dr-backups/latest.sql .`
   - Run verification locally: `./scripts/dr/verify.sh latest.sql`
   - If verified, run restore against the production URL: `./scripts/dr/restore.sh latest.sql`

## Post-Mortem Requirements
- Document exact minutes of downtime.
- Run `ReconciliationEngine` manually to find any Stripe payments that succeeded while the DB was rolling back.
- Issue refunds for orphaned payments.
