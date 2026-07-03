import { ISearchProvider } from './ISearchProvider';
import { PostgresFallbackProvider } from './PostgresFallbackProvider';

export class SearchEngine {
  private static provider: ISearchProvider = new PostgresFallbackProvider();

  static async search(query: string, filters?: any) {
    return this.provider.search(query, filters);
  }

  static async suggest(prefix: string) {
    return this.provider.suggest(prefix);
  }

  // To be used by Sagas
  static async indexDocument(documentId: string, data: any) {
    return this.provider.index(documentId, data);
  }
}
