export type CampaignTheme = "default" | "black-friday" | "christmas" | "valentines" | "cyber-monday";

export interface CampaignConfig {
  id: string;
  name: string;
  theme: CampaignTheme;
  activeUntil: string; // ISO Date string
  heroBanner: {
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    videoUrl?: string;
  };
}

export class CampaignEngine {
  static async getActiveCampaigns(): Promise<CampaignConfig[]> {
    const campaigns: CampaignConfig[] = [
      {
        id: "summer-sale-26",
        name: "Summer Savings",
        theme: "default",
        activeUntil: "2026-08-30T00:00:00Z",
        heroBanner: {
          headline: "Summer Tech Clearance",
          subheadline: "Up to 40% off premium audio, smart home, and outdoor gadgets.",
          primaryCta: "Shop the Sale",
          secondaryCta: "View Gift Guide"
        }
      },
      {
        id: "apple-vision",
        name: "Apple Vision Launch",
        theme: "cyber-monday",
        activeUntil: "2026-08-30T00:00:00Z",
        heroBanner: {
          headline: "Welcome to Spatial Computing",
          subheadline: "Experience the ultimate mixed reality headset. In stock now with next-day delivery.",
          primaryCta: "Buy Vision Pro",
          secondaryCta: "Watch Keynote"
        }
      }
    ];

    const now = new Date();
    return campaigns.filter(c => new Date(c.activeUntil) > now);
  }
}
