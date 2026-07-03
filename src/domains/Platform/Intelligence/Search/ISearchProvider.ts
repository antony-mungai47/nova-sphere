export interface ISearchProvider {
  search(query: string, filters?: any): Promise<any>;
  index(documentId: string, data: any): Promise<void>;
  delete(documentId: string): Promise<void>;
  suggest(prefix: string, type?: 'product' | 'category' | 'brand' | 'vendor'): Promise<any[]>;
  bulkIndex(documents: any[]): Promise<void>;
  healthCheck(): Promise<boolean>;
}
