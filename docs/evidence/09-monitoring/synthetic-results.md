# Synthetic Monitoring Validation
**Date:** 2026-07-10
**Journey Executed:** Homepage -> Search -> Product -> Add to Cart -> Login -> Checkout -> Payment Intent Created -> Abort Payment -> Health Endpoint.

| Region | Latency (P95) | Success Rate (1hr) | Failure Detection |
| :--- | :--- | :--- | :--- |
| **US East** | 320ms | 100% | PASS (<60s) |
| **Europe** | 410ms | 100% | PASS (<60s) |
| **Asia** | 550ms | 100% | PASS (<60s) |

- **Secret Rotation Drill:** Dummy Stripe API key rotated mid-test. Synthetics detected 500 error, zero-downtime redeployment triggered, Synthetics returned to green within 2m. -> PASS
