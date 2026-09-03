"use server";
import { prisma } from "@/lib/prisma";

import { revalidatePath } from "next/cache";
import { IdentityService } from "@/modules/identity/services/IdentityService";
import { AdminProductCommandService } from "@/modules/commerce/application/commands/AdminProductCommandService";

export async function updateProductStock(productId: string, newStock: number) {
  const authorized = await IdentityService.isAdmin();
  if (!authorized) throw new Error("Unauthorized");

  if (newStock < 0) {
    throw new Error("Stock cannot be negative.");
  }

  await AdminProductCommandService.updateProductStock(productId, newStock);

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  return { success: true };
}
