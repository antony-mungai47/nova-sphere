# Source of Truth Audit

| Domain | Current Fragmented Owners | Final Proposed Owner |
|--------|---------------------------|----------------------|
| **Inventory** | Cart, Orders, Auctions, ProductService, CommerceCore/InventoryEngine, Commerce/inventory/InventoryEngine | `InventoryService` (Application Layer) |
| **Products** | CommerceCore, Merchandising, Storefront UI, Admin UI | `ProductService` (Application Layer) |
| **Images** | UI Fallbacks, `src/lib/cloudinary`, Product Entity | `ImageService` (Application Layer) |
| **Payments** | Finance/PaymentEngine, CommerceCore/PaymentEngine | `PaymentService` (Application Layer) |
| **Users/Auth** | Middleware, Clerk Webhooks, Admin Guards | `UserService` (Application Layer) |
| **Analytics** | lib/analytics.ts, inngest/functions, PostHogProvider | `AnalyticsService` (Infrastructure Layer) |

> **Conclusion:** Almost every domain has 2 or more conflicting engines operating on the same underlying data models.
