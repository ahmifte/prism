export type Provider =
  | "openai"
  | "anthropic"
  | "google"
  | "meta"
  | "mistral"
  | "deepseek"
  | "xai";

export interface ModelPricing {
  /** USD per 1M input tokens */
  readonly inputPerMillion: number;
  /** USD per 1M output tokens */
  readonly outputPerMillion: number;
}

/**
 * Tokenizer used to approximate the model's own tokenizer. Non-OpenAI
 * providers don't publish JS tokenizers for every model, so we count with a
 * BPE encoding they resemble and correct with `tokenFactor`.
 */
export type Encoding = "o200k_base" | "cl100k_base";

export interface ModelInfo {
  /** Prism model id, e.g. "openai/gpt-4o" */
  readonly id: string;
  readonly provider: Provider;
  readonly displayName: string;
  readonly contextWindow: number;
  readonly maxOutputTokens: number;
  readonly pricing: ModelPricing;
  readonly encoding: Encoding;
  /** Multiplier applied to the counted tokens to approximate this model's tokenizer */
  readonly tokenFactor: number;
}

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  readonly role: ChatRole;
  readonly content: string;
}

export interface EstimateRequest {
  /** Raw prompt text or a full chat message array */
  readonly input: string | readonly ChatMessage[];
  /** Prism model ids to estimate against; defaults to the full catalog */
  readonly models?: readonly string[];
  /** Expected completion length; defaults to 512 tokens */
  readonly expectedOutputTokens?: number;
}

export interface ModelEstimate {
  readonly model: ModelInfo;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly inputCostUsd: number;
  readonly outputCostUsd: number;
  readonly totalCostUsd: number;
  /** False when the prompt alone exceeds the model's context window */
  readonly fitsContext: boolean;
}
