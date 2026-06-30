import { UserRepository } from "@/domains/Foundation/database/repositories/user.repository";

export class HomeRecommendationService {
  static async getContextualRecommendations(userId: string | null, country: string) {
    let preferredCategories: string[] = [];
    let userContext = "Welcome to the future of smart shopping.";

    if (userId) {
      // Authenticated Personalization
      const dbUser = await UserRepository.findUnique({
        where: { clerkId: userId },
        include: {
          recentlyViewed: { include: { product: true }, orderBy: { viewedAt: 'desc' }, take: 10 },
          orders: { include: { items: { include: { product: true } } } },
        }
      });

      if (dbUser) {
        const categoryCounts: Record<string, number> = {};
        dbUser.recentlyViewed.forEach(rv => {
          categoryCounts[rv.product.category] = (categoryCounts[rv.product.category] || 0) + 2;
        });
        dbUser.orders.forEach(order => {
          order.items.forEach(item => {
            categoryCounts[item.product.category] = (categoryCounts[item.product.category] || 0) + 5;
          });
        });
        
        preferredCategories = Object.entries(categoryCounts)
          .sort((a, b) => b[1] - a[1])
          .map(e => e[0])
          .slice(0, 3);
          
        if (preferredCategories.length > 0) {
          userContext = `Curated for you based on your interest in ${preferredCategories.join(", ")}.`;
        }
      }
    } else {
      // Guest Personalization (Seasonality & Location)
      const month = new Date().getMonth();
      if (month >= 5 && month <= 7) preferredCategories = ["Travel", "Fashion"]; // Summer
      else if (month >= 10 || month === 0) preferredCategories = ["Electronics", "Home & Kitchen"]; // Winter/Holidays
      else preferredCategories = ["Watches", "Collectibles"]; // Default luxury

      if (country === 'GB' || country === 'FR' || country === 'DE') {
        userContext = "Trending across Europe this season.";
      } else if (country === 'US' || country === 'CA') {
        userContext = "Top selections for North America.";
      } else {
        userContext = "Global marketplace highlights.";
      }
    }

    return { preferredCategories, userContext };
  }
}
