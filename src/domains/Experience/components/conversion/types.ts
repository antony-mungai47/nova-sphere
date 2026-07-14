export interface CampaignDTO {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  expiresIn?: string; // e.g. "14:59"
  theme: "discount" | "shipping" | "gift" | "rewards";
}

export interface RecommendationDTO {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  image: string;
  rating: number;
  type: "accessory" | "upgrade" | "frequently_bought";
}

export interface CartAnalyticsEvent {
  eventName: 
    | "bundle_viewed" 
    | "bundle_added" 
    | "upsell_clicked" 
    | "drawer_opened" 
    | "drawer_closed" 
    | "coupon_applied" 
    | "coupon_dismissed" 
    | "exit_offer_seen" 
    | "exit_offer_accepted" 
    | "free_shipping_progress" 
    | "recommendation_clicked";
  payload: Record<string, any>;
  timestamp: string;
}
