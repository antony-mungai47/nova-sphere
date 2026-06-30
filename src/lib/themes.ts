/**
 * Nova Sphere — Theme Definitions
 * 
 * Three themes, perfectly polished. Quality over quantity.
 * Theme selection is DB-driven via StoreSettings.theme.
 * Applied via [data-theme] attribute on <html>.
 */

export type ThemeConfig = {
  id: string;
  name: string;
  description: string;
  mode: "dark" | "light";
  previewColors: {
    background: string;
    accent: string;
    surface: string;
  };
};

export const THEMES: Record<string, ThemeConfig> = {
  "nova-premium": {
    id: "nova-premium",
    name: "Nova Premium",
    description: "Sleek, modern dark charcoal with indigo accent. The default Nova Sphere experience.",
    mode: "dark",
    previewColors: {
      background: "#09090B",
      accent: "#6366F1",
      surface: "#18181B",
    },
  },
  "executive-light": {
    id: "executive-light",
    name: "Executive Light",
    description: "Clean, professional, bright. Blue accent. Perfect for business environments.",
    mode: "light",
    previewColors: {
      background: "#FAFAFA",
      accent: "#2563EB",
      surface: "#F4F4F5",
    },
  },
  "executive-dark": {
    id: "executive-dark",
    name: "Executive Dark",
    description: "Corporate navy with blue accent. Refined and polished.",
    mode: "dark",
    previewColors: {
      background: "#0F172A",
      accent: "#3B82F6",
      surface: "#1E293B",
    },
  },
};

/**
 * Returns the theme ID to use, falling back to "nova-premium" if invalid.
 */
export function resolveThemeId(themeId: string | null | undefined): string {
  if (themeId && themeId in THEMES) return themeId;
  return "nova-premium";
}

/**
 * Returns the Clerk theme appearance based on the active theme mode.
 */
export function getClerkAppearance(themeId: string) {
  const theme = THEMES[resolveThemeId(themeId)];
  return theme?.mode === "dark" ? "dark" : undefined;
}
