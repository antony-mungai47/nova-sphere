"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { IdentityService } from "@/modules/identity/services/IdentityService";

export async function createProduct(formData: FormData) {
  if (!(await IdentityService.isAdmin())) throw new Error("Unauthorized");
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = formData.get("category") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const stock = parseInt(formData.get("stock") as string) || 0;
  const isTrending = formData.get("isTrending") === "on";

  // Validate product integrity
  if (price <= 0) throw new Error("Price must be greater than 0");
  if (name.length < 3) throw new Error("Product title must be at least 3 characters");
  if (description.length < 10) throw new Error("Description must be at least 10 characters");
  if (imageUrl && !imageUrl.startsWith("http") && !imageUrl.startsWith("/")) throw new Error("Invalid image URL");
  if (stock < 0) throw new Error("Stock cannot be negative");

  // Provide defaults for the new Phase 5 schema fields if they are missing from the old form
  const brand = (formData.get("brand") as string) || "Nova";
  const sku = (formData.get("sku") as string) || `SKU-${Date.now()}`;

  await prisma.product.create({
    data: {
      name,
      description,
      price,
      category,
      brand,
      sku,
      stock,
      isTrending,
      ...(imageUrl ? {
        images: {
          create: { url: imageUrl, isPrimary: true }
        }
      } : {})
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/store");
  revalidatePath("/");
}

export async function updateProduct(id: string, formData: FormData) {
  if (!(await IdentityService.isAdmin())) throw new Error("Unauthorized");
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = formData.get("category") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const stock = parseInt(formData.get("stock") as string);
  const isTrending = formData.get("isTrending") === "on";

  // Validate product integrity
  if (price <= 0) throw new Error("Price must be greater than 0");
  if (name.length < 3) throw new Error("Product title must be at least 3 characters");
  if (description.length < 10) throw new Error("Description must be at least 10 characters");
  if (imageUrl && !imageUrl.startsWith("http") && !imageUrl.startsWith("/")) throw new Error("Invalid image URL");
  if (stock < 0) throw new Error("Stock cannot be negative");

  const brand = (formData.get("brand") as string) || "Nova";
  const sku = (formData.get("sku") as string) || `SKU-${Date.now()}`;

  await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      price,
      category,
      brand,
      sku,
      stock,
      isTrending,
      ...(imageUrl ? {
        images: {
          deleteMany: {},
          create: { url: imageUrl, isPrimary: true }
        }
      } : {})
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/store");
  revalidatePath("/");
  revalidatePath(`/product/${id}`);
}

export async function deleteProduct(id: string) {
  if (!(await IdentityService.isAdmin())) throw new Error("Unauthorized");
  await prisma.orderItem.deleteMany({
    where: { productId: id }
  });

  await prisma.product.delete({
    where: { id },
  });

  revalidatePath("/admin/products");
  revalidatePath("/store");
  revalidatePath("/");
}
