# Nova Sphere Agents Configuration

## General Rules

- **The Golden Rule:** No feature should be implemented unless it is architected, tested, documented, deployed to staging, verified, and regression-tested before moving to the next milestone. This prevents one change from breaking another.
- **Role & Mindset:** Antigravity must act as a Senior Engineering Team with defined quality gates, not a raw code generator. Never mix architecture changes, UI redesigns, database migrations, and new features into a single chaotic implementation.

## The Release Management Lifecycle

Every single new feature or architectural change MUST strictly follow this quality gate lifecycle:
1. **Idea / Request**
2. **Architecture Review**
3. **Database Design**
4. **API Design**
5. **Implementation**
6. **Automated Testing**
7. **Manual Testing**
8. **UI/UX Review**
9. **Performance Review**
10. **Security Review**
11. **Regression Testing**
12. **Deployment to Staging**
13. **Production Approval**
14. **Vercel Deployment**

## Immutable Architecture Principles (V2)

1. **Foundation Freeze:** The Domain-Driven architecture is the single source of truth. No feature may bypass domain boundaries.
2. **Domain Independence:** Every domain MUST follow the internal structure: `components/`, `actions/`, `services/`, `repositories/`, `validators/`, `schemas/`, `types/`, `events/`, `tests/`.
3. **Event-Driven Architecture:** Workflows spanning domains must use events (e.g. `OrderPlaced`, `InventoryChanged`). Side effects must subscribe to these events.
4. **Repository Pattern:** UI → Action → Service → Repository → Database. UI must never access Prisma directly.
5. **Enterprise Search Domain:** Search is a first-class domain (Autocomplete, Suggestions, Filters, Synonyms, AI Search).
6. **Recommendation Engine:** Recommendations are a first-class domain (Trending, Seasonal, Personalization).
7. **Notification Center:** All notifications (Email, In-App, SMS, Push, Alerts) are centralized. No feature sends notifications directly.
8. **Shared Infrastructure:** The shared layer includes `hooks/`, `constants/`, `validators/`, `config/`, `schemas/`, `helpers/`, `icons/`, `assets/`, `errors/`, `utilities/`.
9. **Enterprise Observability:** Operations must monitor Performance, Errors, Audit Logs, Security, Background Jobs, and Caches.
10. **Feature Flag Policy:** Every major feature remains flagged until Development, Tests, A11y, Performance, Security, and Prod Approval are all passed.
11. **Design System:** UI must use centralized tokens (Typography, spacing, colors, motion). No independent page styling.
12. **Future Scalability:** Architecture must anticipate multi-vendor, subscriptions, AI assistants, live auctions, i18n, multi-currency, and mobile APIs.
