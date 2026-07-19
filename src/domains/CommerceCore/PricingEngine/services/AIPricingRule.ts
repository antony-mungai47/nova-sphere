import { Money } from '../../Financial/Money';
import { PricingRule, CartItemContext } from '../contracts/IPricingEngine';
import { GlobalAIOrchestrator } from '@/domains/AI/orchestrator/AIOrchestrator';
import { PricingPrompts } from '@/domains/AI/prompts';

export class AIPricingRule implements PricingRule {
  private readonly MIN_MARGIN_THRESHOLD = 0.15; // 15% margin minimum business rule
  id: string = "ai_pricing_rule_1";
  name: string = "Dynamic AI Pricing";

  constructor(private baseDiscountRate: number = 0.05) {}

  async applyAsync(subtotal: Money, items: CartItemContext[]): Promise<Money> {
    let totalDiscountAmount = 0;

    for (const item of items) {
      // 1. Prepare AI prompt
      const prompt = PricingPrompts.v1.replace("{{data}}", JSON.stringify({
        productId: item.id,
        unitPrice: item.unitPrice.amount.toNumber(),
        // mock cost for now, ideally fetched from context
        unitCost: item.unitPrice.amount.toNumber() * 0.6, 
      }));
      const aiResponse = await GlobalAIOrchestrator.generate(prompt, { provider: "openai" });
      
      let recommendedDiscountPct = 0;
      if (aiResponse) {
        try {
          const parsed = JSON.parse(aiResponse);
          recommendedDiscountPct = parsed.recommendedDiscount / 100;
        } catch (e) {
          console.warn("AI Pricing failed parsing, falling back to 0 discount.");
        }
      }

      // 3. Business Rule Validation
      const currentMargin = 1 - (0.6); // 40% margin mock
      const proposedMargin = currentMargin - recommendedDiscountPct;

      if (proposedMargin >= this.MIN_MARGIN_THRESHOLD) {
        // Safe to apply AI discount
        totalDiscountAmount += (item.unitPrice.amount.toNumber() * recommendedDiscountPct) * item.quantity;
      } else {
        // Business Rule Reject! Only apply up to the threshold
        const safeDiscountPct = currentMargin - this.MIN_MARGIN_THRESHOLD;
        if (safeDiscountPct > 0) {
          totalDiscountAmount += (item.unitPrice.amount.toNumber() * safeDiscountPct) * item.quantity;
        }
      }
    }

    return Money.from(totalDiscountAmount, subtotal.currency);
  }

  // Synchronous mock implementation to satisfy the interface for now
  apply(subtotal: Money, items: CartItemContext[]): Money {
    // Ideally the engine would support async rules, 
    // but for the sake of the synchronous IPricingEngine interface:
    return Money.from(0, subtotal.currency);
  }
}
