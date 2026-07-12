# Engineering Evidence Binder

This directory contains the immutable, objective artifacts proving Nova Sphere's production readiness. 
Narrative claims are rejected; only CI-generated or script-generated outputs reside here.

| Directory | What it Proves |
| :--- | :--- |
| **01-release-gate** | Verifies all pre-flight checks (lint, build, types) passed cleanly. |
| **02-coverage** | Contains LCOV metrics proving domain logic is tested without relying on browser E2E. |
| **03-security** | Contains NPM audit and Knip dead-code reports ensuring no active vulnerabilities or attack surface bloat. |
| **04-performance** | Lighthouse CI reports verifying Core Web Vitals (Accessibility, Best Practices, SEO). |
| **05-load-testing** | Capacity tests proving the infrastructure handles the projected CCU limits without saturation. |
| **06-chaos** | Chaos Engineering results proving the system recovers gracefully from simulated vendor and infrastructure outages. |
| **07-disaster-recovery** | Verification of an actual backup restore, migrating data to an isolated staging environment and validating checksums. |
| **08-rollbacks** | Deployment validation reports and intentional rollback timing proving recovery SLAs. |
| **09-monitoring** | Logs from the continuous synthetic bots validating the entire critical purchasing path across multiple regions. |
| **10-operational-validation** | The final signed Production Readiness Certificate. |
