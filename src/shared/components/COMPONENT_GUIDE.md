# Nova Sphere Component Guide

Every reusable UI component in the platform MUST follow these guidelines.
This ensures consistency, accessibility, and maintainability across the entire enterprise system.

## Golden Rules for UI Components

1. **Tokens Only**: Never use magic numbers or hardcoded colors. 
   - ❌ `bg-[#0A2540]`, `p-4`, `rounded-xl`, `duration-300`
   - ✅ `bg-surface`, `p-[var(--space-4)]`, `rounded-[var(--radius-lg)]`, `duration-[var(--duration-base)]` or using Tailwind mapped tokens.
2. **Motion System**: Never define inline animations. Use `import { MOTION } from "@/lib/motion"`.
3. **Icons**: Always import icons from `import { IconName } from "@/shared/components/icons"`.
   - Small inline icons: `w-4 h-4` (16px)
   - Button icons: `w-5 h-5` (20px)
   - Empty state icons: `w-12 h-12` (48px)
4. **Accessibility First**:
   - Every interactive element needs a focus ring (use `focus-ring` class).
   - Touch targets must be at least `44px` high on mobile (or use `min-h-[var(--touch-target-min)]`).
   - Icon-only buttons must have `aria-label`.

---

## Component Specs

### Button (`button.tsx`)
- **Purpose**: Primary interactive element for user actions.
- **Variants**: `primary`, `secondary`, `ghost`, `danger`, `outline`, `icon`.
- **States**: `default`, `hover` (scale up), `active` (scale down), `disabled` (opacity 50%, no pointer events), `loading` (spinner replaces icon).
- **Usage**: Use `primary` for the main action on a page. Use `secondary` for alternative actions.
- **Do**: Keep labels concise (1-2 words).
- **Don't**: Use multiple primary buttons next to each other.

### Input (`input.tsx`)
- **Purpose**: Text entry fields.
- **States**: `default`, `focus` (accent ring), `error` (danger ring + message), `disabled`.
- **Usage**: Always pair with a label.
- **Do**: Provide helper text for complex requirements.
- **Don't**: Rely solely on placeholders as they disappear on typing.

### Card (`card.tsx`)
- **Purpose**: Content container grouping related information.
- **Variants**: `default` (surface), `elevated` (surface-elevated + shadow), `glass` (translucent backdrop blur), `interactive` (hover effects).
- **Usage**: For products, dashboard panels, settings blocks.

### Badge (`badge.tsx`)
- **Purpose**: Small status indicator or count.
- **Variants**: `default`, `success`, `warning`, `danger`, `info`.
- **Styles**: `solid`, `subtle` (low opacity background), `dot` (small colored dot next to text).
- **Do**: Use for Order Status, Inventory Status.

### Modal (`modal.tsx`)
- **Purpose**: Focus-trapped dialog overlay.
- **Usage**: For confirmations, complex sub-tasks.
- **Accessibility**: Must trap focus, return focus on close, close on ESC, close on backdrop click.

### EmptyState (`empty-state.tsx`)
- **Purpose**: Displayed when a list or module has no data.
- **Layout**: Centered icon (48px) + Title + Muted Description + Optional Action Button.
- **Do**: Use a friendly, helpful tone. ("You haven't placed any orders yet.")

### ErrorState (`error-state.tsx`)
- **Purpose**: Displayed when a component fails to load data.
- **Layout**: Centered alert icon + "Something went wrong" + Retry Button.

### LoadingSkeleton (`loading-skeleton.tsx`)
- **Purpose**: Placeholder during data fetch.
- **Animation**: Shimmer effect using `--surface-elevated` and `--color-secondary`.
- **Don't**: Use spinners for full-page loads; use skeletons matching the final layout.

### Toast (`toast.tsx`)
- **Purpose**: Transient notification.
- **Variants**: `success`, `error`, `info`, `warning`.
- **Usage**: Auto-dismiss after 3-5 seconds.
