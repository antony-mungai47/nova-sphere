export type Modality = "text" | "voice" | "image" | "barcode" | "ocr" | "recommendation";

export interface SearchQuery {
  modality: Modality;
  rawInput: string | File | Blob;
  parsedIntent?: string; 
  location?: { lat: number; lng: number };
  language?: string;
  sessionId?: string;
  userId?: string;
  filters?: Record<string, string | number | boolean>;
  sort?: string;
}

export type SearchResultType = 
  | "product" 
  | "category" 
  | "brand" 
  | "vendor" 
  | "collection" 
  | "article" 
  | "faq" 
  | "community_question" 
  | "review";

export interface SearchResultAction {
  label: string;
  type: "link" | "add_to_cart" | "quick_view";
  payload: string;
}

export interface SearchResultDTO {
  id: string;
  type: SearchResultType;
  score: number;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  badges?: string[];
  highlights?: string[];
  reason?: string;
  actions?: SearchResultAction[];
}
