import { getModel, listModels } from "./catalog.js";
import { countChatTokens, countTextTokens } from "./tokenize.js";
import type { EstimateRequest, ModelEstimate, ModelInfo } from "./types.js";

const DEFAULT_OUTPUT_TOKENS = 512;
const MILLION = 1_000_000;

function countInputTokens(model: ModelInfo, input: EstimateRequest["input"]): number {
  if (typeof input === "string") return countTextTokens(model, input);
  return countChatTokens(model, input);
}

/**
 * Estimate what a request would cost on each model, cheapest first.
 * Throws if any requested model id is not in the catalog.
 */
export function estimate(request: EstimateRequest): ModelEstimate[] {
  const models = request.models
    ? request.models.map(getModel)
    : [...listModels()];
  const requestedOutput = request.expectedOutputTokens ?? DEFAULT_OUTPUT_TOKENS;
  if (requestedOutput < 0) {
    throw new Error("expectedOutputTokens must be >= 0");
  }
  const estimates = models.map((model): ModelEstimate => {
    const inputTokens = countInputTokens(model, request.input);
    const outputTokens = Math.min(requestedOutput, model.maxOutputTokens);
    const inputCostUsd = (inputTokens / MILLION) * model.pricing.inputPerMillion;
    const outputCostUsd = (outputTokens / MILLION) * model.pricing.outputPerMillion;
    return {
      model,
      inputTokens,
      outputTokens,
      inputCostUsd,
      outputCostUsd,
      totalCostUsd: inputCostUsd + outputCostUsd,
      fitsContext: inputTokens <= model.contextWindow,
    };
  });
  return estimates.sort((a, b) => a.totalCostUsd - b.totalCostUsd);
}

/** The single cheapest model whose context window fits the prompt. */
export function cheapest(request: EstimateRequest): ModelEstimate {
  const fitting = estimate(request).filter((e) => e.fitsContext);
  if (fitting.length === 0) {
    throw new Error("Prompt does not fit any model's context window");
  }
  return fitting[0];
}
