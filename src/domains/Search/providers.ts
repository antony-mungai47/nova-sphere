// Abstract Search Provider Interface
export interface SearchProvider {
  search(query: string, options?: SearchOptions): Promise<SearchResults>;
  index(document: SearchDocument): Promise<void>;
  delete(id: string): Promise<void>;
  suggest(query: string): Promise<SuggestionResults>;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  filters?: Record<string, any>;
  sortBy?: string;
}

export interface SearchResults {
  hits: SearchDocument[];
  total: number;
}

export interface SearchDocument {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  imageUrl: string;
  healthScore?: number;
  // Merchandising flags
  isSponsored?: boolean;
  isTrending?: boolean;
}

export interface SuggestionResults {
  products: Pick<SearchDocument, 'id' | 'name' | 'imageUrl'>[];
  categories: string[];
  brands: string[];
}

export class PrismaSearchProvider implements SearchProvider {
  async search(query: string, options?: SearchOptions): Promise<SearchResults> {
    console.log(`[PrismaSearchProvider] Searching for "${query}"`);
    // Mock implementation for interface - real implementation would call PrismaClient
    return { hits: [], total: 0 };
  }
  
  async index(document: SearchDocument): Promise<void> {
    console.log(`[PrismaSearchProvider] Indexing ignored (Prisma is source of truth)`);
  }
  
  async delete(id: string): Promise<void> {
    console.log(`[PrismaSearchProvider] Delete ignored (Prisma is source of truth)`);
  }
  
  async suggest(query: string): Promise<SuggestionResults> {
    return { products: [], categories: [], brands: [] };
  }
}

export class AlgoliaSearchProvider implements SearchProvider {
  async search(query: string, options?: SearchOptions): Promise<SearchResults> {
    console.log(`[AlgoliaSearchProvider] Searching for "${query}"`);
    // Algolia implementation would go here
    return { hits: [], total: 0 };
  }
  
  async index(document: SearchDocument): Promise<void> {
    console.log(`[AlgoliaSearchProvider] Indexing document ${document.id}`);
  }
  
  async delete(id: string): Promise<void> {
    console.log(`[AlgoliaSearchProvider] Deleting document ${id}`);
  }
  
  async suggest(query: string): Promise<SuggestionResults> {
    return { products: [], categories: [], brands: [] };
  }
}

export class MeilisearchProvider implements SearchProvider {
  async search(query: string, options?: SearchOptions): Promise<SearchResults> {
    console.log(`[MeilisearchProvider] Searching for "${query}"`);
    // Meilisearch implementation would go here
    return { hits: [], total: 0 };
  }
  
  async index(document: SearchDocument): Promise<void> {
    console.log(`[MeilisearchProvider] Indexing document ${document.id}`);
  }
  
  async delete(id: string): Promise<void> {
    console.log(`[MeilisearchProvider] Deleting document ${id}`);
  }
  
  async suggest(query: string): Promise<SuggestionResults> {
    return { products: [], categories: [], brands: [] };
  }
}

// Search Factory
import { isFeatureEnabled } from '@/lib/featureFlags';

export function getSearchProvider(): SearchProvider {
  if (isFeatureEnabled('ENABLE_SEARCH_PROVIDER_ALGOLIA')) {
    return new AlgoliaSearchProvider();
  }
  if (isFeatureEnabled('ENABLE_SEARCH_PROVIDER_MEILISEARCH')) {
    return new MeilisearchProvider();
  }
  return new PrismaSearchProvider();
}
