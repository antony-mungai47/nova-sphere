"use server";

import { cookies } from "next/headers";
import { resolveThemeId, THEMES } from "@/lib/themes";

export async function setThemeCookie(themeId: string) {
  const resolvedId = resolveThemeId(themeId);
  const cookieStore = await cookies();
  
  // Set the theme cookie to expire in 1 year
  cookieStore.set("nova-theme", resolvedId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return { success: true, themeId: resolvedId, themeMode: THEMES[resolvedId].mode };
}
