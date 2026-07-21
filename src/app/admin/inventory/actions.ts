"use server";
import { ProductRepository } from "@/domains/Commerce/products/repositories/product.repository";

import { revalidatePath } from "next/cache";
import { IdentityService } from "@/modules/identity/services/IdentityService";

export async function updateProductStock(productId: string, newStock: number) {
  const authorized = await IdentityService.isAdmin();
  if (!authorized) throw new Error("Unauthorized");

  if (newStock < 0) {
    throw new Error("Stock cannot be negative.");
  }

  await ProductRepository.update({
    where: { id: productId },
    data: { stock: newStock }
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  return { success: true };
}
