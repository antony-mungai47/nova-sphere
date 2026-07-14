import { SearchQuery, SearchResultDTO } from "../types";
import { GlobalAIOrchestrator } from "../../../ai/orchestrator/AIOrchestrator";
import { GlobalEmbedding } from "../../../ai/embeddings/EmbeddingProvider";
import { DiscoveryPrompts } from "../../../ai/prompts";

export interface DiscoveryAdapter {
  name: string;
  supports: (query: SearchQuery) => boolean;
  execute: (query: SearchQuery) => Promise<SearchResultDTO[]>;
}

export class TextAdapter implements DiscoveryAdapter {
  name = "TextAdapter";

  supports(query: SearchQuery) {
    return query.modality === "text";
  }

  async execute(query: SearchQuery): Promise<SearchResultDTO[]> {
    if (!query.rawInput) return [];
    const text = query.rawInput.toLowerCase();

    // 1. AI Intent Extraction
    const prompt = DiscoveryPrompts.v1.replace("{{query}}", text);
    const aiResponse = await GlobalAIOrchestrator.generate(prompt, { provider: "openai" });

    // 2. Vector Embeddings
    const vector = await GlobalEmbedding.embed(text);
    const similarIds = await GlobalEmbedding.search(vector, 2);

    // 3. Orchestrated Results (Mocking the final array based on semantic intent)
    const results: SearchResultDTO[] = [
      {
        id: "p1",
        type: "product",
        score: 0.95,
        title: "Semantic Match for: " + (aiResponse ? JSON.parse(aiResponse).intent : text),
        subtitle: "Electronics",
        thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
        reason: "Vector similarity matched intent",
      }
    ];
    
    // Heuristic Fallback Strategy inside Orchestrator (if AI failed)
    if (!aiResponse) {
      results.push({
        id: "c1",
        type: "category",
        score: 0.8,
        title: "Heuristic Fallback: " + text,
        subtitle: "Explore more",
      });
    }

    return results;
  }
}

export class VoiceAdapter implements DiscoveryAdapter {
  name = "VoiceAdapter";

  supports(query: SearchQuery) {
    return query.modality === "voice";
  }

  async execute(query: SearchQuery): Promise<SearchResultDTO[]> {
    return [
      {
        id: "p2",
        type: "product",
        score: 0.98,
        title: "Voice Matched: " + query.parsedIntent,
        subtitle: "Apparel",
        thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
        reason: "Audio transcription matched intent",
      }
    ];
  }
}

export class ImageAdapter implements DiscoveryAdapter {
  name = "ImageAdapter";

  supports(query: SearchQuery) {
    return query.modality === "image" || query.modality === "ocr" || query.modality === "barcode";
  }

  async execute(query: SearchQuery): Promise<SearchResultDTO[]> {
    return [
      {
        id: "p3",
        type: "product",
        score: 0.99,
        title: "Visual Match Found",
        subtitle: "Computer Accessories",
        thumbnail: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80",
        reason: "Visual similarity > 95%",
      }
    ];
  }
}
