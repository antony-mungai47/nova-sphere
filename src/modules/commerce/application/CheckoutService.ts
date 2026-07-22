import { IdentityService } from "@/modules/identity/services/IdentityService";
import { ReservationService } from "./ReservationService";
import { PricingService, CartItem } from "./PricingService";
import { PaymentService } from "./PaymentService";
import { OrderService } from "./OrderService";
import { StripeGateway } from "../infrastructure/gateways/StripeGateway";

export class CheckoutService {
  static async checkout(items: CartItem[], clientTotal: number) {
    if (!items || items.length === 0) {
      throw new Error("Items are required");
    }

    // 1. Identity
    const user = await IdentityService.getOrCreateUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // 2. Pricing
    const pricing = await PricingService.calculateTotals(items, clientTotal);

    // 3. Order (Create in pending/CREATED state)
    const order = await OrderService.persistOrder({
      userId: user.id,
      subtotal: pricing.subtotal,
      tax: pricing.tax,
      shippingCost: pricing.shippingCost,
      discount: pricing.discount,
      totalAmount: pricing.totalAmount,
      status: "CREATED",
      currency: "USD",
      items: {
        create: pricing.items
      }
    });

    try {
      // 4. Inventory (Reserve)
      await ReservationService.create(order.id, items, 15);

      // 5. Payment (Authorize)
      const paymentProvider = new StripeGateway();
      const paymentService = new PaymentService(paymentProvider);
      const checkoutUrl = await paymentService.authorizePayment(
        order.id,
        `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}`,
        `${process.env.NEXT_PUBLIC_APP_URL}/cart`
      );

      return { success: true, checkoutUrl };
    } catch (error) {
      // Release inventory if checkout initiation fails
      await ReservationService.release(order.id);
      throw error;
    }
  }
}
