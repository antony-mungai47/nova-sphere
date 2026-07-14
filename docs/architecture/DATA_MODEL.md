# Nova Sphere Data Architecture

This document outlines the frozen data model for Nova Sphere V3.x. The platform transitions from in-memory prototypes to a fully persisted, relational architecture using PostgreSQL.

## Domain 1: Core Commerce
These entities handle the fundamental e-commerce transactions, user identity, catalog, and order management.
- **User / Address**: Core identity and shipping details.
- **Product / ProductImage / Category**: The unified catalog representation.
- **Order / OrderItem**: The transactional ledger of purchases.
- **Review / WishlistItem / Coupon**: Engagement and promotional primitives.
- **ShoppingMemory / PersonalizationProfile**: The persisted context of user behavior, replacing the in-memory Maps.
- **SignalsLedger**: Telemetry events captured across the UI for downstream ML processes.
- **Vendor / CommissionPolicy**: Multi-vendor marketplace management.
- **Auction / Bid / AuctionWatchlist**: Support for the real-time auction marketplace.

## Domain 2: AI & Intelligence
These entities govern the interactions with Large Language Models and AI-driven features.
- **AIBudget**: Tracks token usage and spending per user/tenant to enforce financial constraints.
- **PromptLog**: Immutable record of all requests sent to the AI Gateway, including latency and cost.
- **AIEvaluation**: Automated grading of AI responses to detect degradation or hallucination.
- **KnowledgeQuestion / KnowledgeAnswer**: The community-driven Q&A hub powered by AI curation.

## Domain 3: Operations & Platform
These entities handle async workflows, distributed systems reliability, and platform configuration.
- **WorkflowState**: The central state machine tracking async pipelines (e.g., Fraud Review, Vendor Onboarding).
- **AuditTrail / AuditLog / AdminLog / SystemLog**: Immutable compliance records tracking system and administrative changes.
- **OutboxEvent**: Implements the Transactional Outbox pattern for reliable message publishing.
- **FeatureFlag / FeatureFlagHistory**: Controls incremental feature rollouts and targeting.
- **StoreSettings / BusinessRule / RuleCondition**: Dynamic system configuration.
- **WebhookSubscription / WebhookDeliveryLog**: Extensibility interfaces for external integrations.

## Retention Policies
- **Core Commerce**: Retained indefinitely (7 years minimum for financial records: `Order`, `Invoice`, `LedgerEntry`).
- **Signals & Telemetry**: Aggregated after 30 days, purged after 90 days.
- **PromptLogs**: Sampled after 7 days for cost savings, unless flagged for manual review.
- **OutboxEvents**: Hard deleted immediately upon successful message broker acknowledgment.
- **WorkflowState**: Archived 30 days after terminal state (`COMPLETED` or `FAILED`).

## Guiding Principles
1. **Strict Normalization**: Core tables are normalized. JSONB is used strictly for unstructured metadata or polymorphic attributes.
2. **Referential Integrity**: Managed strictly by foreign keys.
3. **Immutability for Finance/Logs**: `Order`, `Bid`, `LedgerEntry`, and `AuditTrail` are strictly append-only.
4. **Soft Deletes**: Deletions on major entities (User, Product) use `deletedAt` timestamps.
