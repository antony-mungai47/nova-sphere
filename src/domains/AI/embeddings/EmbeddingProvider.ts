export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
  search(queryEmbedding: number[], topK: number): Promise<string[]>; // Returns IDs
}

/**
 * Local in-memory mock for Vector Database.
 * Allows Discovery to function without external dependencies,
 * but implements the exact interface needed for Pinecone later.
 */
export class LocalCosineProvider implements EmbeddingProvider {
  private documentStore: Map<string, number[]> = new Map();

  /**
   * Mocks embedding generation
   */
  async embed(text: string): Promise<number[]> {
    // Return a dummy vector based on string length and char codes
    const vector = new Array(1536).fill(0);
    for(let i = 0; i < Math.min(text.length, 1536); i++) {
      vector[i] = text.charCodeAt(i) / 255.0;
    }
    return vector;
  }

  /**
   * Mocks storing a document embedding
   */
  async upsert(id: string, embedding: number[]) {
    this.documentStore.set(id, embedding);
  }

  /**
   * Mocks cosine similarity search
   */
  async search(queryEmbedding: number[], topK: number = 5): Promise<string[]> {
    const results: { id: string; score: number }[] = [];

    for (const [id, docEmbedding] of this.documentStore.entries()) {
      const score = this.cosineSimilarity(queryEmbedding, docEmbedding);
      results.push({ id, score });
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(r => r.id);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export const GlobalEmbedding = new LocalCosineProvider();
