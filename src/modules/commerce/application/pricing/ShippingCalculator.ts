export class ShippingCalculator {
  static calculateShipping(subtotal: number, address?: any): number {
    // Basic logic: free shipping over $100
    return subtotal > 100 ? 0 : 15.00;
  }
}
