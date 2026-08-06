import { describe, expect, it } from "vitest";
import { cheapest, estimate, getModel, listModels } from "../src/index.js";

describe("catalog", () => {
  it("resolves known model ids", () => {
    expect(getModel("openai/gpt-4o").provider).toBe("openai");
  });

  it("throws a helpful error on unknown ids", () => {
    expect(() => getModel("openai/gpt-9")).toThrow(/Unknown model/);
  });
});

describe("estimate", () => {
  it("prices a text prompt against the whole catalog by default", () => {
    const results = estimate({ input: "Hello, world!" });
    expect(results).toHaveLength(listModels().length);
    for (const result of results) {
      expect(result.inputTokens).toBeGreaterThan(0);
      expect(result.totalCostUsd).toBeGreaterThan(0);
    }
  });

  it("sorts results cheapest first", () => {
    const totals = estimate({ input: "compare me" }).map((r) => r.totalCostUsd);
    expect(totals).toEqual([...totals].sort((a, b) => a - b));
  });

  it("computes cost from the model's per-million pricing", () => {
    const [result] = estimate({
      input: "hi",
      models: ["openai/gpt-4o"],
      expectedOutputTokens: 1000,
    });
    const { inputPerMillion, outputPerMillion } = result.model.pricing;
    const expected =
      (result.inputTokens / 1e6) * inputPerMillion +
      (1000 / 1e6) * outputPerMillion;
    expect(result.totalCostUsd).toBeCloseTo(expected, 12);
  });

  it("caps output tokens at the model's maximum", () => {
    const [result] = estimate({
      input: "hi",
      models: ["anthropic/claude-3.5-haiku"],
      expectedOutputTokens: 1_000_000,
    });
    expect(result.outputTokens).toBe(result.model.maxOutputTokens);
  });

  it("counts chat messages with per-message overhead", () => {
    const model = ["openai/gpt-4o"];
    const [text] = estimate({ input: "hello there", models: model });
    const [chat] = estimate({
      input: [{ role: "user", content: "hello there" }],
      models: model,
    });
    expect(chat.inputTokens).toBeGreaterThan(text.inputTokens);
  });

  it("rejects negative output token counts", () => {
    expect(() => estimate({ input: "x", expectedOutputTokens: -1 })).toThrow();
  });
});

describe("cheapest", () => {
  it("returns the lowest-cost model that fits the prompt", () => {
    const winner = cheapest({ input: "short prompt" });
    const all = estimate({ input: "short prompt" });
    expect(winner.totalCostUsd).toBe(all[0].totalCostUsd);
    expect(winner.fitsContext).toBe(true);
  });
});
