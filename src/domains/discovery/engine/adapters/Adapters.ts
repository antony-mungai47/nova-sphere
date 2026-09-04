import { SearchQuery, SearchResultDTO } from "../types";

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
    return [];
  }
}

export class VoiceAdapter implements DiscoveryAdapter {
  name = "VoiceAdapter";

  supports(query: SearchQuery) {
    return query.modality === "voice";
  }

  async execute(query: SearchQuery): Promise<SearchResultDTO[]> {
    return [];
  }
}

export class ImageAdapter implements DiscoveryAdapter {
  name = "ImageAdapter";

  supports(query: SearchQuery) {
    return query.modality === "image" || query.modality === "ocr" || query.modality === "barcode";
  }

  async execute(query: SearchQuery): Promise<SearchResultDTO[]> {
    return [];
  }
}
