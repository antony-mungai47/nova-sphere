import { CartItem } from "../PricingService";
import { ProductService } from "../ProductService";

export interface LineItem {
  productId: string;
  quantity: number;
  price: number;
}

export class PriceCalculator {
  static async calculateSubtotal(cartItems: CartItem[]): Promise<{ items: LineItem[], subtotal: number }> {
    const productIds = cartItems.map(i => i.id);
    const dbProducts = await ProductService.getProductsByIds(productIds);

    let subtotal = 0;
    const items = cartItems.map(item => {
      const dbProduct = dbProducts.find(p => p.id === item.id);
      const priceToUse = dbProduct ? (dbProduct.salePrice || dbProduct.price) : (item.price || 0);
      subtotal += Number(priceToUse) * item.quantity;
      return {
        productId: item.id,
        quantity: item.quantity,
        price: Number(priceToUse),
      };
    });

    return { items, subtotal };
  }
}
