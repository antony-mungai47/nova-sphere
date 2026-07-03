# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-02
### Added
- **Commerce Core**: Global state management (Zustand), Cart synchronization, and foundational checkout logic.
- **Finance Engine**: Stripe API integration, secure webhooks, multi-currency display, and PDF invoicing.
- **Platform Engine**: Inngest-powered Saga orchestrator, Cron jobs, Chaos Engine, and automated health probes.
- **Engagement Engine**: Wishlists, product reviews, five-star rating aggregations, and live toast notifications.
- **Intelligence Engine**: AI-powered "Frequently Bought Together" recommendations and dynamic search algorithms (Algolia).
- **Admin Dashboard**: Full CRM, inventory management, order fulfillment capabilities, and executive business KPIs.
- **Auction Marketplace**: Real-time competitive bidding logic, countdown timers, and isolated Auction data schema.
- **Premium UX**: Framer Motion transitions, glassmorphism UI components, and global CSS aesthetic variables.
- **Production Hardening**: Sentry & OpenTelemetry observability, Next.js metadata tagging, and strict Playwright regresson testing.
- **Launch Governance**: Full suite of enterprise certifications (Architecture, Security, Performance, Accessibility, and Disaster Recovery).

### Changed
- Shifted all raw background logic out of API endpoints into Inngest Sagas.
- Refactored frontend styling from ad-hoc classes to a strictly governed Design System in `globals.css`.
- Secured all sensitive admin and vendor routes using Clerk hierarchical role-based middleware.

### Fixed
- Addressed 19 moderate sub-dependency vulnerabilities identified during pre-launch audit.
- Resolved Prisma connection pool exhaustion risks by configuring external PgBouncer connection strings.

### Security
- Passed ARB and Security Audits (Zero Critical Vulnerabilities).
- Implemented robust `CookieConsentBanner` blocking PostHog telemetry prior to user opt-in.
