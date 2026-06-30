import { SearchDocument } from '@/domains/Search/providers';

export class MerchandisingEngine {
  /**
   * Applies active business rules and promotions to search results or recommendations,
   * completely decoupling these rules from the developer code.
   */
  static applyMerchandisingRules(documents: SearchDocument[]): SearchDocument[] {
    // In a real system, this fetches active rules from the database (e.g., "Boost Sony products")
    // For now, we simulate boosting products tagged as 'isSponsored'.
    
    return documents.map(doc => {
      if (doc.isSponsored) {
        return {
          ...doc,
          healthScore: (doc.healthScore || 0) + 50, // Artificial boost
        };
      }
      return doc;
    }).sort((a, b) => (b.healthScore || 0) - (a.healthScore || 0));
  }
}
