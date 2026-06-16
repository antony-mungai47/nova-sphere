"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";

export async function updateSettings(id: string, formData: FormData) {
  const authorized = await isAdmin();
  if (!authorized) {
    throw new Error("Unauthorized");
  }

  const data = {
    storeName: formData.get("storeName") as string,
    storeDescription: formData.get("storeDescription") as string,
    supportEmail: formData.get("supportEmail") as string,
    businessPhone: formData.get("businessPhone") as string,
    currency: formData.get("currency") as string,
    taxRate: parseFloat((formData.get("taxRate") as string) || "0"),
    shippingRate: parseFloat((formData.get("shippingRate") as string) || "0"),
    
    // Branding & Theme
    storeLogo: (formData.get("storeLogo") as string) || null,
    favicon: (formData.get("favicon") as string) || null,
    theme: (formData.get("theme") as string) || "dark",
    primaryColor: (formData.get("primaryColor") as string) || "#3B82F6",
    secondaryColor: (formData.get("secondaryColor") as string) || "#10B981",
    accentColor: (formData.get("accentColor") as string) || "#D4A017",
    watermarkEnabled: formData.get("watermarkEnabled") === "true",
    watermarkOpacity: parseFloat((formData.get("watermarkOpacity") as string) || "0.06"),
    
    // SEO
    seoTitle: (formData.get("seoTitle") as string) || null,
    seoDescription: (formData.get("seoDescription") as string) || null,
    
    // Social
    facebookUrl: (formData.get("facebookUrl") as string) || null,
    twitterUrl: (formData.get("twitterUrl") as string) || null,
    instagramUrl: (formData.get("instagramUrl") as string) || null,
    linkedinUrl: (formData.get("linkedinUrl") as string) || null,
    tiktokUrl: (formData.get("tiktokUrl") as string) || null,
  };

  await prisma.storeSettings.update({
    where: { id },
    data,
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
}
