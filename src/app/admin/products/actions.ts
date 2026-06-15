"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = formData.get("category") as string;
  const imageUrl = formData.get("imageUrl") as string || "/hero-product.png";
  const stock = parseInt(formData.get("stock") as string) || 0;
  const isTrending = formData.get("isTrending") === "on";

  // Validate product integrity
  if (price <= 0) throw new Error("Price must be greater than 0");
  if (name.length < 3) throw new Error("Product title must be at least 3 characters");
  if (description.length < 10) throw new Error("Description must be at least 10 characters");
  if (!imageUrl.startsWith("http") && !imageUrl.startsWith("/")) throw new Error("Invalid image URL");
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
      images: {
        create: {
          url: imageUrl,
          isPrimary: true
        }
      }
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/store");
  revalidatePath("/");
}

export async function updateProduct(id: string, formData: FormData) {
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
  if (!imageUrl.startsWith("http") && !imageUrl.startsWith("/")) throw new Error("Invalid image URL");
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
      images: {
        deleteMany: {},
        create: {
          url: imageUrl,
          isPrimary: true
        }
      }
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/store");
  revalidatePath("/");
  revalidatePath(`/product/${id}`);
}

export async function deleteProduct(id: string) {
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
