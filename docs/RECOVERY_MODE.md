# Nova Sphere V2: Recovery Mode

This document is the single, authoritative reference for how development must proceed on Nova Sphere Version 2. By keeping these rules in the repository, every future contributor will have a single reference point to prevent scaffold-without-implementation drift.

## Recovery Mode Principles
1. **Preserve Existing Work:** Do not rebuild the foundation, Prisma schema, or existing UI.
2. **Implement Only Missing Logic:** Fill in `TODO`s; do not recreate scaffolding.
3. **Connect Existing Modules:** Wire existing UI and Database repositories to backend services instead of rewriting them.
4. **Write Tests:** Every completed module must be tested.
5. **No New Scaffolding:** Build exclusively on what exists unless formally approved.

## Engineering Rules

> **Engineering Rule #0 (Repository Health):**
> Every commit must leave the repository in a healthier state than it was found. No commit may increase duplicate code, TODO count, build warnings, failing tests, dead code, or scaffolding.

> **Engineering Rule #1 (No Hidden Work):**
> No sprint may be marked complete without objective evidence. Required evidence: Git commit(s), Files modified, Passing test output, Build output, Screenshots/Recording, QA Report, and Demo. If there is no evidence, the sprint is not done.

> **Repository Freeze Rule:**
> No engineer may begin work on Sprint N+1 until Sprint N has:
> ✓ Passed the Definition of Done
> ✓ Been reviewed
> ✓ Been tagged
> ✓ Been merged
> ✓ Produced a Repository Health Dashboard
> ✓ Been formally accepted

## Definition of Done (Applies to Every Sprint)
A sprint is COMPLETE only when all of the following are true:
- [ ] Business logic implemented
- [ ] UI fully integrated
- [ ] Database integration verified
- [ ] API endpoints working
- [ ] Events/Workflows connected (if applicable)
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] TypeScript passes
- [ ] ESLint passes
- [ ] Production build succeeds
- [ ] Manual QA completed
- [ ] Demo recorded
- [ ] Documentation updated
- [ ] No TODO placeholders remain
- [ ] Repository Health Gate still passes
- [ ] Repository Health Dashboard generated

## Milestone Acceptance Gate
Before work can continue to the next sprint, the following gate must be passed:
1. Sprint Complete
2. Architectural Review
3. QA Review
4. Repository Health Dashboard generated
5. Git Tag created (e.g., `v2-recovery-s1`)
6. Next Sprint authorized

## Version Integrity Policy
1. **Never Reintroduce V1 Code.**
2. **Preserve Existing V2 Architecture:** Maintain existing domain boundaries.
3. **Recovery Before Rewrite:** Audit before writing code to extend existing implementations.
4. **No Duplicate Implementations:** Search the repo before creating anything new.
5. **Maintain One Source of Truth:** Exactly one production implementation per capability.
6. **No Scaffold Regression:** Do not replace working code with interfaces or TODOs.
7. **End-to-End Completion:** Backend, DB, Frontend, Tests, QA, Docs.
8. **Preserve Compatibility:** Maintain schema, auth, and UI compatibility.
9. **Change Manifest:** Provide "Files to Modify/Create/Delete" before coding.
10. **Continuous Repository Audit:** Verify no duplicates/dead code after every milestone.

## Execution Order
- **Milestone 0:** Repository Canonicalization
- **Milestone 0.5:** Testing Infrastructure (Jest + Playwright + Coverage)
- **Sprint 1:** Pricing
- **Sprint 2:** Inventory
- **Sprint 3:** Orders
- **Sprint 4:** Payments
- *Repository Audit & Priority 2 definition*
