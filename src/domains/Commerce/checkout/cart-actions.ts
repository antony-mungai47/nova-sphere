"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { CartService, GuestCartItem } from "./CartService";

export async function syncCartAction(guestItems: GuestCartItem[]) {
  const user = await currentUser();
  if (!user) return { status: "LOCAL_ONLY" };

  try {
    const mergedCart = await CartService.merge(user.id, guestItems);
    revalidatePath("/store");

    return { status: "MERGED", cart: mergedCart };
  } catch (error: any) {
    console.error("Cart sync failed:", error);
    return { status: "FAILED", error: error.message };
  }
}

export async function addCartItemAction(productId: string, quantity: number, variantId?: string, sellerId?: string) {
  const user = await currentUser();
  if (!user) return { status: "UNAUTHORIZED" };

  try {
    const cart = await CartService.add(user.id, productId, quantity, variantId, sellerId);
    revalidatePath("/store");

    return { status: "SYNCED", cart };
  } catch (error: any) {
    console.error("Add to cart failed:", error);
    return { status: "FAILED", error: error.message };
  }
}

export async function changeCartItemQuantityAction(itemId: string, quantity: number) {
  const user = await currentUser();
  if (!user) return { status: "UNAUTHORIZED" };

  try {
    const cart = await CartService.changeQuantity(user.id, itemId, quantity);
    revalidatePath("/store");

    return { status: "SYNCED", cart };
  } catch (error: any) {
    console.error("Change quantity failed:", error);
    return { status: "FAILED", error: error.message };
  }
}

export async function removeCartItemAction(itemId: string) {
  const user = await currentUser();
  if (!user) return { status: "UNAUTHORIZED" };

  try {
    const cart = await CartService.remove(user.id, itemId);
    revalidatePath("/store");

    return { status: "SYNCED", cart };
  } catch (error: any) {
    console.error("Remove item failed:", error);
    return { status: "FAILED", error: error.message };
  }
}

export async function clearCartAction() {
  const user = await currentUser();
  if (!user) return { status: "UNAUTHORIZED" };

  try {
    await CartService.clear(user.id);
    revalidatePath("/store");

    return { status: "SYNCED" };
  } catch (error: any) {
    console.error("Clear cart failed:", error);
    return { status: "FAILED", error: error.message };
  }
}
