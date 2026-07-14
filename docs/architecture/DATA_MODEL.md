# Nova Sphere V3 Data Model Architecture

This document serves as the frozen data model architecture for Nova Sphere V3, governing the migration stages across Commerce, AI, and Operations domains.

## Overview
Nova Sphere's architecture is moving from an in-memory mapped prototype to a robust Postgres-backed architecture (Prisma ORM). The data model is split into three core deployment stages to minimize migration risk.

## Stage 1: Commerce Platform
The Commerce schema extends the base capabilities with advanced routing, inventory logic, rules, and finance.

### Key Entities
- **Tenant & TenantUser**: Foundation for multi-vendor marketplace routing.
- **Warehouse, Inventory, InventoryMovement**: Hard persistence for stock tracking, reservations, and multi-location fulfillment.
- **BusinessRule, RuleCondition, RuleAction**: Server-evaluated logic for promotions, taxes, and shipping overrides.
- **OrderTimeline**: Immutable event sourcing for order state changes, explicitly tracking "actor" (System vs Admin vs User).
- **PaymentTransaction & Invoice**: Phase 13 financial architecture tying Stripe metadata safely to Orders.

## Stage 2: AI & Personalization Platform
The AI schema introduces the intelligence capabilities that separate Nova Sphere from traditional storefronts.

### Key Entities
- **ShoppingMemory**: Short-lived semantic context tracking for individual user sessions (powers intelligent search).
- **SignalsLedger**: Event stream for implicit and explicit user behaviors (hover, scroll, click, dwell time).
- **PersonalizationProfile**: Aggregated, long-term embeddings representing user preferences and price-sensitivity.
- **AIBudget**: Token-level accounting and rate limiting per tenant/user for language models.
- **PromptLog & AIEvaluation**: Observability for LLM gateway, capturing prompts, responses, latency, and safety evaluations.
- **KnowledgeQuestion & KnowledgeAnswer**: Core Q&A engine for community and AI-generated insights.

## Stage 3: Operations & Platform Intelligence
The Operations schema underpins the governance, security, and observability requirements of V3.

### Key Entities
- **Incident**: System-level degradation tracking, automating MTTR (Mean Time to Recovery) metrics.
- **AuditTrail / AuditLog**: Immutable ledger for administrative actions (e.g., overriding a discount or banning a user).
- **Deployment**: Linking GitHub commits to active platform versions for traceability.
- **ApiKey, WebhookSubscription, WebhookDeliveryLog**: The foundational API Gateway data structures for headless operations.
- **RiskEvaluation**: Automated ML scoring for fraud detection on checkout and login.

## Data Governance Rules
1. **Never mutate Audit Logs**: `createdAt` is the only timestamp on `AuditLog`—no `updatedAt`.
2. **Soft Deletes**: Always prefer `isActive` or `status` flags over physical DELETEs for orders, inventory, and users.
3. **No direct referential coupling between AI and Commerce models**: AI capabilities must reference core commerce entities purely via `userId` or `productId` foreign keys to ensure the AI subsystem can fail independently of the checkout flow.
