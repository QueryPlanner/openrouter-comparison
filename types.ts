export interface Pricing {
  prompt: string;
  completion: string;
  request?: string;
  image?: string;
  web_search?: string;
  internal_reasoning?: string;
  input_cache_read?: string;
  input_cache_write?: string;
}

export interface Architecture {
  modality?: string; // Legacy
  tokenizer?: string;
  instruct_type?: string | null;
  input_modalities?: string[];
  output_modalities?: string[];
}

export interface TopProvider {
  context_length?: number;
  max_completion_tokens?: number;
  is_moderated?: boolean;
  throughput?: string;
}

export interface Model {
  id: string;
  name: string;
  description?: string;
  pricing: Pricing;
  context_length: number;
  architecture?: Architecture;
  top_provider?: TopProvider;
  per_request_limits?: any;
  supported_parameters?: string[];
  created?: number;
  canonical_slug?: string;
}

export interface ModelResponse {
  data: Model[];
}

export type SortOption = 'price_low_high' | 'price_high_low' | 'context_high_low' | 'name_a_z';