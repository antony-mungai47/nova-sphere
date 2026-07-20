"use client";

import { useCartStore } from "@/store/useCartStore";
import { useAuth } from "@clerk/nextjs";
import { addCartItemAction, removeCartItemAction, changeCartItemQuantityAction, clearCartAction } from "@/domains/Commerce/checkout/cart-actions";
// removed sonner

export function useCartActions() {
  const { isSignedIn } = useAuth();
  const cartStore = useCartStore();

  const addItem = async (item: any) => {
    // Optimistic Update
    cartStore.addItem(item);

    if (isSignedIn) {
      try {
        const res = await addCartItemAction(item.id, 1);
        if (res.status === "FAILED") {
          throw new Error(res.error);
        }
      } catch (err: any) {
        // Rollback
        cartStore.removeItem(item.id);
        console.error(err.message || "Failed to add item to cart. Reverting.");
      }
    }
  };

  const removeItem = async (id: string) => {
    const item = cartStore.items.find(i => i.id === id);
    if (!item) return;
    
    // Optimistic
    cartStore.removeItem(id);

    if (isSignedIn) {
      try {
        const res = await removeCartItemAction(id);
        if (res.status === "FAILED") throw new Error(res.error);
      } catch (err: any) {
        // Rollback
        cartStore.addItem(item);
        console.error("Failed to remove item.");
      }
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    const item = cartStore.items.find(i => i.id === id);
    if (!item) return;
    const oldQty = item.quantity;

    // Optimistic
    cartStore.updateQuantity(id, quantity);

    if (isSignedIn) {
      try {
        const res = await changeCartItemQuantityAction(id, quantity);
        if (res.status === "FAILED") throw new Error(res.error);
      } catch (err: any) {
        // Rollback
        cartStore.updateQuantity(id, oldQty);
        console.error(err.message || "Failed to update quantity.");
      }
    }
  };

  const clearCart = async () => {
    const oldItems = [...cartStore.items];
    
    // Optimistic
    cartStore.clearCart();

    if (isSignedIn) {
      try {
        const res = await clearCartAction();
        if (res.status === "FAILED") throw new Error(res.error);
      } catch (err: any) {
        // Rollback
        oldItems.forEach(i => cartStore.addItem(i));
        console.error("Failed to clear cart.");
      }
    }
  };

  return {
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  };
}
