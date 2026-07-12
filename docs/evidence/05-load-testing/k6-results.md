# Capacity & Load Testing (K6)
**Date:** 2026-07-10

## Scenario: Black Friday Peak Load (10,000 CCU)
Simulating 10,000 concurrent users performing product searches and checkout flows over 15 minutes.

## Results
- **HTTP Requests:** 1,245,000
- **Error Rate:** 0.01% (Target < 1%) -> PASS
- **P95 Latency:** 145ms (Target < 250ms) -> PASS
- **Max DB Connections:** 850 (Pool size 1000) -> PASS

**Status:** PASS (Infrastructure scaled to handle the projected Black Friday load without saturating).
