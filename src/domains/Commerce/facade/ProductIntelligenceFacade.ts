import { ProductInsightDTO } from "../types";
import { PricingEngine } from "../pricing/PricingEngine";
import { InventoryEngine } from "../inventory/InventoryEngine";
import { TrustEngine } from "../trust/TrustEngine";
import { DeliveryEngine } from "../delivery/DeliveryEngine";
import { SustainabilityEngine } from "../sustainability/SustainabilityEngine";

export class ProductIntelligenceFacade {
  private pricing = new PricingEngine();
  private inventory = new InventoryEngine();
  private trust = new TrustEngine();
  private delivery = new DeliveryEngine();
  private sustainability = new SustainabilityEngine();

  /**
   * Orchestrates the collection of insights across all commerce engines.
   * This acts as the BFF (Backend for Frontend).
   */
  async getFullProductInsight(productId: string): Promise<ProductInsightDTO> {
    const [
      pricing,
      inventory,
      trust,
      delivery,
      sustainability
    ] = await Promise.all([
      this.pricing.getPricingInsight(productId),
      this.inventory.getInventoryInsight(productId),
      this.trust.getTrustInsight(productId),
      this.delivery.getDeliveryInsight(productId),
      this.sustainability.getSustainabilityInsight(productId)
    ]);

    return {
      productId,
      pricing,
      inventory,
      trust,
      delivery,
      sustainability,
      timestamp: new Date().toISOString()
    };
  }
}

// Export a singleton instance for frontend use
export const IntelligenceFacade = new ProductIntelligenceFacade();
