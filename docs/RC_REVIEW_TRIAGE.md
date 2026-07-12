# Release Candidate (RC1) Triage Log

Before certifying v2.0.0, the following open engineering tasks were evaluated and triaged. This log represents the authoritative release decision for these items.

| Item | Decision | Target Version | Reason |
| :--- | :--- | :--- | :--- |
| **Release Gate** | Required | 2.0.0 | Release blocker |
| **Evidence Binder** | Required | 2.0.0 | Release blocker |
| **Final Release Certificate** | Required | 2.0.0 | Release blocker |
| **Outbox DLQ Verification** | Required | 2.0.0 | Core reliability guarantee |
| **Query Optimization (N+1)** | Deferred | 2.0.1 | Optimization |
| **Lighthouse CI Automation** | Deferred | 2.0.1 | Automation improvement |
| **Accessibility Audit** | Deferred | 2.1.0 | Dedicated UX effort |

*Note: Accessibility for v2.0.0 enforces semantic HTML and baseline keyboard usability. Full WCAG auditing and strict jsx-a11y rules are slated for v2.1.0.*
