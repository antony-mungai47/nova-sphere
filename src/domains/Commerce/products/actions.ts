"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";


export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  sku: string;
  category: string;
  brand: string;
  stock: number;
  imageUrl: string;
}) {
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        salePrice: data.salePrice,
        sku: data.sku,
        category: data.category,
        brand: data.brand,
        stock: data.stock,
        images: {
          create: [
            {
              url: data.imageUrl,
              isPrimary: true,
            }
          ]
        }
      }
    });

    revalidatePath("/store");
    revalidatePath("/admin/products");
    
    return { success: true, productId: product.id };
  } catch (error: any) {
    console.error("Failed to create product:", error);
    return { success: false, error: error.message };
  }
}
