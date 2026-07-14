export interface AIInsight {
  insight: string;
  reason: string;
  confidence: number;
  recommendation: string;
}

export interface MetricTelemetry {
  executionTimeMs: number;
  cacheHit: boolean;
  source: string;
  lastUpdated: string;
}

export interface PricingHistoryPoint {
  date: string;
  price: number;
}

export interface PricingDTO {
  currentPrice: number;
  historicalLowest: number;
  historicalHighest: number;
  averagePrice: number;
  competitiveness: number; // 0-100 score
  discountHealth: "poor" | "fair" | "good" | "excellent";
  marketTrend: "rising" | "falling" | "stable";
  history: PricingHistoryPoint[];
  ai: AIInsight;
  telemetry: MetricTelemetry;
}

export interface InventoryDTO {
  currentStock: number;
  salesVelocity: number; // units per day
  estimatedSelloutDays: number;
  restockEta: string | null;
  warehouseAvailability: string[];
  regionalAvailability: string[];
  ai: AIInsight;
  telemetry: MetricTelemetry;
}

export interface TrustDTO {
  trustScore: number; // 0-100
  authenticityVerified: boolean;
  warrantyValid: boolean;
  sellerRating: number;
  deliveryAccuracy: number; // percentage
  returnRate: number; // percentage
  customerSatisfaction: number; // 0-100
  repeatBuyersPercentage: number;
  responseTimeMinutes: number;
  disputeHistory: "clean" | "minor" | "significant";
  verifiedReviewsCount: number;
  ai: AIInsight;
  telemetry: MetricTelemetry;
}

export interface DeliveryDTO {
  fastestDeliveryDate: string;
  cheapestDeliveryCost: number;
  pickupAvailable: boolean;
  lockerAvailable: boolean;
  expressAvailable: boolean;
  carbonEfficient: boolean;
  courierComparison: { name: string; cost: number; days: number }[];
  ai: AIInsight;
  telemetry: MetricTelemetry;
}

export interface SustainabilityDTO {
  ecoScore: number; // 0-100
  packaging: "recyclable" | "compostable" | "standard";
  repairabilityScore: number; // 0-10 out of 10
  recyclabilityPercentage: number;
  energyRating: string; // e.g. "A++"
  manufacturerSustainability: boolean;
  ai: AIInsight;
  telemetry: MetricTelemetry;
}

export interface ProductInsightDTO {
  productId: string;
  pricing: PricingDTO;
  inventory: InventoryDTO;
  trust: TrustDTO;
  delivery: DeliveryDTO;
  sustainability: SustainabilityDTO;
  timestamp: string;
}
