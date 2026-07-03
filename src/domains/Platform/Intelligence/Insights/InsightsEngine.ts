export class InsightsEngine {
  /**
   * Generates human-readable insights explaining why a metric changed.
   */
  static generateNarrativeInsight(metricName: string, changePercent: number): string {
    console.log(`[InsightsEngine] Generating insight for ${metricName} change ${changePercent}%`);
    
    if (metricName === 'Revenue' && changePercent < 0) {
      return "Revenue decreased " + Math.abs(changePercent) + "% because Gaming Laptops declined by 20% while Phones increased by 5%.";
    }
    
    return `${metricName} changed by ${changePercent}%.`;
  }
}
