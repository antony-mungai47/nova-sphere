import { AffinityCalculator } from "./AffinityCalculator";
import { ExperimentEngine } from "./ExperimentEngine";
import { RankingEngine } from "./RankingEngine";
import { PersonalizationContext, AffinityProfile, HeroVariant, ContextualOffer } from "./types";

export class ExperienceResolver {
  private affinityCalc = new AffinityCalculator();
  private experimentEngine = new ExperimentEngine();
  private rankingEngine = new RankingEngine();
  
  private cachedContext: PersonalizationContext | null = null;
  private lastResolvedAt: number = 0;
  private readonly CACHE_TTL_MS = 60000; // 1 minute

  /**
   * Resolves the entire Experience context for the user based on their signals.
   */
  public async resolve(identifier: string, recentSignals: any[]): Promise<PersonalizationContext> {
    const now = Date.now();
    if (this.cachedContext && (now - this.lastResolvedAt < this.CACHE_TTL_MS)) {
      return this.cachedContext;
    }

    // 1. Compute Affinities
    const affinities = await this.affinityCalc.calculate(recentSignals);

    // 2. Resolve Experiment Cohort for the Homepage Hero
    const heroCohort = this.experimentEngine.getCohort("homepage_hero_v2", identifier);

    // 3. Resolve Hero Variant based on Affinity & Cohort
    const heroVariant = this.resolveHero(affinities, heroCohort);

    // 4. Resolve Offers
    const offers = this.resolveOffers(affinities);

    // 5. Assemble Context
    this.cachedContext = {
      affinities,
      campaign: "Summer Sale 2026",
      experimentGroup: heroCohort,
      offers,
      recommendedCategories: this.resolveCategories(affinities),
      heroVariant,
      recommendationModel: "hybrid-affinity-v1"
    };
    
    this.lastResolvedAt = now;
    return this.cachedContext;
  }

  private resolveHero(affinities: AffinityProfile, cohort: string): HeroVariant {
    // If they have high photography affinity, show camera hero
    if (affinities.photography > 0.7) {
      return {
        id: "hero_photography_1",
        imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1600&q=80",
        title: "Capture the Perfect Shot",
        subtitle: "Professional gear for your next adventure.",
        ctaText: "Shop Photography",
        ctaLink: "/category/photography",
        theme: "dark"
      };
    }

    // Default hero, maybe impacted by A/B test cohort
    if (cohort === "A") {
      return {
        id: "hero_default_a",
        imageUrl: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1600&q=80",
        title: "The Future of E-Commerce",
        subtitle: "Discover products tailored to you.",
        ctaText: "Explore Now",
        ctaLink: "/store",
        theme: "light"
      };
    }

    return {
      id: "hero_default_b",
      imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&q=80",
      title: "Smart Shopping Delivered",
      subtitle: "The marketplace that understands you.",
      ctaText: "Start Browsing",
      ctaLink: "/store",
      theme: "dark"
    };
  }

  private resolveOffers(affinities: AffinityProfile): ContextualOffer[] {
    const offers: ContextualOffer[] = [];
    
    if (affinities.budget > 0.8) {
      offers.push({
        id: "offer_free_shipping",
        type: "free_shipping",
        title: "Free Shipping on Everything",
        description: "Because you're a valued customer, enjoy free shipping today.",
        ctaText: "Shop Deals",
        ctaLink: "/store/deals"
      });
    } else if (affinities.premium > 0.8) {
      offers.push({
        id: "offer_vip",
        type: "vip_discount",
        title: "VIP Status Unlocked",
        description: "Get 15% off premium items.",
        ctaText: "Shop Premium",
        ctaLink: "/store/premium"
      });
    }

    return offers;
  }

  private resolveCategories(affinities: AffinityProfile): string[] {
    // Sort keys by score
    return Object.keys(affinities)
      .sort((a, b) => affinities[b] - affinities[a])
      .slice(0, 3);
  }

  public getRankingEngine() {
    return this.rankingEngine;
  }
}

// Global Singleton
export const Experience = new ExperienceResolver();
