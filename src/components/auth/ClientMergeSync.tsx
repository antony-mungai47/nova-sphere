"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useCartStore } from "@/store/useCartStore";
import { syncCartAction } from "@/domains/Commerce/checkout/cart-actions";
import { syncWishlistAction } from "@/domains/Customer/wishlist/actions"; // Assuming this exists or will be created

export function ClientMergeSync() {
  const { isSignedIn } = useAuth();
  const cartStore = useCartStore();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (isSignedIn && !hasSynced.current) {
      hasSynced.current = true;
      
      const syncData = async () => {
        // Sync Cart
        const guestItems = cartStore.items.map(i => ({
          productId: i.id,
          quantity: i.quantity
        }));

        if (guestItems.length > 0) {
          const res = await syncCartAction(guestItems);
          if (res.status === "MERGED") {
            // Server has merged our items, clear the local guest cart 
            // since the server is now the source of truth for this session
            cartStore.clearCart();
          }
        }

        // Sync Wishlist (TODO: Implement Wishlist merge)
        const localWishlistStr = localStorage.getItem("nova-guest-wishlist");
        if (localWishlistStr) {
          const productIds = JSON.parse(localWishlistStr);
          if (Array.isArray(productIds) && productIds.length > 0) {
            await syncWishlistAction(productIds);
            localStorage.removeItem("nova-guest-wishlist");
          }
        }
      };

      syncData();
    }
  }, [isSignedIn]);

  return null;
}
