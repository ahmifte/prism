import { encode as encodeO200k } from "gpt-tokenizer/encoding/o200k_base";
import { encode as encodeCl100k } from "gpt-tokenizer/encoding/cl100k_base";
import type { ChatMessage, ModelInfo } from "./types.js";

// Per-message wrapping overhead in the OpenAI chat format, plus the assistant
// priming tokens. Other providers differ slightly; this is a fair approximation.
const TOKENS_PER_MESSAGE = 4;
const REPLY_PRIMING_TOKENS = 3;

function encodeFor(model: ModelInfo, text: string): number {
  const encoded =
    model.encoding === "o200k_base" ? encodeO200k(text) : encodeCl100k(text);
  return encoded.length;
}

/** Estimated token count for raw text on a given model. */
export function countTextTokens(model: ModelInfo, text: string): number {
  return Math.ceil(encodeFor(model, text) * model.tokenFactor);
}

/** Estimated prompt token count for a chat message array on a given model. */
export function countChatTokens(
  model: ModelInfo,
  messages: readonly ChatMessage[],
): number {
  let tokens = REPLY_PRIMING_TOKENS;
  for (const message of messages) {
    tokens += TOKENS_PER_MESSAGE;
    tokens += encodeFor(model, message.content);
    tokens += encodeFor(model, message.role);
  }
  return Math.ceil(tokens * model.tokenFactor);
}
