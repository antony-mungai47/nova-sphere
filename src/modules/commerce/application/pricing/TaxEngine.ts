export class TaxEngine {
  static calculateTax(subtotal: number, discount: number, location?: any): number {
    // A real implementation would use location to determine rate
    const taxableAmount = Math.max(0, subtotal - discount);
    return taxableAmount * 0.08; 
  }
}
