import type { ModelInfo } from "./types.js";

/**
 * Static pricing snapshot. Prices are USD per 1M tokens, taken from each
 * provider's public pricing page. Verify against the provider before relying
 * on these for billing decisions; a live sync service is on the roadmap.
 */
export const PRICING_AS_OF = "2025-06-01";

const MODELS: readonly ModelInfo[] = [
  {
    id: "openai/gpt-4o",
    provider: "openai",
    displayName: "GPT-4o",
    contextWindow: 128_000,
    maxOutputTokens: 16_384,
    pricing: { inputPerMillion: 2.5, outputPerMillion: 10 },
    encoding: "o200k_base",
    tokenFactor: 1,
  },
  {
    id: "openai/gpt-4o-mini",
    provider: "openai",
    displayName: "GPT-4o mini",
    contextWindow: 128_000,
    maxOutputTokens: 16_384,
    pricing: { inputPerMillion: 0.15, outputPerMillion: 0.6 },
    encoding: "o200k_base",
    tokenFactor: 1,
  },
  {
    id: "openai/gpt-4.1",
    provider: "openai",
    displayName: "GPT-4.1",
    contextWindow: 1_047_576,
    maxOutputTokens: 32_768,
    pricing: { inputPerMillion: 2, outputPerMillion: 8 },
    encoding: "o200k_base",
    tokenFactor: 1,
  },
  {
    id: "openai/gpt-4.1-mini",
    provider: "openai",
    displayName: "GPT-4.1 mini",
    contextWindow: 1_047_576,
    maxOutputTokens: 32_768,
    pricing: { inputPerMillion: 0.4, outputPerMillion: 1.6 },
    encoding: "o200k_base",
    tokenFactor: 1,
  },
  {
    id: "openai/o4-mini",
    provider: "openai",
    displayName: "o4-mini",
    contextWindow: 200_000,
    maxOutputTokens: 100_000,
    pricing: { inputPerMillion: 1.1, outputPerMillion: 4.4 },
    encoding: "o200k_base",
    tokenFactor: 1,
  },
  {
    id: "anthropic/claude-opus-4",
    provider: "anthropic",
    displayName: "Claude Opus 4",
    contextWindow: 200_000,
    maxOutputTokens: 32_000,
    pricing: { inputPerMillion: 15, outputPerMillion: 75 },
    encoding: "cl100k_base",
    tokenFactor: 1.15,
  },
  {
    id: "anthropic/claude-sonnet-4",
    provider: "anthropic",
    displayName: "Claude Sonnet 4",
    contextWindow: 200_000,
    maxOutputTokens: 64_000,
    pricing: { inputPerMillion: 3, outputPerMillion: 15 },
    encoding: "cl100k_base",
    tokenFactor: 1.15,
  },
  {
    id: "anthropic/claude-3.5-haiku",
    provider: "anthropic",
    displayName: "Claude 3.5 Haiku",
    contextWindow: 200_000,
    maxOutputTokens: 8_192,
    pricing: { inputPerMillion: 0.8, outputPerMillion: 4 },
    encoding: "cl100k_base",
    tokenFactor: 1.15,
  },
  {
    id: "google/gemini-2.5-pro",
    provider: "google",
    displayName: "Gemini 2.5 Pro",
    contextWindow: 1_048_576,
    maxOutputTokens: 65_536,
    pricing: { inputPerMillion: 1.25, outputPerMillion: 10 },
    encoding: "cl100k_base",
    tokenFactor: 1.05,
  },
  {
    id: "google/gemini-2.5-flash",
    provider: "google",
    displayName: "Gemini 2.5 Flash",
    contextWindow: 1_048_576,
    maxOutputTokens: 65_536,
    pricing: { inputPerMillion: 0.3, outputPerMillion: 2.5 },
    encoding: "cl100k_base",
    tokenFactor: 1.05,
  },
  {
    id: "meta/llama-3.3-70b",
    provider: "meta",
    displayName: "Llama 3.3 70B (hosted)",
    contextWindow: 128_000,
    maxOutputTokens: 8_192,
    pricing: { inputPerMillion: 0.88, outputPerMillion: 0.88 },
    encoding: "cl100k_base",
    tokenFactor: 1.1,
  },
  {
    id: "mistral/mistral-large",
    provider: "mistral",
    displayName: "Mistral Large",
    contextWindow: 128_000,
    maxOutputTokens: 8_192,
    pricing: { inputPerMillion: 2, outputPerMillion: 6 },
    encoding: "cl100k_base",
    tokenFactor: 1.1,
  },
  {
    id: "deepseek/deepseek-chat",
    provider: "deepseek",
    displayName: "DeepSeek V3",
    contextWindow: 64_000,
    maxOutputTokens: 8_192,
    pricing: { inputPerMillion: 0.27, outputPerMillion: 1.1 },
    encoding: "cl100k_base",
    tokenFactor: 1.1,
  },
  {
    id: "xai/grok-3",
    provider: "xai",
    displayName: "Grok 3",
    contextWindow: 131_072,
    maxOutputTokens: 16_384,
    pricing: { inputPerMillion: 3, outputPerMillion: 15 },
    encoding: "o200k_base",
    tokenFactor: 1.05,
  },
];

const byId = new Map(MODELS.map((m) => [m.id, m]));

export function listModels(): readonly ModelInfo[] {
  return MODELS;
}

export function getModel(id: string): ModelInfo {
  const model = byId.get(id);
  if (!model) {
    throw new Error(
      `Unknown model "${id}". Known ids: ${MODELS.map((m) => m.id).join(", ")}`,
    );
  }
  return model;
}
