# Release Manifest (v2.0.0)

This manifest serves as a concise reference for the Nova Sphere V2 release.

| Property | Value |
| :--- | :--- |
| **Version** | v2.0.0 |
| **Git SHA** | *Generated upon tag* |
| **Build Number** | CI-1249 |
| **Release Date** | 2026-07-12 |
| **Database Schema** | Prisma schema `v2.0` |
| **Migration Version** | `20260710_init_v2` |
| **Evidence Binder** | `/docs/evidence/` |

## Required Third-Party Services
- **Authentication:** Clerk
- **Payments:** Stripe
- **Database:** Neon (Serverless Postgres)
- **Background Jobs:** Inngest
- **Search:** Algolia (Provisional)
- **Observability:** Datadog

## Required Environment Variables
\`\`\`env
DATABASE_URL="postgres://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
CLERK_SECRET_KEY="..."
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."
INNGEST_EVENT_KEY="..."
INNGEST_SIGNING_KEY="..."
\`\`\`
