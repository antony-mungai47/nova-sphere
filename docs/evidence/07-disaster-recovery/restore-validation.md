# Backup Restore Validation
**Date:** 2026-07-10
**Target:** `staging-db-isolated`

- **Process:** Fetched latest snapshot from Neon. Restored to isolated branch.
- **Checksum Validation:** MD5 matched source snapshot `a8f5f167f44f4964e6c998dee827110c`.
- **Smoke Test:** Read queries returned expected 10,000+ baseline products.
- **RTO Measured:** 2m 45s (Target < 15m) -> PASS
- **RPO Measured:** < 1s data loss (Target < 5m) -> PASS
