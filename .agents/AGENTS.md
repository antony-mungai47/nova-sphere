# Nova Sphere Engineering Policies

## Continuous Controlled Delivery

Every sprint and feature expansion must strictly adhere to the Continuous Controlled Delivery policy.

### 1. Architecture Gate
Before any Sprint begins, an Architecture Review must be presented and approved via an `implementation_plan.md` artifact. The sequence is:
Architecture Review -> Implementation -> Automated Testing -> Manual QA -> Performance Audit -> Security Check -> Visual Review -> Documentation -> RC Tag -> Next Sprint.

### 2. Independent Deployability
Every Sprint/Milestone must result in a production-ready, independently deployable codebase. 
Sprint (N+1) cannot begin until Sprint (N) is fully deployable and tagged.

### 3. Sprint Deliverables
At the end of every sprint, the following deliverables MUST be provided via a `qa_report.md` artifact:
- Functional Demo (Visual Evidence)
- QA Report
- Performance Report
- Architecture Compliance Report
- Database Migration Report (if applicable)
- API Change Log
- Feature Flag Status
- Rollback Plan
- Known Issues
- Technical Debt Introduced (must be none)
- Documentation Updates

### 4. No Regression Rule
No sprint can sacrifice quality for speed. Before moving to the next sprint, verify:
- Existing features still work.
- Performance, Lighthouse scores, Accessibility, and Mobile UX have not degraded.

### 5. Feature Flags
Every major feature must be hidden behind a Feature Flag (e.g., `LIVE_AUCTIONS`, `LIVE_INVENTORY`, `LIVE_SUPPORT`) to allow safe merging of code without exposing unfinished functionality.

### 6. Performance Budgets
Each sprint must define and meet measurable targets:
- Page load < 2 seconds
- Realtime latency < 150 ms
- Bundle increase < 50 KB (unless justified)
- Lighthouse Performance > 90
- Accessibility > 95
- CLS < 0.1

### 7. Release Hardening Phase
The final Sprint of any Release Candidate (e.g., Sprint 6 for RC2) is reserved entirely for Engineering Stabilization (Stress testing, memory profiling, load testing, security review). No new UI can be added during this phase.

### 8. Proper Release Tagging
Releases must be tagged using strict semantic versioning (e.g., `v2.0.0-rc2.1`) to maintain a clean, traceable history.

### 9. 15-Point Acceptance Checklist
A sprint is only complete if it satisfies the strict 15-point acceptance checklist (Build, TS, Lint, Tests, E2E, Console/Network errors, Mobile, A11y, Performance, Security, Docs, Feature Flags).

### 10. Observability First
Every new capability must include monitoring (Error logging, Latency metrics, Provider health, etc.) from day one. If it cannot be observed, it cannot be shipped.

## Engineering Rule #2: Architecture Freeze Policy

The V2 architecture is now frozen as of Sprint 10.
- Any architectural change must be documented through an Architecture Decision Record (ADR) and explicitly approved by the user before implementation.
- Feature work may not introduce parallel implementations, duplicate services, or alternate architectural patterns.
- No more new folders, new engines, new services, new repositories, or new patterns.
- Only bug fixes, performance improvements, security updates, documentation, tests, and deployment automation are permitted.
