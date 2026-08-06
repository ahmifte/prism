#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { Command } from "commander";
import {
  estimate,
  listModels,
  PRICING_AS_OF,
  type ModelEstimate,
} from "@hermedion/prism-core";
import { formatUsd, renderTable } from "./table.js";

const program = new Command();

program
  .name("prism")
  .description(
    "Prism by Hermedion — know what an LLM call costs before you make it.",
  );

program
  .command("models")
  .description("List the model catalog with pricing (USD per 1M tokens)")
  .action(() => {
    const rows = listModels().map((m) => [
      m.id,
      m.displayName,
      `$${m.pricing.inputPerMillion}`,
      `$${m.pricing.outputPerMillion}`,
      m.contextWindow.toLocaleString("en-US"),
    ]);
    console.log(
      renderTable(["MODEL", "NAME", "IN /1M", "OUT /1M", "CONTEXT"], rows),
    );
    console.log(`\nPricing snapshot as of ${PRICING_AS_OF}.`);
  });

program
  .command("estimate")
  .description("Estimate the cost of a prompt on every model, cheapest first")
  .argument("[prompt...]", "prompt text (or use --file, or pipe via stdin)")
  .option("-m, --models <ids>", "comma-separated model ids (default: all)")
  .option("-o, --output-tokens <n>", "expected completion tokens", "512")
  .option("-f, --file <path>", "read the prompt from a file")
  .option("--json", "emit JSON instead of a table")
  .action((promptWords: string[], options) => {
    const prompt = resolvePrompt(promptWords, options.file);
    if (!prompt) {
      program.error("No prompt given. Pass text, --file, or pipe via stdin.");
    }
    const results = estimate({
      input: prompt,
      models: options.models?.split(",").map((id: string) => id.trim()),
      expectedOutputTokens: Number(options.outputTokens),
    });
    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
      return;
    }
    printEstimates(results);
  });

function resolvePrompt(words: string[], file?: string): string {
  if (file) return readFileSync(file, "utf8");
  if (words.length > 0) return words.join(" ");
  if (!process.stdin.isTTY) return readFileSync(0, "utf8");
  return "";
}

function printEstimates(results: ModelEstimate[]): void {
  const priciest = results[results.length - 1];
  const rows = results.map((r) => [
    r.model.id,
    r.inputTokens.toLocaleString("en-US"),
    r.outputTokens.toLocaleString("en-US"),
    formatUsd(r.totalCostUsd),
    savingsLabel(r, priciest),
    r.fitsContext ? "" : "OVER CONTEXT",
  ]);
  console.log(
    renderTable(["MODEL", "IN TOK", "OUT TOK", "EST COST", "VS PRICIEST", ""], rows),
  );
  const cheapestFit = results.find((r) => r.fitsContext);
  if (cheapestFit) {
    console.log(
      `\nCheapest: ${cheapestFit.model.id} at ${formatUsd(cheapestFit.totalCostUsd)} ` +
        `(pricing as of ${PRICING_AS_OF})`,
    );
  }
}

function savingsLabel(r: ModelEstimate, priciest: ModelEstimate): string {
  if (priciest.totalCostUsd === 0 || r === priciest) return "—";
  const saved = 1 - r.totalCostUsd / priciest.totalCostUsd;
  return `-${(saved * 100).toFixed(1)}%`;
}

program.parse();
