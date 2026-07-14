import { SearchQuery, SearchResultDTO } from "./types";
import { DiscoveryAdapter, TextAdapter, VoiceAdapter, ImageAdapter } from "./adapters/Adapters";

export class DiscoveryEngine {
  private adapters: DiscoveryAdapter[] = [];

  constructor() {
    this.adapters.push(new TextAdapter());
    this.adapters.push(new VoiceAdapter());
    this.adapters.push(new ImageAdapter());
  }

  public registerAdapter(adapter: DiscoveryAdapter) {
    this.adapters.push(adapter);
  }

  public async executeSearch(query: SearchQuery): Promise<SearchResultDTO[]> {
    // Determine the right adapter
    const adapter = this.adapters.find(a => a.supports(query));
    if (!adapter) {
      console.warn(`[DiscoveryEngine] No adapter found for modality: ${query.modality}`);
      return [];
    }

    try {
      // In V3.0 this will hit AI endpoints, for now it returns mocked UI data
      const results = await adapter.execute(query);
      
      // We can also inject contextual rules here (e.g. promoting sponsored items)
      return results.sort((a, b) => b.score - a.score);
    } catch (e) {
      console.error("[DiscoveryEngine] Search failed", e);
      return [];
    }
  }

  // Pre-fetch modules
  public async getTrendingSearches(): Promise<string[]> {
    return ["Wireless Headphones", "Mechanical Keyboard", "Gaming Mouse", "Waterproof Tent"];
  }

  public async getRecentSearches(sessionId?: string): Promise<string[]> {
    return ["Sony WH-1000XM5", "Running Shoes"];
  }

  public async getAutocompleteSuggestions(partial: string): Promise<string[]> {
    if (!partial || partial.length < 2) return [];
    
    // Very basic mock for V2.4
    const mockDb = [
      "Nike Shoes", "Nike Running Shoes", "Nike Air Max", "Nike Black Shoes", "Nike Sale",
      "waterproof tent", "waterproof hiking backpack", "waterproof boots"
    ];
    return mockDb.filter(s => s.toLowerCase().includes(partial.toLowerCase()));
  }
}

// Global Singleton
export const Engine = new DiscoveryEngine();
