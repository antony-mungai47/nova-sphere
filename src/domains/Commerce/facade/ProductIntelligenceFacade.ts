import { ProductInsightDTO } from "../types";
import { PricingEngine } from "../pricing/PricingEngine";
import { TrustEngine } from "../trust/TrustEngine";
import { DeliveryEngine } from "../delivery/DeliveryEngine";
import { SustainabilityEngine } from "../sustainability/SustainabilityEngine";

export class ProductIntelligenceFacade {
  private pricing = new PricingEngine();
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
      Promise.resolve({
        currentStock: 42,
        salesVelocity: 3.5,
        estimatedSelloutDays: 12,
        restockEta: "2026-08-01",
        warehouseAvailability: ["Nairobi Main", "Mombasa Hub"],
        regionalAvailability: ["Nairobi", "Coast", "Central"],
        ai: {
          insight: "Stock is moving 15% faster than last month.",
          reason: "Recent social media mention drove unexpected traffic.",
          confidence: 88,
          recommendation: "Purchase soon. Stock likely to deplete before restock."
        },
        telemetry: { executionTimeMs: 18, cacheHit: false, source: "PostgreSQL-Primary", lastUpdated: new Date().toISOString() }
      }),
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
