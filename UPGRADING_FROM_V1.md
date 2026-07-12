# Upgrading from V1 to V2

Nova Sphere V2 is a complete rewrite adopting Domain-Driven Design (DDD). This guide outlines the breaking changes and migration steps.

## 1. Database Migrations
V1 tables have been replaced with strongly bounded schema models.
- The `users` table is now completely managed by Clerk.
- Legacy `Order` records are migrated via the `archive/prisma/legacy-migrations/` scripts to the new V2 schema.
- **Action:** Before booting V2, run `npx prisma db push --accept-data-loss` in staging, or follow the safe dual-write migration path for production.

## 2. API Changes
- All monolithic `/api/v1/*` routes are deprecated.
- V2 utilizes Server Actions (`src/app/actions/`) for internal mutations and structured TRPC/Next.js Route Handlers for external API consumers.

## 3. Environment Variables
- Removed: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
- Added: `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `INNGEST_SIGNING_KEY`, `INNGEST_EVENT_KEY`.

## 4. Authentication
- NextAuth has been completely removed in favor of Clerk. All users must perform a password reset or re-authenticate via OAuth upon their first login to V2.
