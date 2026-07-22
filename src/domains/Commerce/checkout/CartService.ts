import { prisma } from "@/lib/prisma";
import { Prisma, CartStatus, CartEventType, CartType } from "@prisma/client";
import { InventoryService } from "@/modules/commerce/application/InventoryService";
import { EventEmitter } from "events";

export const CartEventBus = new EventEmitter();

// We map out the generic guest items
export interface GuestCartItem {
  productId: string;
  variantId?: string;
  sellerId?: string;
  quantity: number;
}

export class CartService {
  /**
   * Internal helper to fetch or create the active cart for a user
   */
  private static async getOrCreateActiveCart(userId: string, tx: Prisma.TransactionClient = prisma) {
    let cart = await tx.cart.findFirst({
      where: { userId, status: CartStatus.ACTIVE },
      include: { items: true }
    });

    if (!cart) {
      cart = await tx.cart.create({
        data: {
          userId,
          status: CartStatus.ACTIVE,
          type: CartType.SHOPPING
        },
        include: { items: true }
      });
    }

    return cart;
  }

  /**
   * Gets the active cart for a user with its items.
   */
  static async get(userId: string) {
    return this.getOrCreateActiveCart(userId);
  }

  /**
   * Merges a guest cart into the user's active DB cart.
   * Handles identical SKUs via Math.min(guest + db, availableStock).
   */
  static async merge(userId: string, guestItems: GuestCartItem[]) {
    if (!guestItems || guestItems.length === 0) return await this.get(userId);

    const mergedCart = await prisma.$transaction(async (tx) => {
      const cart = await this.getOrCreateActiveCart(userId, tx);

      for (const guestItem of guestItems) {
        // Validate product
        const product = await tx.product.findUnique({
          where: { id: guestItem.productId },
          include: { ownerTenant: true, images: { take: 1 } }
        });

        if (!product) continue;

        try {
          // Find if this item already exists in the cart
          const existingItem = cart.items.find(
            i => i.productId === guestItem.productId && 
                 i.variantId === (guestItem.variantId || null) && 
                 i.sellerId === (guestItem.sellerId || null)
          );

          const dbQuantity = existingItem ? existingItem.quantity : 0;
          const proposedQuantity = dbQuantity + guestItem.quantity;

          // Compute max available stock safely using InventoryService logic
          let availableStock = product.stock;
          const inventory = await tx.inventory.findUnique({ where: { productId: product.id } });
          if (inventory) {
            availableStock = inventory.quantity - inventory.reserved;
          }

          const finalQuantity = Math.min(proposedQuantity, availableStock);
          
          if (finalQuantity <= 0) continue; // Out of stock

          const unitPrice = product.salePrice ?? product.price;

          if (existingItem) {
            // Update
            await tx.cartItem.update({
              where: { id: existingItem.id },
              data: { quantity: finalQuantity, unitPrice }
            });
          } else {
            // Create with snapshots
            await tx.cartItem.create({
              data: {
                cartId: cart.id,
                productId: product.id,
                variantId: guestItem.variantId,
                sellerId: guestItem.sellerId || product.ownerTenantId,
                quantity: finalQuantity,
                unitPrice,
                currency: "USD",
                productNameSnapshot: product.name,
                productImageSnapshot: product.images[0]?.url,
                vendorSnapshot: product.ownerTenant ? JSON.parse(JSON.stringify(product.ownerTenant)) : null,
              }
            });
          }
        } catch (error) {
          console.error(`Failed to merge item ${guestItem.productId}:`, error);
        }
      }

      // Record Audit/Event
      await tx.cartEvent.create({
        data: {
          cartId: cart.id,
          eventType: CartEventType.MERGE,
          payload: { itemsMerged: guestItems.length }
        }
      });

      return await tx.cart.findUnique({
        where: { id: cart.id },
        include: { items: true }
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });

    // Fire Async Event Bus
    CartEventBus.emit("CART_UPDATED", { userId, cartId: mergedCart?.id, eventType: CartEventType.MERGE });
    
    return mergedCart;
  }

  /**
   * Adds an item to the cart.
   */
  static async add(userId: string, productId: string, quantity: number, variantId?: string, sellerId?: string) {
    const cart = await prisma.$transaction(async (tx) => {
      const activeCart = await this.getOrCreateActiveCart(userId, tx);
      
      // Strict Validation
      await InventoryService.validateAvailability(productId, quantity, tx);
      
      const product = await tx.product.findUniqueOrThrow({
        where: { id: productId },
        include: { images: { take: 1 }, ownerTenant: true }
      });

      const existingItem = activeCart.items.find(
        i => i.productId === productId && i.variantId === (variantId || null) && i.sellerId === (sellerId || null)
      );

      const unitPrice = product.salePrice ?? product.price;

      if (existingItem) {
        const newQty = existingItem.quantity + quantity;
        await InventoryService.validateAvailability(productId, newQty, tx); // Check again with new total
        
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQty, unitPrice }
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: activeCart.id,
            productId,
            variantId,
            sellerId: sellerId || product.ownerTenantId,
            quantity,
            unitPrice,
            currency: "USD",
            productNameSnapshot: product.name,
            productImageSnapshot: product.images[0]?.url,
            vendorSnapshot: product.ownerTenant ? JSON.parse(JSON.stringify(product.ownerTenant)) : null,
          }
        });
      }

      await tx.cartEvent.create({
        data: {
          cartId: activeCart.id,
          eventType: CartEventType.ADD,
          payload: { productId, quantity, variantId }
        }
      });

      return await tx.cart.findUnique({
        where: { id: activeCart.id },
        include: { items: true }
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });

    CartEventBus.emit("CART_UPDATED", { userId, cartId: cart?.id, eventType: CartEventType.ADD });
    return cart;
  }

  /**
   * Change quantity of an existing item
   */
  static async changeQuantity(userId: string, itemId: string, quantity: number) {
    if (quantity <= 0) return this.remove(userId, itemId);

    const cart = await prisma.$transaction(async (tx) => {
      const activeCart = await this.getOrCreateActiveCart(userId, tx);
      const item = await tx.cartItem.findUnique({ where: { id: itemId } });
      
      if (!item || item.cartId !== activeCart.id) throw new Error("Item not found in cart");

      await InventoryService.validateAvailability(item.productId, quantity, tx);

      await tx.cartItem.update({
        where: { id: itemId },
        data: { quantity }
      });

      return await tx.cart.findUnique({
        where: { id: activeCart.id },
        include: { items: true }
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });

    CartEventBus.emit("CART_UPDATED", { userId, cartId: cart?.id, eventType: CartEventType.ADD });
    return cart;
  }

  /**
   * Removes an item from the cart
   */
  static async remove(userId: string, itemId: string) {
    const cart = await prisma.$transaction(async (tx) => {
      const activeCart = await this.getOrCreateActiveCart(userId, tx);
      const item = await tx.cartItem.findUnique({ where: { id: itemId } });
      
      if (!item || item.cartId !== activeCart.id) return activeCart;

      await tx.cartItem.delete({ where: { id: itemId } });
      
      await tx.cartEvent.create({
        data: {
          cartId: activeCart.id,
          eventType: CartEventType.REMOVE,
          payload: { itemId }
        }
      });

      return await tx.cart.findUnique({
        where: { id: activeCart.id },
        include: { items: true }
      });
    });

    CartEventBus.emit("CART_UPDATED", { userId, cartId: cart?.id, eventType: CartEventType.REMOVE });
    return cart;
  }

  /**
   * Clears the cart
   */
  static async clear(userId: string) {
    const cart = await prisma.$transaction(async (tx) => {
      const activeCart = await this.getOrCreateActiveCart(userId, tx);
      
      await tx.cartItem.deleteMany({ where: { cartId: activeCart.id } });
      
      await tx.cartEvent.create({
        data: {
          cartId: activeCart.id,
          eventType: CartEventType.CLEAR,
        }
      });
      return activeCart;
    });

    CartEventBus.emit("CART_UPDATED", { userId, cartId: cart.id, eventType: CartEventType.CLEAR });
  }
}
