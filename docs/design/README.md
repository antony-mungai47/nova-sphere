# Nova Sphere Design System (Sprint V2.1)

Welcome to the Nova Sphere Design System documentation. This system dictates the 2026-standard visual identity, motion guidelines, and interactive behaviors for the marketplace platform.

## 1. Design Principles
- **Light Theme Only:** We mandate a bright, trustworthy aesthetic (`#FFFFFF` / `#F8FAFC`) to maximize product photography and user trust. Dark Mode is deprecated.
- **Multi-Color Accents:** Sections and categories have specific, token-driven accent colors. We do not rely on a single monochrome brand accent for the entire UI.
- **Motion communicates intent:** We rely on Framer Motion to deliver 60FPS, GPU-accelerated feedback for all interactions.

## 2. Motion Guidelines
Strict timing tokens to ensure consistency.
- **Micro (150ms):** Hover states, button presses, wishlist pops.
- **Card (250ms):** Card lifts, image zooms, drawer slides.
- **Section (400ms):** Staggered reveals, hero parallax, mega menu expansions.
- **Page (600ms):** Hard limit. Full route transitions or massive state changes.
- *Rule:* Always respect `prefers-reduced-motion`. Avoid layout shift (CLS) during animation.

## 3. Spacing & Typography
- **8-Point Grid:** Margins and padding must strictly adhere to `4, 8, 16, 24, 32, 40, 48, 64, 96, 128`. No arbitrary spacing.
- **Typography Scale:** Display headers scale up to 72px. Base body is 14/16px. Inter/Geist Sans is the mandatory font family.

## 4. Components & Accessibility
- All primitive components (Buttons, Cards, Inputs, Modals) must support default, hover, pressed, disabled, and focus states.
- **Accessibility:** Visible focus rings and ARIA labels are mandatory. No exceptions.

## 5. Theming Engine
- The UI must support seamless config-driven "Marketplace Themes" (e.g., Black Friday, Christmas).
- Themes alter css variables (`--cta-primary`, `--background`) via classes (e.g., `.theme-black-friday`), leaving the core React components untouched.

---
*Generated as part of Sprint V2.1A Foundation setup.*
